import { createFileRoute, Link } from "@tanstack/react-router";

import { Seal } from "@/components/brand/seal";
import { quizList } from "@/content/quiz";

const TITLE = "Screenings — The Weast Wing";
const DESCRIPTION =
  "Aptitude screenings, classification questionnaires and intake forms issued by the Presidential Office of Shitistics.";

export const Route = createFileRoute("/quiz/")({
  loader: () =>
    // Only what the index renders: no questions, so no answer key, and a
    // much smaller payload than shipping every quiz to list three titles.
    quizList().map(({ slug, title, summary, formNumber, questions }) => ({
      slug,
      title,
      summary,
      formNumber,
      questionCount: questions.length,
    })),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://theweastwing.com/quiz" },
      { property: "og:image", content: "https://theweastwing.com/og-default.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: "https://theweastwing.com/og-default.png" },
    ],
    links: [{ rel: "canonical", href: "https://theweastwing.com/quiz" }],
  }),
  component: QuizIndex,
});

function QuizIndex() {
  const quizzes = Route.useLoaderData();

  return (
    <main>
      <section className="on-navy border-b-4 border-accent bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-9">
          <Seal className="size-14 shrink-0 text-seal" />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-on-dark">
              Office of Classification
            </p>
            <h1 className="mt-1 font-display text-3xl font-black uppercase leading-tight sm:text-4xl">
              Screenings
            </h1>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">{DESCRIPTION}</p>

        <ul className="mt-6 space-y-3">
          {quizzes.map((quiz) => (
            <li key={quiz.slug}>
              <Link
                to="/quiz/$slug"
                params={{ slug: quiz.slug }}
                className="block border border-border bg-card p-5 transition-colors hover:border-primary/35 hover:bg-muted"
              >
                {quiz.formNumber && (
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {quiz.formNumber}
                  </p>
                )}
                <p className="mt-1 font-display text-xl font-bold leading-snug">{quiz.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{quiz.summary}</p>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                  {quiz.questionCount} questions →
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
