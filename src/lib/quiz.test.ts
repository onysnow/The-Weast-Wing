import { describe, expect, it } from "vitest";

import { QUIZZES, quizList } from "@/content/quiz";
import { whichAgency } from "@/content/quiz/which-agency";
import type { QuizDefinition } from "@/content/quiz/types";
import {
  bandOutcome,
  decodeAnswers,
  encodeAnswers,
  gradeAnswers,
  nextQuestionId,
  personalityOutcome,
  progress,
  publicQuiz,
  tallyWeights,
  visitedQuestions,
} from "@/lib/quiz";

/** A small scored quiz with a branch, so the tests don't depend on content. */
const scored: QuizDefinition = {
  slug: "t",
  title: "T",
  summary: "s",
  strategy: "scored",
  questions: [
    {
      id: "one",
      prompt: "?",
      options: [
        { id: "a", label: "A", correct: true, weights: { x: 2 } },
        { id: "b", label: "B", next: "three" },
      ],
    },
    { id: "two", prompt: "?", options: [{ id: "a", label: "A", correct: true }] },
    { id: "three", prompt: "?", options: [{ id: "a", label: "A" }] },
  ],
  outcomes: [
    { id: "low", title: "Low", body: "" },
    { id: "high", title: "High", body: "" },
  ],
  bands: [
    { minCorrect: 0, outcomeId: "low" },
    { minCorrect: 2, outcomeId: "high" },
  ],
};

describe("publicQuiz", () => {
  it("removes every trace of the answers", () => {
    const serialized = JSON.stringify(publicQuiz(scored));
    // Asserts on absence anywhere in the output rather than on the fields the
    // test happens to know about, so a future answer-bearing field fails here
    // without anyone remembering to update this test.
    expect(serialized).not.toContain("correct");
  });

  it("keeps everything a reader needs", () => {
    const pub = publicQuiz(scored);
    expect(pub.questions).toHaveLength(3);
    expect(pub.questions[0]?.options.map((o) => o.label)).toEqual(["A", "B"]);
    expect(pub.questions[0]?.options[1]?.next).toBe("three");
    expect(pub.questions[0]?.options[0]?.weights).toEqual({ x: 2 });
  });

  it("does not mutate the authored quiz", () => {
    publicQuiz(scored);
    expect(scored.questions[0]?.options[0]?.correct).toBe(true);
  });
});

describe("traversal", () => {
  it("falls through to the next question when no branch is set", () => {
    expect(nextQuestionId(scored, "one", "a")).toBe("two");
  });

  it("follows a branch", () => {
    expect(nextQuestionId(scored, "one", "b")).toBe("three");
  });

  it("ends the quiz after the last question", () => {
    expect(nextQuestionId(scored, "three", "a")).toBeNull();
  });

  it("ends rather than throwing when a branch points at nothing", () => {
    const broken: QuizDefinition = {
      ...scored,
      questions: [{ id: "one", prompt: "?", options: [{ id: "a", label: "A", next: "ghost" }] }],
    };
    expect(nextQuestionId(broken, "one", "a")).toBeNull();
  });

  it("walks only the path the answers actually took", () => {
    const path = visitedQuestions(scored, { one: "b", three: "a" });
    expect(path.map((q) => q.id)).toEqual(["one", "three"]);
  });

  it("stops on a content loop instead of hanging", () => {
    const looped: QuizDefinition = {
      ...scored,
      questions: [
        { id: "one", prompt: "?", options: [{ id: "a", label: "A", next: "two" }] },
        { id: "two", prompt: "?", options: [{ id: "a", label: "A", next: "one" }] },
      ],
    };
    expect(visitedQuestions(looped, { one: "a", two: "a" }).map((q) => q.id)).toEqual([
      "one",
      "two",
    ]);
  });
});

describe("progress", () => {
  it("reaches full only once the path has actually ended", () => {
    const done = progress(scored, { one: "b", three: "a" });
    expect(done).toMatchObject({ answered: 2, complete: true, fraction: 1 });
  });

  it("does not read as finished while a question is still on screen", () => {
    // "one" and "two" answered puts "three" on screen, unanswered — two of
    // three, not done, even though two questions have been dealt with.
    const midway = progress(scored, { one: "a", two: "a" });
    expect(midway).toMatchObject({ answered: 2, total: 3, complete: false });
    expect(midway.fraction).toBeLessThan(1);
  });

  it("estimates the whole quiz up front, not just what has been seen", () => {
    // Nothing answered: the reader is on question 1 of a projected 3, not
    // "1 of 1", which is what counting only visited questions produced.
    expect(progress(scored, {})).toMatchObject({ answered: 0, total: 3, complete: false });
    expect(progress(whichAgency, {}).total).toBe(7);
  });

  it("shortens the estimate when a branch skips questions", () => {
    // Answering "one" with the branching option routes past "two", so the
    // projection drops from three questions to two.
    expect(progress(scored, { one: "b" }).total).toBe(2);
  });

  it("leaves room for the question in front of you", () => {
    const { answered, fraction } = progress(scored, { one: "a" });
    expect(answered).toBe(1);
    expect(fraction).toBeLessThan(1);
  });
});

describe("scoring", () => {
  it("adds weights across answers", () => {
    expect(tallyWeights(scored, { one: "a" })).toEqual({ x: 2 });
  });

  it("picks the heaviest outcome", () => {
    const outcome = personalityOutcome(
      {
        questions: [
          {
            id: "q",
            prompt: "?",
            options: [
              { id: "a", label: "A", weights: { low: 1 } },
              { id: "b", label: "B", weights: { high: 5 } },
            ],
          },
        ],
        outcomes: scored.outcomes,
      },
      { q: "b" },
    );
    expect(outcome?.id).toBe("high");
  });

  it("breaks ties by declaration order, so a shared link is stable", () => {
    const outcome = personalityOutcome({ questions: [], outcomes: scored.outcomes }, {});
    expect(outcome?.id).toBe("low");
  });

  it("grades against the authored answers", () => {
    expect(gradeAnswers(scored, { one: "a", two: "a" })).toEqual({
      correctCount: 2,
      answered: 2,
    });
    expect(gradeAnswers(scored, { one: "b" })).toEqual({ correctCount: 0, answered: 1 });
  });

  it("picks the highest band the score reaches", () => {
    expect(bandOutcome(scored, 2)?.id).toBe("high");
    expect(bandOutcome(scored, 1)?.id).toBe("low");
  });
});

describe("shareable links", () => {
  it("round-trips an answer set", () => {
    const answers = { one: "b", three: "a" };
    const encoded = encodeAnswers(scored, answers);
    expect(decodeAnswers(scored, encoded)).toEqual(answers);
  });

  it("marks skipped questions and trims the tail", () => {
    // "one" answered with option index 1, "two" skipped by the branch,
    // "three" answered with index 0.
    expect(encodeAnswers(scored, { one: "b", three: "a" })).toBe("1-0");
    expect(encodeAnswers(scored, { one: "a" })).toBe("0");
  });

  it("ignores a string longer than the quiz rather than throwing", () => {
    expect(decodeAnswers(scored, "000000000")).toEqual({ one: "a", two: "a", three: "a" });
  });

  it("ignores an option index that does not exist", () => {
    expect(decodeAnswers(scored, "z")).toEqual({});
  });

  it("stays stable for a real published quiz", () => {
    const answers = { q1: "b", q2: "c", "q3-method": "c", q4: "b", q5: "c", q6: "b", q7: "b" };
    const encoded = encodeAnswers(whichAgency, answers);
    expect(decodeAnswers(whichAgency, encoded)).toEqual(answers);
    expect(personalityOutcome(whichAgency, answers)?.id).toBe("bea");
  });
});

describe("published quizzes", () => {
  it.each(quizList())("$slug is internally consistent", (quiz) => {
    const questionIds = new Set(quiz.questions.map((q) => q.id));
    const outcomeIds = new Set(quiz.outcomes.map((o) => o.id));

    expect(questionIds.size).toBe(quiz.questions.length);
    expect(outcomeIds.size).toBe(quiz.outcomes.length);

    for (const question of quiz.questions) {
      expect(question.options.length).toBeGreaterThan(1);
      const optionIds = new Set(question.options.map((o) => o.id));
      expect(optionIds.size).toBe(question.options.length);

      for (const option of question.options) {
        if (option.next) expect(questionIds).toContain(option.next);
        for (const outcomeId of Object.keys(option.weights ?? {})) {
          expect(outcomeIds).toContain(outcomeId);
        }
      }
    }

    for (const band of quiz.bands ?? []) expect(outcomeIds).toContain(band.outcomeId);
    if (quiz.strategy === "scored") expect(quiz.bands?.length).toBeGreaterThan(0);
  });

  it("every outcome is reachable — no dead result copy", () => {
    for (const quiz of quizList()) {
      if (quiz.strategy !== "personality") continue;
      const weighted = new Set(
        quiz.questions.flatMap((q) => q.options.flatMap((o) => Object.keys(o.weights ?? {}))),
      );
      for (const outcome of quiz.outcomes) expect(weighted).toContain(outcome.id);
    }
  });

  /**
   * Shared result links encode answers by question position, so reordering
   * or removing a question changes what every link already in the wild
   * decodes to. This pins the published order: adding a question at the end
   * is fine and updates this list; any other edit should fail here and make
   * someone think.
   */
  it("which-agency keeps its published question order", () => {
    expect(QUIZZES["which-agency"]?.questions.map((q) => q.id)).toEqual([
      "q1",
      "q2",
      "q3-method",
      "q4",
      "q5",
      "q6",
      "q7",
    ]);
  });
});
