import type { ReferenceRole } from "@/content/types";

const PLATFORM_MAP: Array<{ test: (h: string) => boolean; label: string }> = [
  { test: (h) => h.includes("x.com") || h.includes("twitter.com"), label: "X" },
  { test: (h) => h.includes("threads.net"), label: "Threads" },
  { test: (h) => h.includes("instagram.com"), label: "Instagram" },
  { test: (h) => h.includes("tiktok.com"), label: "TikTok" },
  { test: (h) => h.includes("youtube.com") || h.includes("youtube-nocookie.com"), label: "YouTube" },
  { test: (h) => h.includes("reddit.com"), label: "Reddit" },
  { test: (h) => h.includes("snopes.com"), label: "Snopes" },
  { test: (h) => h.includes("whitehouse.gov"), label: "WH.gov" },
  { test: (h) => h.includes("reuters.com"), label: "Reuters" },
  { test: (h) => h.includes("hindustantimes.com"), label: "HT" },
  { test: (h) => h.includes("rollcall.com"), label: "RollCall" },
  { test: (h) => h.includes("factually.co"), label: "Factually" },
  { test: (h) => h.includes("politifact"), label: "PolitiFact" },
  { test: (h) => h.includes("commons.wikimedia"), label: "Wikimedia" },
  { test: (h) => h.includes("pbs.org"), label: "PBS" },
  { test: (h) => h.includes("econclub"), label: "EconClub" },
  { test: (h) => h.includes("yahoo.com"), label: "Yahoo" },
  { test: (h) => h.includes("aol.com"), label: "AOL" },
  { test: (h) => h.includes("queerty.com"), label: "Queerty" },
  { test: (h) => h.includes("thepoke.com"), label: "ThePoke" },
  { test: (h) => h.includes("dctribune"), label: "DCTribune" },
  { test: (h) => h.includes("wegotthiscovered"), label: "WGTC" },
];

export function getPlatformLabel(url: string): string {
  try {
    const host = new URL(url).hostname.replace("www.", "");
    return PLATFORM_MAP.find((p) => p.test(host))?.label ?? host;
  } catch {
    return "Link";
  }
}

export const ROLE_LABELS: Record<ReferenceRole, string> = {
  primary: "Primary",
  allegation: "Allegation",
  "fact-check": "Fact Check",
  transcript: "Transcript",
  news: "News",
  commentary: "Commentary",
};
