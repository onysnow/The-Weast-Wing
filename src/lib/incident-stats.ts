import { incidents, type Incident } from "@/data/incidents";

const DAY_MS = 86_400_000;

/** Parse a YYYY-MM-DD string as a UTC midnight timestamp. */
export function parseDate(d: string): number {
  const [y, m, day] = d.split("-").map(Number);
  return Date.UTC(y ?? 1970, (m ?? 1) - 1, day ?? 1);
}

export function daysBetween(a: number, b: number): number {
  return Math.max(0, Math.floor((b - a) / DAY_MS));
}

/** Newest first. */
export const sortedIncidents: Incident[] = [...incidents].sort(
  (a, b) => parseDate(b.date) - parseDate(a.date),
);

export const latestIncident: Incident | undefined = sortedIncidents[0];

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
  const asc = [...sortedIncidents].reverse();
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
  const currentStreak = latestIncident ? daysBetween(parseDate(latestIncident.date), now) : 0;
  const previousRecord = g.length ? Math.max(...g) : 0;
  const year = new Date(now).getUTCFullYear();

  return {
    total: sortedIncidents.length,
    currentStreak,
    longestStreak: Math.max(previousRecord, currentStreak),
    previousRecord,
    averageGap: g.length ? Math.round(g.reduce((a, b) => a + b, 0) / g.length) : 0,
    thisYear: sortedIncidents.filter((i) => new Date(parseDate(i.date)).getUTCFullYear() === year)
      .length,
  };
}
