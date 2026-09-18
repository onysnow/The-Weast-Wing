import { createFileRoute } from "@tanstack/react-router";

import { BEASeal } from "@/components/brand/bea-seal";

const TITLE = "Bureau of Executive Anomalies — The Weast Wing";
const DESCRIPTION =
  "The independent Bureau of Executive Anomalies, a fictional agency within The Weast Wing.";

export const Route = createFileRoute("/bea")({
  component: BEAPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://theweastwing.com/bea" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "https://theweastwing.com/bea" }],
  }),
});

function BEAPage() {
  return (
    <>
      <main>
        <section className="border-b-4 border-accent bg-primary text-primary-foreground">
          <div className="mx-auto flex max-w-4xl flex-col items-start gap-5 px-4 py-10 sm:flex-row sm:items-center">
            <BEASeal className="size-20 shrink-0 text-seal sm:size-24" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-on-dark">
                Independent Agency
              </p>
              <h1 className="mt-1 font-display text-3xl font-black uppercase leading-tight sm:text-5xl">
                Bureau of Executive Anomalies
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-primary-foreground/75 sm:text-base">
                A separate Weast Wing bureau chartered to explain away matters
                outside the jurisdiction of presidential incident statistics.
                Explanations are issued with total confidence and reviewed by no one.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-12">
          <div className="border-b-2 border-primary pb-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
              Bureau Notice
            </p>
            <h2 className="font-display text-xl font-bold uppercase tracking-tight sm:text-2xl">
              Records Pending Classification
            </h2>
          </div>
          <p className="max-w-2xl border-l-4 border-accent bg-muted p-5 text-sm leading-relaxed text-muted-foreground">
            BEA records will appear here when formally catalogued. POS incident
            counts and streaks remain under the Presidential Office of
            Shitistics and are not BEA statistics.
          </p>
        </section>
      </main>

      <footer className="border-t-4 border-accent bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-8">
          <BEASeal className="size-10 shrink-0 text-seal" />
          <div>
            <p className="font-display text-sm font-bold uppercase">The Weast Wing</p>
            <p className="text-xs text-primary-foreground/65">
              A fictional bureau. No authority claimed.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
