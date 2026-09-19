import type { QuizDefinition } from "@/content/quiz/types";
import { whichAgency } from "@/content/quiz/which-agency";

/**
 * Every published quiz, by slug.
 *
 * The one place a route or a server function looks a quiz up, so moving
 * quizzes into Supabase later means changing this file and nothing else.
 */
export const QUIZZES: Record<string, QuizDefinition> = {
  [whichAgency.slug]: whichAgency,
};

export const quizList = (): QuizDefinition[] => Object.values(QUIZZES);

export const findQuiz = (slug: string): QuizDefinition | undefined => QUIZZES[slug];
