import { createHash } from "node:crypto";

import type { QuizQuestion } from "@/content/quiz/types";

/**
 * The answer check for scored quizzes. Server only — importing this from a
 * component would put the salt in the browser bundle.
 *
 * The repository is public, so a content file cannot hold the answer key. It
 * holds a salted hash instead, and the salt lives in the platform
 * environment. Without the salt the hashes are not reversible from the four
 * option ids, because there is nothing to hash against; with it, grading is
 * a comparison.
 *
 * This is proportionate protection, not a vault. If the salt leaks, the four
 * candidates per question fall in microseconds. It is a joke quiz on a
 * satire site — the bar is "harder than reading the repo", which the
 * previous `correct: true` boolean did not clear.
 */

const SALT_VAR = "QUIZ_ANSWER_SALT";

export function answerHash(
  salt: string,
  slug: string,
  questionId: string,
  optionId: string,
): string {
  // Delimited so ("ab", "c") and ("a", "bc") cannot collide.
  return createHash("sha256").update([salt, slug, questionId, optionId].join("|")).digest("hex");
}

/**
 * Builds the checker the grader injects.
 *
 * Fails closed: with no salt configured, grading refuses rather than
 * quietly marking every answer wrong, which would look like a working quiz
 * that everyone fails.
 */
export function answerChecker(slug: string): (question: QuizQuestion, optionId: string) => boolean {
  const salt = process.env[SALT_VAR];
  if (!salt) {
    throw new Error(
      `${SALT_VAR} is not set, so scored quizzes cannot be graded. Set it in the ` +
        `platform environment and regenerate the hashes with \`bun run quiz:hash\`.`,
    );
  }

  return (question, optionId) => {
    const expected = question.options.find((o) => o.id === optionId)?.correctHash;
    if (!expected) return false;
    return answerHash(salt, slug, question.id, optionId) === expected;
  };
}
