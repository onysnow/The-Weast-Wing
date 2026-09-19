import { createFileRoute, Link } from "@tanstack/react-router";

import { Seal } from "@/components/brand/seal";
import { SatireChip } from "@/components/brand/satire-chip";
import { StructuredData, siteStructuredData } from "@/components/seo/structured-data";

const TITLE = "Disclaimer — The Weast Wing";
const DESCRIPTION =
  "The Weast Wing is a work of satire. Every agency, official statement and quotation on this site is invented. This page states plainly what is fiction, what is sourced, and how to reach a human.";

export const Route = createFileRoute("/disclaimer")({
  component: DisclaimerPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://theweastwing.com/disclaimer" },
      { property: "og:image", content: "https://theweastwing.com/og-default.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: "https://theweastwing.com/og-default.png" },
    ],
    links: [{ rel: "canonical", href: "https://theweastwing.com/disclaimer" }],
  }),
});

/**
 * The page every other satire signal points at.
 *
 * Written plainly and without the bit: a reader who has arrived here is
 * checking whether something they saw is real, and the joke would be actively
 * unhelpful. It is also the page to send anyone who has misread the site, and
 * the one a platform's reviewer will look for.
 */
function DisclaimerPage() {
  return (
    <>
      <StructuredData data={siteStructuredData()} />

      <main>
        <section className="on-navy border-b-4 border-accent bg-primary text-primary-foreground">
          <div className="mx-auto flex max-w-4xl flex-col items-start gap-5 px-4 py-10 sm:flex-row sm:items-center">
            <Seal className="size-20 shrink-0 text-seal sm:size-24" />
            <div>
              <SatireChip tone="dark" />
              <h1 className="mt-2 font-display text-3xl font-black uppercase leading-tight sm:text-5xl">
                This site is fiction
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-primary-foreground/80 sm:text-base">
                The Weast Wing is a work of political satire. It is not a news organization, not a
                government agency, and not affiliated with, endorsed by or connected to any
                government, agency or official.
              </p>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-2xl space-y-8 px-4 py-12">
          <Clause title="What is invented">
            <p>
              Every agency on this site is made up. The Presidential Office of Shitistics and the
              Bureau of Executive Anomalies do not exist. Every &ldquo;official response&rdquo; is
              written by us and attributed to no real person or office, and no quotation on this
              site was ever said by anyone. Job titles, seals, file numbers, form numbers and the
              office address are all part of the joke.
            </p>
          </Clause>

          <Clause title="What is sourced, and what that does and does not mean">
            <p>
              Each incident file links to publicly reported material — a news report, a video, an
              official event record. Those links are real, and the events they describe took place.
              What is <em>not</em> established is the bodily-incident claim itself: it is an
              allegation circulated publicly, presented here as an allegation, and nothing on this
              site should be read as an assertion that it happened.
            </p>
            <p>
              The research dossier on each file separates the two: what is established, and what is
              commentary.
            </p>
          </Clause>

          <Clause title="Polls and reader submissions">
            <p>
              The polls measure what visitors to a satire site clicked. They are not surveys, not
              samples of anything, and not evidence. Reader-submitted reports are held for editorial
              review and never appear automatically.
            </p>
          </Clause>

          <Clause title="Corrections">
            <p>
              If something on this site is wrong about a real, checkable fact — a date, a link, a
              description of a real event — tell us and it will be corrected or removed. Satire is
              not a defence for getting a fact wrong, and a correction is not an admission that the
              joke was unfunny, only that the fact was.
            </p>
          </Clause>

          <Clause title="If you are here because something was mistaken for real">
            <p>
              That is what this page is for. Send the link you saw, and we will look at whether the
              satire marking on that page needs to be louder. Every card and article carries a
              SATIRE mark, the header carries one at every scroll position, and the share images are
              marked so the label travels with the link — but if something got past all of that, we
              want to know.
            </p>
          </Clause>

          <Clause title="Takedowns and contact">
            <p>
              For a correction, a takedown request, or any question about this site, use the
              incident report form on the{" "}
              <Link to="/" className="text-accent underline underline-offset-4">
                home page
              </Link>{" "}
              and say in the description that it is a contact request. Messages are read by a
              person. Optional contact details are never published.
            </p>
          </Clause>

          <p className="border-l-4 border-accent bg-muted p-5 text-sm leading-relaxed text-muted-foreground">
            Short version: nothing here is a statement of fact about any real person. It is a joke
            about how institutions talk when they are defending something indefensible.
          </p>
        </div>
      </main>

      <footer className="on-navy border-t-4 border-accent bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-8">
          <Seal className="size-10 shrink-0 text-seal" />
          <div>
            <p className="font-display text-sm font-bold uppercase">The Weast Wing</p>
            <p className="text-xs text-primary-foreground/65">
              A satirical publication. No authority claimed.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

function Clause({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="border-b-2 border-primary pb-2 font-display text-lg font-bold uppercase tracking-tight">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}
