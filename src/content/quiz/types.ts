/**
 * The quiz content model. See docs/adr/0003-quiz-engine.md.
 *
 * Deliberately plain JSON: no functions, no components, no imports from the
 * UI. A quiz is data, so the same shape works whether it is authored as a
 * file in this folder today or read out of a Supabase row later.
 */

/** How the result is computed once the questions run out. */
export type ScoringStrategy =
  /** Heaviest outcome by accumulated weights. No right answers. */
  | "personality"
  /** Count of correct answers, graded on the server. */
  | "scored";

export type QuizOutcome = {
  /** Stable id. Referenced by option weights and encoded in shared links. */
  id: string;
  title: string;
  /** Shown on the result screen. */
  body: string;
  /** Optional flourish — a fake classification, a fake department. */
  kicker?: string;
};

export type QuizOption = {
  id: string;
  label: string;
  /**
   * Weights toward outcomes, by outcome id. Personality quizzes use these;
   * a scored quiz may also carry them, which is how a quiz can report both
   * "7 of 10" and "you are the Bureau's problem".
   */
  weights?: Record<string, number>;
  /**
   * The right answer, as a salted hash rather than a boolean.
   *
   * A boolean was fine while the repository was private; now that it is
   * public, `correct: true` in a content file is the answer key published on
   * GitHub, and stripping it before serving buys nothing. The hash is
   * `sha256(QUIZ_ANSWER_SALT | slug | questionId | optionId)`, the salt is a
   * server environment variable that is not in the repository, and grading
   * recomputes it. Generate with `bun run quiz:hash`.
   *
   * Still stripped before serving — the hash is not a secret worth handing
   * out either. See docs/adr/0003-quiz-engine.md.
   */
  correctHash?: string;
  /**
   * Jump to this question id instead of falling through to the next one in
   * order. This is the whole of branching.
   */
  next?: string;
  /** Shown after answering, on a scored quiz's review. */
  note?: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  /** Small print under the prompt. */
  help?: string;
  options: QuizOption[];
};

export type QuizDefinition = {
  slug: string;
  title: string;
  /** One line, used on the index and in the share card. */
  summary: string;
  /** Longer setup shown on the quiz's own landing state. */
  intro?: string;
  strategy: ScoringStrategy;
  /** Uppercase flavour above the title — "BUREAU INTAKE FORM 7-C". */
  formNumber?: string;
  questions: QuizQuestion[];
  outcomes: QuizOutcome[];
  /**
   * Result copy for a scored quiz, keyed by the minimum number correct.
   * The highest band whose threshold is met wins.
   */
  bands?: { minCorrect: number; outcomeId: string }[];
};

/**
 * A quiz as the browser is allowed to see it: identical, minus anything that
 * would let a reader skip the thinking.
 */
export type PublicQuizOption = Omit<QuizOption, "correctHash">;
export type PublicQuizQuestion = Omit<QuizQuestion, "options"> & {
  options: PublicQuizOption[];
};
export type PublicQuiz = Omit<QuizDefinition, "questions"> & {
  questions: PublicQuizQuestion[];
};
