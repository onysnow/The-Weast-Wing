/**
 * The shared shape of everything this site publishes.
 *
 * Until now there was exactly one content type, and every component — the
 * card, the media frame, the reference list, the share bar — was typed to
 * `Incident`. Adding press releases meant duplicating all of it. `ContentItem`
 * is the common ground: anything that has a date, a headline and a URL.
 *
 * See docs/adr/0001-content-model.md.
 */

export type ContentKind = "incident" | "article";

export type ReferenceRole =
  | "primary"
  | "allegation"
  | "fact-check"
  | "transcript"
  | "news"
  | "commentary";

export type Reference = {
  label: string;
  url: string;
  role: ReferenceRole;
};

/** A link out to where something came from. */
export type Source = {
  label: string;
  url: string;
};

/**
 * One piece of media, normalized. Components take this rather than reading
 * `videoUrl`/`imageUrl`/`imageCredit` off a specific content type, which is
 * what made the media components incident-only.
 */
export type MediaRef = {
  /** A YouTube embed URL, or a direct .mp4/.webm file. */
  videoUrl?: string;
  /** Still image — the poster frame for a video, or the media itself. */
  imageUrl?: string;
  imageCredit?: string;
  /** Accessible label, normally the item's title. */
  label: string;
};

/** Fields every published item has, whatever kind it is. */
export type ContentItem = {
  kind: ContentKind;
  /** URL-safe, unique within its kind. The permalink and the poll key. */
  slug: string;
  /** "YYYY-MM-DD". Rendered on the site's Eastern calendar. */
  date: string;
  /** Overrides the formatted date where the real one is vague or a range. */
  dateLabel?: string;
  title: string;
  summary: string;
  source?: Source;
  references?: Reference[];
};

/** True when the item has anything to show in a media frame. */
export function hasMedia(media: MediaRef | undefined): media is MediaRef {
  return Boolean(media && (media.videoUrl || media.imageUrl));
}
