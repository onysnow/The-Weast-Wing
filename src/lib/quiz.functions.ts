import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { findQuiz } from "@/content/quiz";
import { bandOutcome, gradeAnswers } from "@/lib/quiz";

const gradeInput = z.object({
  slug: z.string().min(1).max(120),
  // Question id -> option id. Bounded so a crafted payload cannot make the
  // server walk something enormous.
  answers: z.record(z.string().max(120), z.string().max(120)),
});

/**
 * Grades a scored quiz.
 *
 * This exists because the right answers must not reach the browser: the
 * public quiz is stripped of `correct` before it is served (see
 * `publicQuiz`), so grading has to happen where the authored definition
 * still lives. A personality quiz needs none of this and grades on the
 * client — its weights are the joke, not a secret.
 */
export const gradeQuiz = createServerFn({ method: "POST" })
  .inputValidator((input) => gradeInput.parse(input))
  .handler(async ({ data }) => {
    const quiz = findQuiz(data.slug);
    if (!quiz) throw new Error("No such quiz.");
    if (quiz.strategy !== "scored") throw new Error("That quiz is not graded.");

    const { correctCount, answered } = gradeAnswers(quiz, data.answers);
    const outcome = bandOutcome(quiz, correctCount);

    return {
      correctCount,
      answered,
      total: quiz.questions.length,
      outcome,
      // Per-question review, so the result screen can show what was missed
      // without the client ever having held the answer key in advance.
      review: quiz.questions.map((question) => {
        const chosen = data.answers[question.id];
        const correctOption = question.options.find((o) => o.correct);
        return {
          questionId: question.id,
          prompt: question.prompt,
          chosenId: chosen ?? null,
          correctId: correctOption?.id ?? null,
          correctLabel: correctOption?.label ?? null,
          note: question.options.find((o) => o.id === chosen)?.note ?? null,
          wasCorrect: Boolean(chosen && chosen === correctOption?.id),
        };
      }),
    };
  });
