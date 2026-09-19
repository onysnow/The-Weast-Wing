import type {
  PublicQuiz,
  PublicQuizQuestion,
  QuizDefinition,
  QuizOutcome,
} from "@/content/quiz/types";

/**
 * Quiz logic, kept pure and away from React so it can be tested directly and
 * reused on the server, where grading happens. See
 * docs/adr/0003-quiz-engine.md.
 */

/* --------------------------- Serving a quiz ------------------------------ */

/**
 * Strips everything the browser must not see.
 *
 * The single choke point: a future field that leaks an answer gets deleted
 * here and nowhere else. The test asserts the *absence* of "correct"
 * anywhere in the serialized output rather than checking the fields it knows
 * about, so a new leak fails without anyone remembering to update the test.
 *
 * Note what this does and does not buy on a public repository. It keeps the
 * answer out of the page source, which stops view-source; it cannot keep
 * anything out of the content file, which is why the answer is stored as a
 * salted hash rather than a boolean.
 */
export function publicQuiz(quiz: QuizDefinition): PublicQuiz {
  return {
    ...quiz,
    questions: quiz.questions.map((question) => ({
      ...question,
      options: question.options.map(({ correctHash: _hash, ...option }) => option),
    })),
  };
}

/* ------------------------------ Traversal -------------------------------- */

/**
 * The next question after answering `questionId` with `optionId`, or null at
 * the end.
 *
 * One rule for all three shapes: follow the option's `next` if it has one,
 * otherwise fall through to the following question in order. A quiz with no
 * branches is just a quiz where no option sets `next`.
 */
export function nextQuestionId(
  quiz: Pick<PublicQuiz, "questions">,
  questionId: string,
  optionId: string,
): string | null {
  const index = quiz.questions.findIndex((q) => q.id === questionId);
  if (index === -1) return null;
  const question = quiz.questions[index];
  const option = question?.options.find((o) => o.id === optionId);
  if (option?.next) {
    // A `next` pointing at a question that does not exist ends the quiz
    // rather than throwing: a typo in content should not white-screen a
    // reader mid-quiz.
    return quiz.questions.some((q) => q.id === option.next) ? option.next : null;
  }
  return quiz.questions[index + 1]?.id ?? null;
}

/**
 * The questions a given answer path actually visited, in order.
 *
 * Branching means "question 4 of 12" is a lie — the reader may never see
 * four of them. This walks the path taken so progress can be reported
 * against the route through the quiz rather than its total length.
 */
export function visitedQuestions(
  quiz: Pick<PublicQuiz, "questions">,
  answers: Record<string, string>,
): PublicQuizQuestion[] {
  const path: PublicQuizQuestion[] = [];
  const seen = new Set<string>();
  let currentId: string | null = quiz.questions[0]?.id ?? null;

  while (currentId) {
    // A content loop (A -> B -> A) would hang the render. Stop instead.
    if (seen.has(currentId)) break;
    seen.add(currentId);
    const question = quiz.questions.find((q) => q.id === currentId);
    if (!question) break;
    path.push(question);
    const answer = answers[currentId];
    if (!answer) break;
    currentId = nextQuestionId(quiz, currentId, answer);
  }

  return path;
}

/**
 * How many questions this reader is likely to see in total.
 *
 * Branching means the real length is not known until the end, but counting
 * only what has been visited so far reads as "Question 1 of 1" on the first
 * screen, which is worse than an estimate. So: walk the answered path, then
 * keep walking past the current question in declaration order, as if nothing
 * else branched. That is exact for a linear quiz and a good estimate for a
 * branching one, and it only ever grows — which is why the progress bar
 * animates its width rather than jumping.
 */
function projectedLength(
  quiz: Pick<PublicQuiz, "questions">,
  answers: Record<string, string>,
): number {
  const seen = new Set<string>();
  let currentId: string | null = quiz.questions[0]?.id ?? null;
  let count = 0;

  while (currentId && !seen.has(currentId)) {
    seen.add(currentId);
    count += 1;
    const index = quiz.questions.findIndex((q) => q.id === currentId);
    if (index === -1) break;
    const answer = answers[currentId];
    currentId = answer
      ? nextQuestionId(quiz, currentId, answer)
      : // Unanswered from here on: assume no further branching.
        (quiz.questions[index + 1]?.id ?? null);
  }

  return Math.max(count, 1);
}

/**
 * How far along a reader is.
 *
 * `complete` is the honest end-of-quiz signal: the last question on the path
 * is answered and leads nowhere. Until then the bar is deliberately short of
 * full, so it never reads 100% while a question is still on screen.
 */
export function progress(
  quiz: Pick<PublicQuiz, "questions">,
  answers: Record<string, string>,
): { answered: number; total: number; fraction: number; complete: boolean } {
  const path = visitedQuestions(quiz, answers);
  const answered = path.filter((q) => answers[q.id]).length;

  const last = path[path.length - 1];
  const lastAnswer = last ? answers[last.id] : undefined;
  const complete = Boolean(last && lastAnswer && !nextQuestionId(quiz, last.id, lastAnswer));

  const total = complete
    ? Math.max(answered, 1)
    : Math.max(projectedLength(quiz, answers), answered + 1);
  return { answered, total, fraction: Math.min(1, answered / total), complete };
}

/* ------------------------------- Scoring --------------------------------- */

/** Accumulated weight per outcome id. */
export function tallyWeights(
  quiz: Pick<PublicQuiz, "questions">,
  answers: Record<string, string>,
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const question of quiz.questions) {
    const chosen = answers[question.id];
    if (!chosen) continue;
    const option = question.options.find((o) => o.id === chosen);
    if (!option?.weights) continue;
    for (const [outcomeId, weight] of Object.entries(option.weights)) {
      totals[outcomeId] = (totals[outcomeId] ?? 0) + weight;
    }
  }
  return totals;
}

/**
 * The winning outcome of a personality quiz.
 *
 * Ties break by the order outcomes are declared in the content file, which
 * makes the result deterministic — the same answers always produce the same
 * outcome, which a shareable link depends on.
 */
export function personalityOutcome(
  quiz: Pick<PublicQuiz, "questions" | "outcomes">,
  answers: Record<string, string>,
): QuizOutcome | null {
  const totals = tallyWeights(quiz, answers);
  let best: QuizOutcome | null = null;
  let bestScore = -Infinity;
  for (const outcome of quiz.outcomes) {
    const score = totals[outcome.id] ?? 0;
    if (score > bestScore) {
      best = outcome;
      bestScore = score;
    }
  }
  return best;
}

/**
 * The outcome for a scored quiz, given how many were right. Server-side
 * only — `correctCount` comes from grading, never from the client.
 */
export function bandOutcome(
  quiz: Pick<QuizDefinition, "outcomes" | "bands">,
  correctCount: number,
): QuizOutcome | null {
  if (!quiz.bands?.length) return null;
  const band = [...quiz.bands]
    .sort((a, b) => b.minCorrect - a.minCorrect)
    .find((b) => correctCount >= b.minCorrect);
  return quiz.outcomes.find((o) => o.id === band?.outcomeId) ?? null;
}

/**
 * Counts correct answers.
 *
 * `isCorrect` is injected rather than read from the option, because deciding
 * whether an answer is right now needs a secret salt and a hash — and this
 * module stays pure, dependency-free and testable without either. The server
 * passes the real check; a test passes a fake one.
 */
export function gradeAnswers(
  quiz: Pick<QuizDefinition, "questions">,
  answers: Record<string, string>,
  isCorrect: (question: QuizDefinition["questions"][number], optionId: string) => boolean,
): { correctCount: number; answered: number } {
  let correctCount = 0;
  let answered = 0;
  for (const question of quiz.questions) {
    const chosen = answers[question.id];
    if (!chosen) continue;
    answered += 1;
    if (isCorrect(question, chosen)) correctCount += 1;
  }
  return { correctCount, answered };
}

/* ---------------------------- Shareable links ---------------------------- */

/**
 * Answers <-> a compact query string.
 *
 * Positional and base36: one character per answered question, in the order
 * the questions are declared, `-` for one that was skipped by a branch. A
 * twenty-question quiz is a twenty-character string, which survives being
 * pasted into anything.
 *
 * Because the encoding is positional, a published quiz's questions are
 * append-only — reordering them silently changes what every shared link
 * decodes to. The ADR says so and a test pins the ids.
 */
export function encodeAnswers(
  quiz: Pick<PublicQuiz, "questions">,
  answers: Record<string, string>,
): string {
  return (
    quiz.questions
      .map((question) => {
        const chosen = answers[question.id];
        if (!chosen) return "-";
        const index = question.options.findIndex((o) => o.id === chosen);
        return index === -1 ? "-" : index.toString(36);
      })
      .join("")
      // A trailing run of unanswered questions carries no information.
      .replace(/-+$/, "")
  );
}

export function decodeAnswers(
  quiz: Pick<PublicQuiz, "questions">,
  encoded: string,
): Record<string, string> {
  const answers: Record<string, string> = {};
  for (const [index, character] of [...encoded].entries()) {
    if (character === "-") continue;
    const question = quiz.questions[index];
    if (!question) break;
    const option = question.options[parseInt(character, 36)];
    if (option) answers[question.id] = option.id;
  }
  return answers;
}
