import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { Seal } from "@/components/brand/seal";
import { Button } from "@/components/ui/button";
import { findQuiz } from "@/content/quiz";
import { QuizRunner } from "@/features/quiz/quiz-runner";
import { publicQuiz } from "@/lib/quiz";

export const Route = createFileRoute("/quiz/$slug")({
  // Resolved here rather than in the component so the answer key is stripped
  // before anything reaches the browser — the loader runs on the server for
  // the first paint, and `publicQuiz` is the one choke point that removes it.
  loader: ({ params }) => {
    const quiz = findQuiz(params.slug);
    if (!quiz) throw notFound();
    return { quiz: publicQuiz(quiz) };
  },
  head: ({ loaderData }) => {
    const quiz = loaderData?.quiz;
    const title = quiz ? `${quiz.title} — The Weast Wing` : "Screening — The Weast Wing";
    const description = quiz?.summary ?? "A Weast Wing screening.";
    const url = quiz ? `https://theweastwing.com/quiz/${quiz.slug}` : "https://theweastwing.com/";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { property: "og:image", content: "https://theweastwing.com/og-default.png" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: "https://theweastwing.com/og-default.png" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: QuizPage,
});

function QuizPage() {
  const { quiz } = Route.useLoaderData();

  return (
    <main>
      <section className="on-navy border-b-4 border-accent bg-primary text-primary-foreground">
        <div className="mx-auto max-w-2xl px-4 py-9">
          <div className="flex items-center gap-3">
            <Seal className="size-10 shrink-0 text-seal" />
            <div>
              {quiz.formNumber && (
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-on-dark">
                  {quiz.formNumber}
                </p>
              )}
              <p className="font-display text-sm font-bold uppercase leading-tight">
                Presidential Office of Shitistics
              </p>
            </div>
          </div>
          <h1 className="mt-5 font-display text-3xl font-black uppercase leading-tight sm:text-4xl">
            {quiz.title}
          </h1>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-primary-foreground/80">
            {quiz.summary}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-4 py-8">
        <QuizRunner quiz={quiz} />

        <Button asChild variant="link" className="mt-6 px-0">
          <Link to="/quiz">← All screenings</Link>
        </Button>
      </div>
    </main>
  );
}
