/**
 * ============================================================================
 * INCIDENT DATA — THE ONLY FILE YOU NEED TO EDIT
 * ============================================================================
 *
 * This is a SATIRE / PARODY project. Every entry below is FICTIONAL and
 * clearly labeled as sample data. Nothing here is a factual claim.
 *
 * HOW TO ADD AN INCIDENT
 * ----------------------
 * 1. Copy one of the objects in the `incidents` array below.
 * 2. Paste it at the TOP of the array (newest first is nicest, but the app
 *    sorts by date anyway, so order does not actually matter).
 * 3. Fill in the fields:
 *
 *    id            A short, url-safe, UNIQUE slug. Becomes the shareable
 *                  permalink anchor, e.g. "#incident-rose-garden-2026".
 *    date          The alleged incident date, "YYYY-MM-DD".
 *    headline      Short, newspaper-style headline.
 *    description   1-3 sentences of deadpan, official-sounding write-up.
 *    status        "UNCONFIRMED" | "DISPUTED" | "UNDER REVIEW" | "SATIRE"
 *    rating        1-5. Comedic "evidence rating". See RATING_LABELS below.
 *    source        Optional. { label: string; url: string }
 *    videoUrl      Optional. An EMBED url (e.g. https://www.youtube.com/embed/ID)
 *    location      Optional. Where it allegedly happened.
 *
 * 4. Save. The counter, streaks, statistics, and log all recalculate
 *    automatically. No other file needs to change.
 * ============================================================================
 */

export type IncidentStatus = "UNCONFIRMED" | "DISPUTED" | "UNDER REVIEW" | "SATIRE";

export type Incident = {
  id: string;
  date: string; // YYYY-MM-DD
  headline: string;
  description: string;
  status: IncidentStatus;
  rating: 1 | 2 | 3 | 4 | 5;
  source?: { label: string; url: string };
  videoUrl?: string;
  location?: string;
};

/** Comedic 5-point evidence scale. Not a scientific instrument. */
export const RATING_LABELS: Record<number, string> = {
  1: "Internet is reaching",
  2: "Suspicious",
  3: "We have questions",
  4: "Extremely concerning evidence",
  5: "We may need congressional hearings",
};

/** ---------------------------------------------------------------------
 *  SAMPLE / FICTIONAL INCIDENTS — replace with your own entries
 *  ------------------------------------------------------------------- */
export const incidents: Incident[] = [
  {
    id: "abrupt-podium-departure",
    date: "2026-08-14",
    headline: "Abrupt Podium Departure Mid-Sentence, Aides Form Human Wall",
    description:
      "During a routine infrastructure announcement, the President reportedly stopped mid-word, looked into the middle distance, and exited stage left at a pace observers described as 'purposeful.' Staff immediately formed what one pool reporter called 'a suspiciously tight perimeter.'",
    status: "UNCONFIRMED",
    rating: 5,
    location: "East Room (fictional)",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    source: { label: "Sample Source (fictional)", url: "https://example.com/sample-incident" },
  },
  {
    id: "helicopter-tarmac-pause",
    date: "2026-05-02",
    headline: "Unscheduled 11-Minute Pause Before Boarding Helicopter",
    description:
      "Cameras captured an unexplained delay on the tarmac. The official explanation cited 'wind conditions.' The wind, according to publicly available fictional weather data, was 2 mph.",
    status: "DISPUTED",
    rating: 3,
    location: "South Lawn (fictional)",
    source: { label: "Sample Source (fictional)", url: "https://example.com/sample-incident" },
  },
  {
    id: "g20-jacket-incident",
    date: "2026-01-19",
    headline: "Jacket Tied Around Waist at Formal Summit Photo",
    description:
      "The President appeared in the family photo with a suit jacket knotted at the waist, a styling choice not previously observed at multilateral gatherings. No further comment was offered.",
    status: "UNDER REVIEW",
    rating: 4,
    location: "Summit Venue (fictional)",
  },
  {
    id: "extended-restroom-recess",
    date: "2025-09-27",
    headline: "Bilateral Meeting Recessed 'For Translation Reasons'",
    description:
      "A 40-minute recess was called during a bilateral meeting. Both delegations already spoke the same language. Officials declined to elaborate on the translation issue.",
    status: "UNCONFIRMED",
    rating: 2,
    location: "Cabinet Room (fictional)",
  },
  {
    id: "town-hall-chair-swap",
    date: "2025-03-08",
    headline: "Chair Quietly Replaced During Commercial Break",
    description:
      "Attendees noted that the President's chair was swapped for an identical model during a break. Production staff described the change as 'standard equipment rotation.'",
    status: "SATIRE",
    rating: 1,
    location: "Town Hall Set (fictional)",
  },
];
