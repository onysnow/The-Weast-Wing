import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import {
  AdSlot,
  BEASeal,
  CompactMedia,
  IncidentMedia,
  Modal,
  PoopRating,
  ResearchDrawer,
  Seal,
  ShareBar,
  StatusBadge,
} from "@/components/site";
import { IncidentPoll, IncidentSubmissionForm } from "@/components/community";
import { Button } from "@/components/ui/button";
import { RATING_LABELS } from "@/data/incidents";
import { computeStats, formatDate, latestIncident, sortedIncidents } from "@/lib/incident-stats";

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
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: `${SITE_NAME} — ${HERO_HEADLINE}` },
      { name: "twitter:description", content: DESC },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

const AGENCIES = [
  { id: "hero", acronym: "POS", name: "Presidential Office of Shitistics" },
  { id: "what-reset-the-clock", acronym: "OLI", name: "Office of the Latest Incident" },
  { id: "statistics", acronym: "BEA", name: "Bureau of Executive Anomalies" },
  { id: "incident-log", acronym: "FRAI", name: "Federal Registry of Alleged Incidents" },
  { id: "submit-report", acronym: "OCT", name: "Office of Citizen Tips" },
] as const;

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Index() {
  const [now, setNow] = useState(() => Date.now());
  const [modal, setModal] = useState<string | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const stats = useMemo(() => computeStats(now), [now]);
  const latest = latestIncident;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Official banner */}
      <div className="border-b border-border bg-muted">
        <p className="mx-auto max-w-4xl px-4 py-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:text-[11px]">
          ⚠ A parody site. Not an official government resource. Allegations are unproven.
        </p>
      </div>

      {/* Masthead */}
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-4">
          <Seal className="size-11 shrink-0 text-seal" />
          <div>
            <p className="font-display text-sm font-bold uppercase leading-tight tracking-[0.06em]">
              {SITE_NAME}
            </p>
            <p className="text-[11px] uppercase tracking-[0.14em] text-primary-foreground/70">
              Presidential Office of Shitistics
            </p>
          </div>
        </div>
      </header>

      {/* Agencies nav */}
      <nav aria-label="Weast Wing agencies" className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl gap-1 overflow-x-auto px-2 py-1.5">
          {AGENCIES.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => scrollToId(a.id)}
              className="group flex shrink-0 items-baseline gap-1.5 whitespace-nowrap px-2.5 py-1.5 text-left hover:bg-muted"
            >
              <span className="font-display text-[11px] font-bold uppercase tracking-[0.08em] text-accent group-hover:underline">
                {a.acronym}
              </span>
              <span className="hidden text-[11px] uppercase tracking-[0.06em] text-muted-foreground sm:inline">
                {a.name}
              </span>
            </button>
          ))}
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section id="hero" className="scroll-mt-12 border-b-4 border-accent bg-primary text-primary-foreground">
          <div className="mx-auto max-w-4xl px-4 pb-10 pt-6 text-center">
            <h1 className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-foreground/70">
              Current Reporting Period
            </h1>
            <div
              className="my-2 font-display text-[26vw] font-black leading-[0.85] tabular-nums sm:text-[10rem]"
              aria-live="polite"
            >
              {stats.currentStreak}
            </div>
            <p className="mx-auto max-w-xl font-display text-base font-bold uppercase leading-snug tracking-wide sm:text-2xl">
              {HERO_HEADLINE}
            </p>

            <dl className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-px overflow-hidden border border-primary-foreground/20 bg-primary-foreground/20 text-left">
              <div className="bg-primary px-3 py-2">
                <dt className="text-[10px] uppercase tracking-[0.14em] text-primary-foreground/60">
                  Previous record
                </dt>
                <dd className="font-display text-lg font-bold tabular-nums">
                  {stats.previousRecord} days
                </dd>
              </div>
              <div className="bg-primary px-3 py-2">
                <dt className="text-[10px] uppercase tracking-[0.14em] text-primary-foreground/60">
                  Last alleged incident
                </dt>
                <dd className="font-display text-lg font-bold">
                  {latest ? formatDate(latest.date) : "—"}
                </dd>
              </div>
            </dl>

            <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-primary-foreground/50">
              ▲ Compiled by the Bureau of Executive Anomalies (BEA)
            </p>

            <button
              onClick={() => scrollToId("what-reset-the-clock")}
              className="mt-6 w-full max-w-md border-2 border-accent bg-accent px-5 py-3 font-display text-sm font-bold uppercase tracking-[0.12em] text-accent-foreground transition hover:bg-accent/85"
            >
              What reset the clock? ↓
            </button>
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-4">
          <AdSlot label="Advertisement" />

          {/* Featured incident */}
          <section id="what-reset-the-clock" className="scroll-mt-4">
            <SectionHeading eyebrow="Featured Report" title="What Reset the Clock?" />
            {latest ? (
              <article className="border border-border bg-card">
                <IncidentMedia
                  videoUrl={latest.videoUrl}
                  imageUrl={latest.imageUrl}
                  imageCredit={latest.imageCredit}
                  headline={latest.headline}
                />
                <div className="space-y-4 p-4 sm:p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={latest.status} />
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {formatDate(latest.date)}
                      {latest.location ? ` · ${latest.location}` : ""}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-bold leading-tight">
                    {latest.headline}
                  </h3>
                  <p className="leading-relaxed text-muted-foreground">{latest.description}</p>
                  {latest.source && (
                    <a
                      href={latest.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-sm font-semibold text-accent underline underline-offset-4"
                    >
                      Source: {latest.source.label} ↗
                    </a>
                  )}

                  <div className="border-t border-border pt-4">
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      Evidence Rating
                    </p>
                    <PoopRating rating={latest.rating} />
                    <ol className="mt-4 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <li key={n} className="tabular-nums">
                          <span className="font-bold text-foreground">{n}</span> —{" "}
                          {RATING_LABELS[n]}
                        </li>
                      ))}
                    </ol>
                    <p className="mt-3 border-l-2 border-accent bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
                      <strong className="text-foreground">Disclaimer:</strong> Evidence ratings are
                      comedic commentary and opinion. They are not investigative findings, forensic
                      analysis, or statements of fact about any real person.
                    </p>
                  </div>

                  <ShareBar title={`${stats.currentStreak} days since the last alleged incident`} />
                </div>
              </article>
            ) : (
              <p className="text-muted-foreground">No incidents on record.</p>
            )}
          </section>

          {/* Statistics */}
          <section id="statistics" className="mt-12 scroll-mt-4">
            {/* BEA agency header */}
            <div className="mb-4 flex items-center gap-3 border-b-2 border-primary pb-2">
              <BEASeal className="size-10 shrink-0 text-primary" />
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                  BEA | Bureau of Executive Anomalies
                </p>
                <h2 className="font-display text-xl font-bold uppercase tracking-tight sm:text-2xl">
                  Official(?) Data & Analytics Division
                </h2>
              </div>
            </div>
            <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
              Compiled and maintained by the Bureau of Executive Anomalies (BEA), the{" "}
              {SITE_NAME}'s fictional statistics division. All figures are auto-calculated from
              the allegation review queue below.
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
              ▲ BEA-certified data · Not a real government agency · Figures are satirical
            </p>
          </section>

          <AdSlot label="Advertisement" />

          {/* Incident log */}
          <section id="incident-log" className="mt-6 scroll-mt-4">
            <SectionHeading eyebrow="Public Record" title="The Incident Log" />
            <ol className="space-y-4">
              {sortedIncidents.map((inc, i) => (
                <li key={inc.id}>
                  <article
                    id={`incident-${inc.id}`}
                    className="scroll-mt-4 border border-border bg-card"
                  >
                    {/* Card header: file number, status, date */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="border border-border bg-muted px-2 py-1 font-display text-[11px] font-bold tabular-nums tracking-wider">
                          FILE №{String(sortedIncidents.length - i).padStart(3, "0")}
                        </span>
                        <StatusBadge status={inc.status} />
                      </div>
                      <time
                        dateTime={inc.date}
                        className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        {inc.dateLabel ?? formatDate(inc.date)}
                      </time>
                    </div>

                    {/* Card body: compact media + headline + description */}
                    <div className="flex gap-3 p-4">
                      <CompactMedia
                        videoUrl={inc.videoUrl}
                        imageUrl={inc.imageUrl}
                        imageCredit={inc.imageCredit}
                        headline={inc.headline}
                        sourceUrl={inc.source?.url}
                        sourceLabel={inc.source?.label}
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-lg font-bold leading-snug">
                          {inc.headline}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {inc.description}
                        </p>
                      </div>
                    </div>

                    {/* Evidence rating */}
                    <div className="px-4 pb-3">
                      <PoopRating rating={inc.rating} size="sm" />
                    </div>

                    {/* Public poll */}
                    <div className="border-t border-border">
                      <IncidentPoll incidentId={inc.id} />
                    </div>

                    {/* Expandable research drawer */}
                    <ResearchDrawer
                      established={inc.established}
                      notes={inc.notes}
                      references={inc.references}
                      permalink={`#incident-${inc.id}`}
                      sourceUrl={inc.source?.url}
                      sourceLabel={inc.source?.label}
                    />
                  </article>
                  {i === 1 && <AdSlot label="Advertisement" />}
                </li>
              ))}
            </ol>
          </section>

          {/* Public submissions */}
          <section id="submit-report" className="mt-12 scroll-mt-4">
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
              <Button asChild variant="outline" className="rounded-none">
                <a href="https://kalshi.com/t/grul7kme" target="_blank" rel="noopener noreferrer">
                  Kalshi Markets <ExternalLink aria-hidden="true" />
                </a>
              </Button>
              <Button asChild variant="outline" className="rounded-none">
                <a href="https://kalshi.com/t/hgztgz1n" target="_blank" rel="noopener noreferrer">
                  Kalshi Perpetuals <ExternalLink aria-hidden="true" />
                </a>
              </Button>
            </div>
          </aside>

          <AdSlot label="Advertisement" />
        </div>

        {/* Footer */}
        <footer className="mt-8 border-t-4 border-accent bg-primary text-primary-foreground">
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
            <nav className="flex flex-wrap gap-x-5 gap-y-2 pt-2 text-xs font-bold uppercase tracking-[0.12em]">
              {["About", "Methodology", "Privacy", "Contact", "Corrections"].map((m) => (
                <button
                  key={m}
                  onClick={() => setModal(m)}
                  className="underline underline-offset-4"
                >
                  {m}
                </button>
              ))}
            </nav>
            <p className="pt-2 text-[11px] text-primary-foreground/50">
              © {new Date(now).getUTCFullYear()} — No rights reserved. Absolutely no authority
              claimed.
            </p>
          </div>
        </footer>
      </main>

      <Modal open={modal === "About"} onClose={() => setModal(null)} title="About">
        <p>
          {SITE_NAME} is a satirical dashboard styled after official public-health statistics pages.
          It applies the workplace "days since last incident" joke to a curated queue of public
          allegations and contested interpretations.
        </p>
        <p>The underlying events are sourced; the alleged bodily incidents remain unproven.</p>
      </Modal>

      <Modal open={modal === "Methodology"} onClose={() => setModal(null)} title="Methodology">
        <p>
          The counter is the number of whole days between the most recent logged incident date and
          today, computed in UTC.
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
          There is no real contact address configured yet. Add one before publishing so people can
          reach you.
        </p>
      </Modal>

      <Modal open={modal === "Corrections"} onClose={() => setModal(null)} title="Corrections">
        <p>
          Corrections policy: if a listed item is inaccurate, misleading, or unfairly implies a
          factual claim about a real person, it will be amended or removed promptly on request.
        </p>
        <p>Source links and counterevidence are retained so disputed entries can be reviewed.</p>
      </Modal>
    </div>
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
