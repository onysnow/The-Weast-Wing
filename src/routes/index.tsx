import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Seal } from "@/components/brand/seal";
import { AdSlot } from "@/components/primitives/ad-slot";
import { Modal } from "@/components/primitives/modal";
import { Reveal } from "@/components/primitives/reveal";
import { ShareBar } from "@/components/primitives/share-bar";

import { IncidentSubmissionForm } from "@/components/community";
import { IncidentCard } from "@/features/incidents/incident-card";
import {
  StructuredData,
  satiricalArticleStructuredData,
  siteStructuredData,
} from "@/components/seo/structured-data";
import { Button } from "@/components/ui/button";
import {
  computeStats,
  formatDate,
  latestIncident,
  siteYear,
  sortedIncidents,
} from "@/lib/incident-stats";
import { useMotionState } from "@/lib/motion-preference";

const SITE_NAME = "The Weast Wing";
const HERO_HEADLINE = "Days Since the President Allegedly Shit Himself";
const DESC =
  "An unofficial, entirely satirical public dashboard tracking the days since the last alleged presidential incident. All entries are sourced public allegations; the alleged bodily incidents are not established facts.";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: `${SITE_NAME} — ${HERO_HEADLINE}` },
      { name: "description", content: DESC },
      { property: "og:title", content: `${SITE_NAME} — ${HERO_HEADLINE}` },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://theweastwing.com/" },
      { property: "og:image", content: "https://theweastwing.com/og-default.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "The Weast Wing, marked SATIRE" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: `${SITE_NAME} — ${HERO_HEADLINE}` },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: "https://theweastwing.com/og-default.png" },
    ],
    links: [{ rel: "canonical", href: "https://theweastwing.com/" }],
  }),
});

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Index() {
  const [now, setNow] = useState(() => Date.now());
  const [modal, setModal] = useState<string | null>(null);
  const motion = useMotionState();
  const heroVideo = useRef<HTMLVideoElement>(null);

  // The hero loop is ambient decoration, so it follows the site-wide motion
  // switch (which itself seeds from prefers-reduced-motion).
  useEffect(() => {
    const video = heroVideo.current;
    if (!video) return;
    if (motion === "paused") {
      video.pause();
    } else {
      void video.play().catch(() => {
        /* autoplay refused — the poster frame stands in */
      });
    }
  }, [motion]);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const stats = useMemo(() => computeStats(now), [now]);
  const latest = latestIncident;
  const [displayedStreak, setDisplayedStreak] = useState(99);

  useEffect(() => {
    const target = stats.currentStreak;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayedStreak(target);
      return;
    }

    const start = Math.max(99, target);
    const duration = 950;
    const startedAt = performance.now();
    let frame = 0;
    const tick = (time: number) => {
      const progress = Math.min(1, (time - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayedStreak(Math.round(start + (target - start) * eased));
      if (progress < 1) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [stats.currentStreak]);

  return (
    <>
      {/* Declared as satire in the markup as well as on the page: schema.org
          has a real SatiricalArticle type, and a crawler should not have to
          infer it from the prose. */}
      <StructuredData data={siteStructuredData()} />
      {latest && (
        <StructuredData
          data={satiricalArticleStructuredData({
            headline: latest.title,
            description: latest.summary,
            url: `https://theweastwing.com/#incident-${latest.slug}`,
            datePublished: latest.date,
            image: "https://theweastwing.com/og-default.png",
          })}
        />
      )}

      <main>
        {/* Hero — full-screen background video with the counter on top */}
        <section
          id="hero"
          className="on-navy relative flex min-h-[100svh] scroll-mt-20 items-center justify-center overflow-hidden border-b-4 border-accent bg-primary text-primary-foreground"
        >
          <video
            ref={heroVideo}
            className="pointer-events-none absolute inset-0 size-full object-cover"
            src="/hero-weast.mp4"
            poster="/hero-weast-poster.jpg"
            autoPlay={motion === "running"}
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
            tabIndex={-1}
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/85 via-primary/55 to-primary"
            aria-hidden="true"
          />

          <div className="relative z-10 mx-auto w-full max-w-4xl px-4 py-12 text-center lg:max-w-6xl lg:px-10">
            <div className="mx-auto mb-5 flex max-w-xl items-center justify-center gap-3 border-b border-primary-foreground/25 pb-4 text-left lg:max-w-2xl">
              <Seal className="size-10 shrink-0 text-seal" />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-accent-on-dark">
                  Office of the President
                </p>
                <p className="font-display text-sm font-bold uppercase leading-tight sm:text-base">
                  Presidential Office of Shitistics
                </p>
              </div>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-foreground/80">
              Current Reporting Period
            </p>
            <div
              className="my-2 font-display text-[26vw] font-black leading-[0.85] tabular-nums drop-shadow-[0_4px_18px_rgba(0,0,0,0.45)] sm:text-[10rem] lg:text-[13rem]"
              aria-hidden="true"
            >
              {displayedStreak}
            </div>
            <span className="sr-only">{stats.currentStreak} days</span>
            <h1 className="mx-auto max-w-xl font-display text-base font-bold uppercase leading-snug tracking-wide sm:text-2xl lg:max-w-3xl lg:text-3xl">
              {HERO_HEADLINE}
            </h1>

            <dl className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-px overflow-hidden border border-primary-foreground/25 bg-primary-foreground/25 text-left backdrop-blur-sm lg:max-w-2xl">
              <div className="bg-primary/85 px-3 py-2">
                <dt className="text-[10px] uppercase tracking-[0.14em] text-primary-foreground/70">
                  Previous record
                </dt>
                <dd className="font-display text-lg font-bold tabular-nums">
                  {stats.previousRecord} days
                </dd>
              </div>
              <div className="bg-primary/85 px-3 py-2">
                <dt className="text-[10px] uppercase tracking-[0.14em] text-primary-foreground/70">
                  Last alleged incident
                </dt>
                <dd className="font-display text-lg font-bold">
                  {latest ? formatDate(latest.date) : "—"}
                </dd>
              </div>
            </dl>

            <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-primary-foreground/60">
              ▲ Compiled by the Presidential Office of Shitistics (POS)
            </p>
            <p className="mx-auto mt-3 max-w-md text-xs italic leading-relaxed text-primary-foreground/80">
              The Weast Wing's mission: defend the President and his administration — earnestly,
              officially, and not particularly well.
            </p>

            <Button
              variant="accent"
              size="block"
              onClick={() => scrollToId("what-reset-the-clock")}
              className="mt-6 max-w-md"
            >
              What reset the clock? ↓
            </Button>
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-4">
          <AdSlot label="Advertisement" />

          {/* Featured incident */}
          <section id="what-reset-the-clock" className="scroll-mt-20">
            <SectionHeading eyebrow="Featured Report" title="What Reset the Clock?" />
            {latest ? (
              <IncidentCard
                incident={latest}
                variant="featured"
                shareTitle={`${stats.currentStreak} days since the last alleged incident`}
              />
            ) : (
              <p className="text-muted-foreground">No incidents on record.</p>
            )}
          </section>

          {/* Statistics */}
          <section id="statistics" className="mt-12 scroll-mt-20">
            <div className="mb-4 flex items-center gap-3 border-b-2 border-primary pb-2">
              <Seal className="size-10 shrink-0 text-primary" />
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                  POS | Presidential Office of Shitistics
                </p>
                <h2 className="font-display text-xl font-bold uppercase tracking-tight sm:text-2xl">
                  Incident Data & Analytics
                </h2>
              </div>
            </div>
            <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
              Compiled and maintained by the Presidential Office of Shitistics (POS). All figures
              are auto-calculated from the allegation review queue below.
            </p>
            <div className="grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3">
              <Stat label="Total alleged incidents" value={stats.total} />
              <Stat label="Current streak (days)" value={stats.currentStreak} />
              <Stat label="Longest streak (days)" value={stats.longestStreak} />
              <Stat label="Avg. days between" value={stats.averageGap} />
              <Stat label="Incidents this year" value={stats.thisYear} />
              <Stat label="Confirmed incidents" value={0} />
            </div>
            <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              ▲ POS incident data · Not a real government agency · Figures are satirical
            </p>
          </section>

          <AdSlot label="Advertisement" />

          {/* Incident log */}
          <section id="incident-log" className="mt-6 scroll-mt-20">
            <SectionHeading eyebrow="Public Record" title="The Incident Log" />
            <ol className="space-y-4">
              {sortedIncidents.map((inc, i) => (
                <li key={inc.slug}>
                  <Reveal>
                    <IncidentCard
                      incident={inc}
                      variant="log"
                      fileNumber={sortedIncidents.length - i}
                    />
                  </Reveal>
                  {i === 1 && <AdSlot label="Advertisement" />}
                </li>
              ))}
            </ol>
          </section>

          {/* Public submissions */}
          <section id="submit-report" className="mt-12 scroll-mt-20">
            <SectionHeading eyebrow="Public Tip Line" title="Submit an Incident Report" />
            <p className="mb-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Send the editorial desk an alleged incident and a supporting link. Every submission is
              reviewed before it can be added to the public log.
            </p>
            <IncidentSubmissionForm />
          </section>

          {/* Share */}
          <section className="mt-12 border border-border bg-card p-5">
            <h2 className="font-display text-lg font-bold uppercase tracking-tight">
              Share the Clock
            </h2>
            <p className="mb-3 mt-1 text-sm text-muted-foreground">
              Distribute this public service resource responsibly.
            </p>
            <ShareBar title={`${stats.currentStreak} days since the last alleged incident`} />
          </section>

          <aside className="mt-4 border-l-4 border-seal bg-muted p-4 sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div>
              <p className="font-display text-sm font-bold uppercase">
                Put your money where your poll is?
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Check Kalshi for any independently listed related prediction markets. This site is
                not affiliated with Kalshi and does not offer wagering.
              </p>
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:mt-0 sm:flex-row">
              <Button asChild variant="outline">
                <a href="https://kalshi.com/t/grul7kme" target="_blank" rel="noopener noreferrer">
                  Kalshi Markets <ExternalLink aria-hidden="true" />
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="https://kalshi.com/t/hgztgz1n" target="_blank" rel="noopener noreferrer">
                  Kalshi Perpetuals <ExternalLink aria-hidden="true" />
                </a>
              </Button>
            </div>
          </aside>

          <AdSlot label="Advertisement" />
        </div>

        {/* Footer */}
        <footer className="on-navy mt-8 border-t-4 border-accent bg-primary text-primary-foreground">
          <div className="mx-auto max-w-4xl space-y-4 px-4 py-10">
            <div className="flex items-center gap-3">
              <Seal className="size-10 text-seal" />
              <p className="font-display text-sm font-bold uppercase tracking-[0.06em]">
                {SITE_NAME}
              </p>
            </div>
            <p className="text-xs leading-relaxed text-primary-foreground/70">
              <strong className="text-primary-foreground">Editorial disclaimer:</strong> This site
              is a work of satire and political parody protected as opinion and commentary. It is
              not affiliated with, endorsed by, or connected to any government, agency, or official.
              Entries summarize sourced public allegations and contested interpretations of real
              events. The alleged bodily incidents are not established facts. Nothing here should be
              read as an assertion of fact about any person.
            </p>
            <address className="border-l-2 border-accent pl-3 text-xs not-italic leading-relaxed text-primary-foreground/70">
              <span className="block font-bold uppercase text-primary-foreground">
                Office address
              </span>
              1600 Weast Pennsylvania Avenue
              <br />
              Washington, DC 20500
            </address>
            <nav
              aria-label="Information and policies"
              className="flex flex-wrap gap-x-5 gap-y-2 pt-2"
            >
              <Button asChild variant="link">
                <Link to="/disclaimer">Disclaimer</Link>
              </Button>
              {[
                { label: "About", modal: "About" },
                { label: "Contact Me", modal: "Contact" },
                { label: "Methodology", modal: "Methodology" },
                { label: "Privacy", modal: "Privacy" },
                { label: "Corrections", modal: "Corrections" },
              ].map((item) => (
                <Button
                  key={item.modal}
                  type="button"
                  variant="link"
                  onClick={() => setModal(item.modal)}
                  aria-haspopup="dialog"
                  className="h-auto p-0 text-xs font-bold uppercase text-primary-foreground underline underline-offset-4 hover:text-primary-foreground/80"
                >
                  {item.label}
                </Button>
              ))}
            </nav>
            <p className="pt-2 text-[11px] text-primary-foreground/50">
              © {siteYear(now)} — No rights reserved. Absolutely no authority claimed.
            </p>
          </div>
        </footer>
      </main>

      <Modal open={modal === "About"} onClose={() => setModal(null)} title="About">
        <p>
          {SITE_NAME} is a satirical institution with a simple mission: to defend the President and
          his administration — humorously and poorly. Every incident file comes with an official
          response issued with total confidence and reviewed by no one.
        </p>
        <p>
          The dashboard itself is styled after official public-health statistics pages. The
          underlying events are sourced; the alleged bodily incidents remain unproven; the defenses
          remain unconvincing.
        </p>
      </Modal>

      <Modal open={modal === "Methodology"} onClose={() => setModal(null)} title="Methodology">
        <p>
          The counter is the number of whole days between the most recent logged incident date and
          today, computed on the U.S. Eastern calendar — so it turns over at midnight in Washington,
          not somewhere else.
        </p>
        <p>
          Streaks are the gaps between consecutive logged incidents. The "previous record" is the
          largest historical gap. Averages are the mean of all gaps, rounded.
        </p>
        <p>
          Evidence ratings are a 5-point comedic scale assigned by the editors on vibes alone. They
          carry no evidentiary weight whatsoever.
        </p>
      </Modal>

      <Modal open={modal === "Privacy"} onClose={() => setModal(null)} title="Privacy">
        <p>
          Incident reports are stored for editorial review. Optional contact emails are never
          published. Polls store a random browser identifier so each browser has one current vote
          per incident; this identifier is not tied to an account.
        </p>
        <p>
          Embedded video players and share links are third-party services with their own privacy
          practices.
        </p>
      </Modal>

      <Modal open={modal === "Contact"} onClose={() => setModal(null)} title="Contact">
        <p>
          To send a tip, correction, source, or general note, use the incident report form. Every
          message is held for editorial review and optional contact details are never published.
        </p>
        <Button
          type="button"
          onClick={() => {
            setModal(null);
            window.setTimeout(() => scrollToId("submit-report"), 0);
          }}
          className="mt-2 uppercase"
        >
          Contact the editorial desk
        </Button>
      </Modal>

      <Modal open={modal === "Corrections"} onClose={() => setModal(null)} title="Corrections">
        <p>
          Corrections policy: if a listed item is inaccurate, misleading, or unfairly implies a
          factual claim about a real person, it will be amended or removed promptly on request.
        </p>
        <p>Source links and counterevidence are retained so disputed entries can be reviewed.</p>
      </Modal>
    </>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-4 border-b-2 border-primary pb-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
      <h2 className="font-display text-xl font-bold uppercase tracking-tight sm:text-2xl">
        {title}
      </h2>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card p-4">
      <div className="font-display text-3xl font-black tabular-nums text-primary">{value}</div>
      <div className="mt-1 text-[10px] font-bold uppercase leading-tight tracking-[0.12em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
