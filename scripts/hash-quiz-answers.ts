/**
 * Prints `correctHash` values for a scored quiz.
 *
 * The repository is public, so a scored quiz cannot store `correct: true` —
 * that is the answer key on GitHub. It stores a salted hash instead, and
 * this generates them.
 *
 *   QUIZ_ANSWER_SALT=<the salt> bun run quiz:hash <slug> <questionId>=<optionId> ...
 *
 * Example:
 *   QUIZ_ANSWER_SALT=$SALT bun run quiz:hash press-trivia q1=c q2=a
 *
 * Paste each hash onto the winning option in the content file. The salt must
 * match the one in the platform environment, and changing it invalidates
 * every hash already committed.
 */
import { answerHash } from "../src/lib/quiz-answers.server";

const [slug, ...pairs] = process.argv.slice(2);
const salt = process.env["QUIZ_ANSWER_SALT"];

if (!salt || !slug || pairs.length === 0) {
  console.error(
    "usage: QUIZ_ANSWER_SALT=<salt> bun run quiz:hash <slug> <questionId>=<optionId> ...",
  );
  process.exit(1);
}

for (const pair of pairs) {
  const [questionId, optionId] = pair.split("=");
  if (!questionId || !optionId) {
    console.error(`skipping "${pair}" — expected questionId=optionId`);
    continue;
  }
  console.log(`${questionId} -> ${optionId}`);
  console.log(`  correctHash: "${answerHash(salt, slug, questionId, optionId)}",`);
}
