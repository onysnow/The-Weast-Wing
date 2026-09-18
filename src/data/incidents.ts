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
 *    kind          Always "incident" for entries in this file.
 *    slug          A short, url-safe, UNIQUE slug. Becomes the shareable
 *                  permalink anchor, e.g. "#incident-rose-garden-2026".
 *    date          The alleged incident date, "YYYY-MM-DD".
 *    title         Short, newspaper-style headline.
 *    summary       1-3 sentences of deadpan, official-sounding write-up.
 *    status        "UNCONFIRMED" | "DISPUTED" | "UNDER REVIEW" | "SATIRE"
 *    rating        1-5. Comedic "evidence rating"; rendered by the card.
 *    source        Optional. { label: string; url: string } — primary source.
 *    references    Optional. Array of all sources (primary + allegation +
 *                  counterevidence). Each: { label, url, role }.
 *                  Roles: "primary" | "allegation" | "fact-check" |
 *                  "transcript" | "news" | "commentary".
 *    established   Optional. What is independently established as fact.
 *    notes         Optional. Editorial review notes.
 *    defense       Optional. The Weast Wing's official response: an earnestly
 *                  delivered but deeply unconvincing defense of the President.
 *    videoUrl      Optional. An EMBED url (e.g. https://www.youtube.com/embed/ID)
 *    location      Optional. Where it allegedly happened.
 *
 * 4. Save. The counter, streaks, statistics, and log all recalculate
 *    automatically. No other file needs to change.
 * ============================================================================
 */

import type { ContentItem, MediaRef, Reference } from "@/content/types";

export type { Reference, ReferenceRole } from "@/content/types";

export type IncidentStatus = "UNCONFIRMED" | "DISPUTED" | "UNDER REVIEW" | "SATIRE";

/**
 * An incident is a ContentItem plus the things only the review queue has.
 * Shared fields (slug, date, title, summary, source, references) live in
 * src/content/types.ts so articles can reuse every component that reads them.
 */
export type Incident = ContentItem & {
  kind: "incident";
  countInStats?: boolean;
  status: IncidentStatus;
  rating: 1 | 2 | 3 | 4 | 5;
  /** What is independently established as fact (not the allegation itself). */
  established?: string;
  /** Editorial review notes. */
  notes?: string;
  /** The Weast Wing's official (and officially unconvincing) defense. */
  defense?: string;
  /** Either a YouTube embed URL or a direct .mp4/.webm file URL. */
  videoUrl?: string;
  /** Still image pulled from the source page. */
  imageUrl?: string;
  imageCredit?: string;
  location?: string;
};

/** Normalize an incident's flat media fields into the shared MediaRef shape. */
export function incidentMedia(incident: Incident): MediaRef {
  return {
    ...(incident.videoUrl !== undefined ? { videoUrl: incident.videoUrl } : {}),
    ...(incident.imageUrl !== undefined ? { imageUrl: incident.imageUrl } : {}),
    ...(incident.imageCredit !== undefined ? { imageCredit: incident.imageCredit } : {}),
    label: incident.title,
  };
}

/** ---------------------------------------------------------------------
 *  REVIEW QUEUE — sourced from the editorial research workbook
 *  ------------------------------------------------------------------- */
export const incidents: Incident[] = [
  {
    kind: "incident",
    slug: "lindsey-graham-funeral",
    date: "2026-07-28",
    title: "Nearby Reactions at Washington Cathedral Fuel Online Claims",
    summary:
      "Trump attended and spoke at Senator Lindsey Graham's funeral while social posts interpreted reactions from people seated nearby as evidence of a soiling incident. The attendance and official footage are documented; the bodily-incident claim is not established.",
    status: "UNDER REVIEW",
    rating: 2,
    location: "Washington National Cathedral",
    source: {
      label: "Official White House event video",
      url: "https://www.whitehouse.gov/videos/president-trump-attends-the-funeral-for-senator-lindsey-graham/",
    },
    videoUrl: "https://www.youtube-nocookie.com/embed/rENhwohTQWs",
    references: [
      {
        label: "Official White House event video",
        url: "https://www.whitehouse.gov/videos/president-trump-attends-the-funeral-for-senator-lindsey-graham/",
        role: "primary",
      },
      {
        label: "Reddit allegation thread",
        url: "https://www.reddit.com/r/Trumpvirus/comments/1v9iwj3/trump_shits_his_pants_at_lindseys_funeral/",
        role: "allegation",
      },
      {
        label: "Reuters coverage of the funeral",
        url: "https://www.reuters.com/world/us/trump-zelenskiy-netanyahu-attend-us-senator-grahams-funeral-2026-07-28/",
        role: "news",
      },
    ],
    established:
      "Trump attended and spoke at Graham's July 28 funeral; official full-event footage exists. The soiling interpretation comes from social-media reactions to the footage.",
    notes: "Official White House video gives a clean source for reviewing the alleged moment.",
    defense:
      "The President was paying his respects. The people seated nearby were grieving. Grief has many faces, and several smells.",
  },
  {
    kind: "incident",
    slug: "world-cup-medal-ceremony",
    date: "2026-07-19",
    title: "Six-Second World Cup Clip Prompts Odor Speculation",
    summary:
      "A short clip from the medal ceremony circulated as viewers interpreted a nearby man's expression as a reaction to a foul smell. The appearance and reaction clip are authentic, but the cause of the reaction is unknown.",
    status: "UNDER REVIEW",
    rating: 1,
    location: "MetLife Stadium",
    source: {
      label: "X trending summary",
      url: "https://x.com/i/trending/2082675926697910357",
    },
    references: [
      {
        label: "X trending summary",
        url: "https://x.com/i/trending/2082675926697910357",
        role: "primary",
      },
    ],
    established:
      "The World Cup appearance and reaction clip are authentic enough to have generated a distinct X trend; the cause of the man's reaction is not established.",
    notes: "Need to locate Margo Martin's exact original post/video URL before publishing.",
    defense:
      "MetLife Stadium seats 82,500 people. Statistically, at least one man was going to make that face about something else.",
  },
  {
    kind: "incident",
    slug: "cabinet-meeting-rubio-hegseth",
    date: "2026-05-27",
    title: "Cabinet Meeting Reactions Spark Odor Rumor",
    summary:
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
    references: [
      {
        label: "Full federal-government event video",
        url: "https://commons.wikimedia.org/wiki/File:President_Trump_Participates_in_a_Cabinet_Meeting,_May_27,_2026.webm",
        role: "primary",
      },
      {
        label: "AOL coverage of the viral rumor",
        url: "https://www.aol.com/articles/dirty-diaper-alleged-donald-trump-141713000.html",
        role: "allegation",
      },
    ],
    established:
      "The Cabinet meeting and seating arrangement are independently documented. The claim that Hegseth/Rubio were reacting to an odor from Trump is an interpretation of the footage, not independently established.",
    notes: "This is separate from the March 16 JD Vance + Andrew Ferguson Oval Office clip.",
    defense:
      "Secretaries Rubio and Hegseth were visibly moved by the President's remarks. Deeply moved. Through the nose.",
  },
  {
    kind: "incident",
    slug: "memorial-day-walter-reed-footage",
    date: "2026-05-25",
    title: "Memorial Day Footage Generates Diaper Speculation",
    summary:
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
    references: [
      {
        label: "Contemporary report and video",
        url: "https://www.hindustantimes.com/world-news/us-news/did-trump-poop-his-pants-viral-video-of-potus-after-walter-reed-visit-sparks-concern-101779912356060.html",
        role: "primary",
      },
      {
        label: "Factually.co fact check",
        url: "https://factually.co/fact-checks/politics/did-donald-trump-defecate-in-public-9ed795",
        role: "fact-check",
      },
    ],
    established:
      "The underlying footage is real. The claimed bodily accident is an interpretation of the footage, not an established fact.",
    notes:
      "Potential repost/date confusion exists; treat this as one incident cluster until the exact original recording date is pinned down.",
    defense:
      "The President walks with purpose. Purpose has a distinctive silhouette, and the Weast Wing will not be taking further questions about it.",
  },
  {
    kind: "incident",
    slug: "health-care-hot-mic",
    date: "2026-04-23",
    title: "Hot Mic Captures an Unfinished, Much-Debated Phrase",
    summary:
      "A clip appeared to capture Trump saying “I could use a shi—” immediately before the feed cut, prompting bathroom-related speculation. The event and clip are authentic, but the unfinished phrase does not establish that an accident occurred.",
    status: "UNDER REVIEW",
    rating: 2,
    location: "White House",
    source: {
      label: "Official White House event video",
      url: "https://www.whitehouse.gov/videos/president-trump-participates-in-a-health-care-affordability-event/",
    },
    videoUrl: "https://www.youtube-nocookie.com/embed/1CtxlTZzElc",
    references: [
      {
        label: "Official White House event video",
        url: "https://www.whitehouse.gov/videos/president-trump-participates-in-a-health-care-affordability-event/",
        role: "primary",
      },
      {
        label: "Queerty coverage of the viral clip",
        url: "https://www.queerty.com/did-trmp-just-have-another-diaper-on-camera-an-investigation-20260427/",
        role: "allegation",
      },
    ],
    established:
      "The event and viral hot-mic clip are real. The audio appears to contain an unfinished phrase interpreted online as 'I could use a sh—'; it does not by itself establish an accident occurred.",
    notes: "Review the original White House video and compare timing against the Acyn clip before using.",
    defense:
      "The President was clearly about to say “ship” — as in shipping American jobs back home. The feed cut for unrelated, routine, completely normal reasons.",
  },
  {
    kind: "incident",
    slug: "anti-fraud-task-force-signing",
    date: "2026-03-16",
    title: "Vance and Ferguson Reactions Become a Viral ‘Stinky Moment’",
    summary:
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
    references: [
      {
        label: "Official White House event gallery",
        url: "https://www.whitehouse.gov/gallery/president-donald-j-trump-signs-an-executive-order-creating-an-anti-fraud-task-force-to-be-led-by-vice-president-jd-vance/",
        role: "primary",
      },
      {
        label: "The Poke coverage of the viral moment",
        url: "https://www.thepoke.com/2026/09/08/one-of-trumps-oval-office-stinky-moments-went-viral-again/",
        role: "allegation",
      },
      {
        label: "Roll Call full transcript",
        url: "https://rollcall.com/factbase/trump/transcript/donald-trump-remarks-fraud-task-force-executive-order-march-16-2026/",
        role: "transcript",
      },
    ],
    established:
      "The March 16 event, participants, and Trump's discussion of the B-2 bomber and bombs are independently documented. The claim that the visible reactions were caused by an odor from Trump is an interpretation.",
    notes:
      "Andrew Ferguson is the other man. Transcript places Trump's B-2/bomb discussion at about 19:41–20:31. Review the unedited event footage around that point.",
    defense:
      "The Vice President and Mr. Ferguson were reacting to the B-2 bomber, which is extremely impressive and not a smell.",
  },
  {
    kind: "incident",
    slug: "recovery-initiative-abrupt-ending",
    date: "2026-01-29",
    title: "Oval Office Event Ends Abruptly, Prompting Public Allegation",
    summary:
      "An official Great American Recovery Initiative event ended abruptly, after which public posts alleged Trump had soiled himself. The video and ending are authentic; the specific explanation remains disputed and unproven.",
    status: "DISPUTED",
    rating: 3,
    location: "Oval Office",
    source: {
      label: "Official White House event video",
      url: "https://www.whitehouse.gov/videos/president-trump-makes-an-announcement-jan-29-2026/",
    },
    videoUrl: "https://www.youtube-nocookie.com/embed/OE2NtBhozT4",
    references: [
      {
        label: "Official White House event video",
        url: "https://www.whitehouse.gov/videos/president-trump-makes-an-announcement-jan-29-2026/",
        role: "primary",
      },
      {
        label: "Hindustan Times allegation",
        url: "https://www.hindustantimes.com/world-news/us-news/trump-pooped-his-pants-climate-activists-big-claim-after-oval-event-ends-abruptly-101769805884560.html",
        role: "allegation",
      },
      {
        label: "Snopes fact check",
        url: "https://www.snopes.com/news/2026/02/02/trump-poop-executive-order/",
        role: "fact-check",
      },
    ],
    established:
      "The video and abrupt ending are authentic. The specific explanation that he soiled himself is disputed/unproven.",
    notes: "High-priority review because an official full video exists.",
    defense:
      "The event ended precisely on schedule. The schedule was revised moments earlier. This is called efficiency.",
  },
  {
    kind: "incident",
    slug: "kennedy-center-ceremony",
    date: "2025-12-06",
    title: "Ceremony Reactions Interpreted as Evidence of an Odor",
    summary:
      "Authentic footage from a Kennedy Center honorees ceremony circulated with claims that an attendee's reaction indicated an odor or soiling incident. The ceremony and reactions are real; the alleged cause is contested.",
    status: "DISPUTED",
    rating: 1,
    location: "Oval Office",
    source: {
      label: "Snopes review of the footage",
      url: "https://www.snopes.com/fact-check/trump-poop-white-house-kennedy/",
    },
    videoUrl: "https://www.youtube-nocookie.com/embed/MoEAlhUTVnE",
    references: [
      {
        label: "Snopes review of the footage",
        url: "https://www.snopes.com/fact-check/trump-poop-white-house-kennedy/",
        role: "primary",
      },
      {
        label: "Yahoo News coverage",
        url: "https://www.yahoo.com/news/articles/fact-check-no-evidence-trump-160000473.html",
        role: "commentary",
      },
    ],
    established:
      "A real ceremony and real reactions exist on video. The claim that the reactions were caused by Trump soiling himself is contested.",
    notes: "Kept specifically because you asked to review contested material yourself.",
    defense: "The attendee was simply overcome by the arts. It happens at the Kennedy Center constantly.",
  },
  {
    kind: "incident",
    slug: "notre-dame-reopening",
    date: "2024-12-07",
    title: "Paris Audience Gestures Fuel a Viral Odor Allegation",
    summary:
      "A short clip from the Notre-Dame reopening showed nearby attendees making facial gestures and covering their noses. The appearance and video are authentic; claims that they were reacting to Trump soiling himself are not established.",
    status: "DISPUTED",
    rating: 1,
    location: "Paris, France",
    source: {
      label: "Original circulating X post",
      url: "https://x.com/YourAnonCentral/status/1867356091442774279",
    },
    references: [
      {
        label: "Original circulating X post",
        url: "https://x.com/YourAnonCentral/status/1867356091442774279",
        role: "primary",
      },
      {
        label: "WeGotThisCovered coverage",
        url: "https://wegotthiscovered.com/politics/yes-donald-king-of-the-fecal-surprise-trump-might-have-taken-a-public-doogie-and-scarred-the-french/",
        role: "allegation",
      },
      {
        label: "Factually.co fact check",
        url: "https://factually.co/fact-checks/politics/evidence-trump-bowel-incident-claims-957b2b",
        role: "fact-check",
      },
    ],
    established:
      "The Paris appearance and underlying video are real; the interpretation that attendees were reacting to Trump soiling himself is not established.",
    notes: "Distinct from the 2025 Kennedy Center incident.",
    defense:
      "Parisians cover their noses as a matter of culture, fashion, and civic pride. The President happened to be standing nearby.",
  },
  {
    kind: "incident",
    slug: "detroit-economic-club",
    date: "2024-10-10",
    title: "Detroit Speech Draws Bodily-Noise Speculation",
    summary:
      "A documented Detroit Economic Club appearance generated online speculation about a bodily noise and a diaper. The event is fully recorded, but that interpretation is not established by the event record.",
    status: "UNDER REVIEW",
    rating: 1,
    location: "Detroit Economic Club",
    source: {
      label: "Detroit Economic Club full event",
      url: "https://www.econclub.org/meeting/dec-presents-special-guest-speaker-president-donald-j-trump/",
    },
    references: [
      {
        label: "Detroit Economic Club full event",
        url: "https://www.econclub.org/meeting/dec-presents-special-guest-speaker-president-donald-j-trump/",
        role: "primary",
      },
      {
        label: "YouTube clip of the debated moment",
        url: "https://www.youtube.com/watch?v=-qnhfISelm0",
        role: "allegation",
      },
      {
        label: "Roll Call transcript",
        url: "https://rollcall.com/factbase/trump/transcript/donald-trump-speech-detroit-economic-club-october-10-2024/",
        role: "transcript",
      },
    ],
    established:
      "The appearance is fully documented. The bodily-function interpretation is not established by the event record.",
    notes: "Locate and record the exact timestamp after personally reviewing the full video.",
    defense: "That was not a bodily noise. That was the sound of the American economy roaring back.",
  },
  {
    kind: "incident",
    slug: "cnn-presidential-debate-noise",
    date: "2024-06-27",
    title: "Authentic Debate Audio Prompts Questions About an Unidentified Noise",
    summary:
      "A sound audible in authentic presidential debate footage prompted public speculation about its source and nature. Neither who caused it nor whether it represented anything beyond an ordinary noise is established.",
    status: "UNDER REVIEW",
    rating: 1,
    location: "CNN Presidential Debate",
    source: {
      label: "Full debate footage from PBS",
      url: "https://www.pbs.org/wnet/preserving-democracy/2024/06/27/watch-at-the-first-2024-presidential-debate-candidates-will-play-by-their-own-rules/",
    },
    imageUrl:
      "https://www.pbs.org/wnet/preserving-democracy/files/2024/06/2024-06-27T161314Z_1490629363_RC2XI8AQTU9X_RTRMADP_3_USA-ELECTION-DEBATE-1200x800-1.jpg",
    imageCredit: "PBS / Reuters",
    references: [
      {
        label: "Full debate footage from PBS",
        url: "https://www.pbs.org/wnet/preserving-democracy/2024/06/27/watch-at-the-first-2024-presidential-debate-candidates-will-play-by-their-own-rules/",
        role: "primary",
      },
      {
        label: "YouTube clip of the debated moment",
        url: "https://www.youtube.com/watch?v=ZhBXEJtDOvI",
        role: "allegation",
      },
    ],
    established:
      "The debate and sound are authentic. The source of the noise and whether it represented anything beyond flatulence/noise are not established.",
    notes: "Review the full-event footage rather than relying on short reposts.",
    defense:
      "The unidentified noise has since been identified: patriotism. The matter is closed.",
  },
  {
    kind: "incident",
    slug: "new-york-criminal-trial-odor",
    date: "2024-04-15",
    dateLabel: "April 2024 (trial period)",
    title: "Courtroom Odor Commentary Escalates Into Online Claims",
    summary:
      "Commentary during the April trial period alleged passing gas and reactions to an odor, while online posts escalated the story into soiling claims. A viral CNN headline making that claim was fabricated and is not evidence.",
    status: "DISPUTED",
    rating: 1,
    location: "New York criminal trial",
    source: {
      label: "PolitiFact review of the fabricated CNN image",
      url: "https://politifact.com/factchecks/2024/apr/26/threads-posts/no-cnn-didnt-report-that-donald-trump-soiled-himse/",
    },
    references: [
      {
        label: "Reddit original thread",
        url: "https://www.reddit.com/r/trumptweets/comments/1c84cgn",
        role: "primary",
      },
      {
        label: "Reddit commentary thread",
        url: "https://www.reddit.com/r/Law_and_Politics/comments/1c8dzqu",
        role: "allegation",
      },
      {
        label: "PolitiFact fact check",
        url: "https://politifact.com/factchecks/2024/apr/26/threads-posts/no-cnn-didnt-report-that-donald-trump-soiled-himse/",
        role: "fact-check",
      },
    ],
    established:
      "There was online reporting/commentary about an alleged odor/farting. The viral CNN 'soils himself' headline was fabricated and is NOT being offered as evidence.",
    notes:
      "Included because there is a real underlying allegation distinct from the fake CNN image.",
    defense:
      "Courtrooms are famously stuffy. Justice itself was holding its breath out of respect for the proceedings.",
  },
  {
    kind: "incident",
    slug: "apprentice-recurring-allegation",
    date: "2019-01-01",
    dateLabel: "2000s; claims public from 2019 onward",
    countInStats: false,
    title: "Former Production Staffer Makes Recurring Apprentice-Era Allegation",
    summary:
      "Noel Casler has repeatedly said he personally witnessed incidents during production of The Apprentice and Celebrity Apprentice. The allegation became public from 2019 onward, but no independently corroborated incident date or count was located; this card represents the recurring claim, not a specific event.",
    status: "UNCONFIRMED",
    rating: 1,
    location: "The Apprentice production",
    source: {
      label: "Recorded public statement by Noel Casler",
      url: "https://www.youtube.com/watch?v=4-jAtkb2hUI",
    },
    videoUrl: "https://www.youtube-nocookie.com/embed/4-jAtkb2hUI",
    references: [
      {
        label: "Recorded public statement by Noel Casler",
        url: "https://www.youtube.com/watch?v=4-jAtkb2hUI",
        role: "primary",
      },
      {
        label: "DC Tribune coverage",
        url: "https://dctribune.org/insider-who-worked-with-trump-on-the-apprentice-says-potus-uses-adult-diapers-due-to-years-of-substance-abuse/",
        role: "allegation",
      },
      {
        label: "Factually.co fact check",
        url: "https://factually.co/fact-checks/media/noel-casler-donald-trump-diapers-apprentice-direct-evidence-621314",
        role: "fact-check",
      },
    ],
    established:
      "Casler has publicly made the allegation repeatedly. Independent corroboration of the alleged incidents was not located in this pass.",
    notes: "Treat as a recurring eyewitness allegation, not a known count of individual incidents.",
    defense:
      "The President has never met a diaper he didn't like, because he has never met a diaper. Allegedly.",
  },
];
