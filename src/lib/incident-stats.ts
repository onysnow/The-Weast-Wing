import { incidents, type Incident } from "@/data/incidents";

const DAY_MS = 86_400_000;

/**
 * The newsroom clock. Incident dates are US calendar dates, so "today" has to
 * be the US date too — computing in UTC rolled the counter over at 7 or 8pm
 * the previous evening for the entire audience.
 */
export const SITE_TIME_ZONE = "America/New_York";

/**
 * Eastern Standard Time, in milliseconds. Only used if the runtime cannot
 * resolve named time zones at all (see below) — an hour out during daylight
 * saving, which beats being five hours out.
 */
const EST_OFFSET_MS = 5 * 60 * 60 * 1000;

let cachedFormatter: Intl.DateTimeFormat | null | undefined;

/**
 * A formatter for the site's zone, or null where the runtime has no zone data.
 *
 * Node built with small-icu, and some slim container images, throw
 * `RangeError: Invalid time zone specified` for any named zone. Building this
 * at module scope meant that throw happened on *import* — which would take out
 * server rendering of the whole site, not just the counter. Built lazily and
 * guarded instead, and memoized so the cost is paid once.
 */
function siteDateParts(): Intl.DateTimeFormat | null {
  if (cachedFormatter !== undefined) return cachedFormatter;
  try {
    cachedFormatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: SITE_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    console.warn(
      `[clock] runtime cannot resolve ${SITE_TIME_ZONE}; falling back to a fixed EST offset`,
    );
    cachedFormatter = null;
  }
  return cachedFormatter;
}

/** Test seam: forget the memoized formatter. Not used by application code. */
export function resetSiteClockForTests(): void {
  cachedFormatter = undefined;
}

/** Parse a YYYY-MM-DD string as a UTC midnight timestamp. */
export function parseDate(d: string): number {
  const [y, m, day] = d.split("-").map(Number);
  return Date.UTC(y ?? 1970, (m ?? 1) - 1, day ?? 1);
}

/**
 * The calendar date in the site's time zone at `instant`, as a UTC-midnight
 * timestamp — directly comparable with `parseDate`. Server and browser agree
 * because both ask for the same named zone rather than their own offset.
 */
export function siteToday(instant: number = Date.now()): number {
  const formatter = siteDateParts();
  // en-CA formats as YYYY-MM-DD.
  if (formatter) return parseDate(formatter.format(new Date(instant)));
  // No zone data: shift by a fixed EST offset and read the UTC date off that.
  const shifted = new Date(instant - EST_OFFSET_MS);
  return Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate());
}

/** The calendar year in the site's time zone. */
export function siteYear(instant: number = Date.now()): number {
  return new Date(siteToday(instant)).getUTCFullYear();
}

export function daysBetween(a: number, b: number): number {
  return Math.max(0, Math.floor((b - a) / DAY_MS));
}

/** Newest first. */
export const sortedIncidents: Incident[] = [...incidents].sort(
  (a, b) => parseDate(b.date) - parseDate(a.date),
);

export const latestIncident: Incident | undefined = sortedIncidents[0];

const countedIncidents = sortedIncidents.filter((incident) => incident.countInStats !== false);

export function formatDate(d: string): string {
  return new Date(parseDate(d)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export type Stats = {
  total: number;
  currentStreak: number;
  longestStreak: number;
  previousRecord: number;
  averageGap: number;
  thisYear: number;
};

/** All gaps (in days) between consecutive incidents, oldest -> newest. */
function gaps(): number[] {
  const asc = [...countedIncidents].reverse();
  const out: number[] = [];
  for (let i = 1; i < asc.length; i++) {
    const prev = asc[i - 1]!;
    const cur = asc[i]!;
    out.push(daysBetween(parseDate(prev.date), parseDate(cur.date)));
  }
  return out;
}

export function computeStats(now: number = Date.now()): Stats {
  const g = gaps();
  const today = siteToday(now);
  const currentStreak = latestIncident ? daysBetween(parseDate(latestIncident.date), today) : 0;
  const previousRecord = g.length ? Math.max(...g) : 0;
  const year = siteYear(now);

  return {
    total: countedIncidents.length,
    currentStreak,
    longestStreak: Math.max(previousRecord, currentStreak),
    previousRecord,
    averageGap: g.length ? Math.round(g.reduce((a, b) => a + b, 0) / g.length) : 0,
    thisYear: countedIncidents.filter((i) => new Date(parseDate(i.date)).getUTCFullYear() === year)
      .length,
  };
}
