/**
 * ============================================================================
 * INCIDENT DATA — THE ONLY FILE YOU NEED TO EDIT
 * ============================================================================
 *
 * This is a SATIRE / PARODY project. Entries document public allegations
 * about authentic events; the alleged bodily incidents are not established
 * facts. Descriptions must preserve that distinction.
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
  dateLabel?: string;
  countInStats?: boolean;
  headline: string;
  description: string;
  status: IncidentStatus;
  rating: 1 | 2 | 3 | 4 | 5;
  source?: { label: string; url: string };
  /** Either a YouTube embed URL or a direct .mp4/.webm file URL. */
  videoUrl?: string;
  /** Still image pulled from the source page. */
  imageUrl?: string;
  imageCredit?: string;
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
 *  REVIEW QUEUE — sourced from the editorial research workbook
 *  ------------------------------------------------------------------- */
export const incidents: Incident[] = [
  {
    id: "lindsey-graham-funeral",
    date: "2026-07-28",
    headline: "Nearby Reactions at Washington Cathedral Fuel Online Claims",
    description:
      "Trump attended and spoke at Senator Lindsey Graham's funeral while social posts interpreted reactions from people seated nearby as evidence of a soiling incident. The attendance and official footage are documented; the bodily-incident claim is not established.",
    status: "UNDER REVIEW",
    rating: 2,
    location: "Washington National Cathedral",
    source: {
      label: "Official White House event video",
      url: "https://www.whitehouse.gov/videos/president-trump-attends-the-funeral-for-senator-lindsey-graham/",
    },
    videoUrl: "https://www.youtube-nocookie.com/embed/rENhwohTQWs",
  },
  {
    id: "world-cup-medal-ceremony",
    date: "2026-07-19",
    headline: "Six-Second World Cup Clip Prompts Odor Speculation",
    description:
      "A short clip from the medal ceremony circulated as viewers interpreted a nearby man's expression as a reaction to a foul smell. The appearance and reaction clip are authentic, but the cause of the reaction is unknown.",
    status: "UNDER REVIEW",
    rating: 1,
    location: "MetLife Stadium",
    source: {
      label: "X trending summary",
      url: "https://x.com/i/trending/2082675926697910357",
    },
  },
  {
    id: "cabinet-meeting-rubio-hegseth",
    date: "2026-05-27",
    headline: "Cabinet Meeting Reactions Spark Odor Rumor",
    description:
      "Online commentary claimed Marco Rubio and Pete Hegseth visibly reacted to a bad odor while seated beside Trump. The meeting and seating arrangement are documented; the suggested cause of their behavior is not.",
    status: "UNDER REVIEW",
    rating: 2,
    location: "White House Cabinet Room",
    source: {
      label: "Full federal-government event video",
      url: "https://commons.wikimedia.org/wiki/File:President_Trump_Participates_in_a_Cabinet_Meeting,_May_27,_2026.webm",
    },
    videoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/transcoded/7/75/President_Trump_Participates_in_a_Cabinet_Meeting%2C_May_27%2C_2026.webm/President_Trump_Participates_in_a_Cabinet_Meeting%2C_May_27%2C_2026.webm.1080p.vp9.webm",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/President_Trump_Participates_in_a_Cabinet_Meeting%2C_May_27%2C_2026.webm/1280px--President_Trump_Participates_in_a_Cabinet_Meeting%2C_May_27%2C_2026.webm.jpg",
    imageCredit: "Wikimedia Commons / U.S. federal government",
  },
  {
    id: "memorial-day-walter-reed-footage",
    date: "2026-05-25",
    headline: "Memorial Day Footage Generates Diaper Speculation",
    description:
      "Authentic footage of Trump's movement around Memorial Day and Walter Reed coverage generated a viral allegation that he had defecated in an adult diaper. The footage is real; that interpretation is not established.",
    status: "UNDER REVIEW",
    rating: 2,
    location: "White House",
    source: {
      label: "Contemporary report and video",
      url: "https://www.hindustantimes.com/world-news/us-news/did-trump-poop-his-pants-viral-video-of-potus-after-walter-reed-visit-sparks-concern-101779912356060.html",
    },
    imageUrl:
      "https://www.hindustantimes.com/ht-img/img/2026/05/27/1600x900/logo/trump_poops_his_pants_1779912352350_1779912352484_66921c11-0ac5-4fcf-9d53-e139d21d44bd.jpg",
    imageCredit: "Hindustan Times",
  },
  {
    id: "health-care-hot-mic",
    date: "2026-04-23",
    headline: "Hot Mic Captures an Unfinished, Much-Debated Phrase",
    description:
      "A clip appeared to capture Trump saying “I could use a shi—” immediately before the feed cut, prompting bathroom-related speculation. The event and clip are authentic, but the unfinished phrase does not establish that an accident occurred.",
    status: "UNDER REVIEW",
    rating: 2,
    location: "White House",
    source: {
      label: "Official White House event video",
      url: "https://www.whitehouse.gov/videos/president-trump-participates-in-a-health-care-affordability-event/",
    },
    videoUrl: "https://www.youtube-nocookie.com/embed/1CtxlTZzElc",
  },
  {
    id: "anti-fraud-task-force-signing",
    date: "2026-03-16",
    headline: "Vance and Ferguson Reactions Become a Viral ‘Stinky Moment’",
    description:
      "A clip from an anti-fraud task force signing showed JD Vance and Andrew Ferguson reacting while Trump discussed the B-2 bomber. The event and participants are independently documented; attributing their expressions to an odor is interpretation, not fact.",
    status: "UNDER REVIEW",
    rating: 2,
    location: "Oval Office",
    source: {
      label: "Official White House event gallery",
      url: "https://www.whitehouse.gov/gallery/president-donald-j-trump-signs-an-executive-order-creating-an-anti-fraud-task-force-to-be-led-by-vice-president-jd-vance/",
    },
    imageUrl: "https://www.whitehouse.gov/wp-content/uploads/2026/03/P20260316MR-0406.jpg",
    imageCredit: "The White House",
  },
  {
    id: "recovery-initiative-abrupt-ending",
    date: "2026-01-29",
    headline: "Oval Office Event Ends Abruptly, Prompting Public Allegation",
    description:
      "An official Great American Recovery Initiative event ended abruptly, after which public posts alleged Trump had soiled himself. The video and ending are authentic; the specific explanation remains disputed and unproven.",
    status: "DISPUTED",
    rating: 3,
    location: "Oval Office",
    source: {
      label: "Official White House event video",
      url: "https://www.whitehouse.gov/videos/president-trump-makes-an-announcement-jan-29-2026/",
    },
  },
  {
    id: "kennedy-center-ceremony",
    date: "2025-12-06",
    headline: "Ceremony Reactions Interpreted as Evidence of an Odor",
    description:
      "Authentic footage from a Kennedy Center honorees ceremony circulated with claims that an attendee's reaction indicated an odor or soiling incident. The ceremony and reactions are real; the alleged cause is contested.",
    status: "DISPUTED",
    rating: 1,
    location: "Oval Office",
    source: {
      label: "Snopes review of the footage",
      url: "https://www.snopes.com/fact-check/trump-poop-white-house-kennedy/",
    },
  },
  {
    id: "notre-dame-reopening",
    date: "2024-12-07",
    headline: "Paris Audience Gestures Fuel a Viral Odor Allegation",
    description:
      "A short clip from the Notre-Dame reopening showed nearby attendees making facial gestures and covering their noses. The appearance and video are authentic; claims that they were reacting to Trump soiling himself are not established.",
    status: "DISPUTED",
    rating: 1,
    location: "Paris, France",
    source: {
      label: "Original circulating X post",
      url: "https://x.com/YourAnonCentral/status/1867356091442774279",
    },
  },
  {
    id: "detroit-economic-club",
    date: "2024-10-10",
    headline: "Detroit Speech Draws Bodily-Noise Speculation",
    description:
      "A documented Detroit Economic Club appearance generated online speculation about a bodily noise and a diaper. The event is fully recorded, but that interpretation is not established by the event record.",
    status: "UNDER REVIEW",
    rating: 1,
    location: "Detroit Economic Club",
    source: {
      label: "Detroit Economic Club full event",
      url: "https://www.econclub.org/meeting/dec-presents-special-guest-speaker-president-donald-j-trump/",
    },
  },
  {
    id: "cnn-presidential-debate-noise",
    date: "2024-06-27",
    headline: "Authentic Debate Audio Prompts Questions About an Unidentified Noise",
    description:
      "A sound audible in authentic presidential debate footage prompted public speculation about its source and nature. Neither who caused it nor whether it represented anything beyond an ordinary noise is established.",
    status: "UNDER REVIEW",
    rating: 1,
    location: "CNN Presidential Debate",
    source: {
      label: "Full debate footage from PBS",
      url: "https://www.pbs.org/wnet/preserving-democracy/2024/06/27/watch-at-the-first-2024-presidential-debate-candidates-will-play-by-their-own-rules/",
    },
  },
  {
    id: "new-york-criminal-trial-odor",
    date: "2024-04-01",
    headline: "Courtroom Odor Commentary Escalates Into Online Claims",
    description:
      "Commentary during the April trial period alleged passing gas and reactions to an odor, while online posts escalated the story into soiling claims. A viral CNN headline making that claim was fabricated and is not evidence.",
    status: "DISPUTED",
    rating: 1,
    location: "New York criminal trial",
    source: {
      label: "PolitiFact review of the fabricated CNN image",
      url: "https://politifact.com/factchecks/2024/apr/26/threads-posts/no-cnn-didnt-report-that-donald-trump-soiled-himse/",
    },
  },
  {
    id: "apprentice-recurring-allegation",
    date: "2019-01-01",
    dateLabel: "2000s; claims public from 2019 onward",
    countInStats: false,
    headline: "Former Production Staffer Makes Recurring Apprentice-Era Allegation",
    description:
      "Noel Casler has repeatedly said he personally witnessed incidents during production of The Apprentice and Celebrity Apprentice. The allegation became public from 2019 onward, but no independently corroborated incident date or count was located; this card represents the recurring claim, not a specific event.",
    status: "UNCONFIRMED",
    rating: 1,
    location: "The Apprentice production",
    source: {
      label: "Recorded public statement by Noel Casler",
      url: "https://www.youtube.com/watch?v=4-jAtkb2hUI",
    },
  },
];
