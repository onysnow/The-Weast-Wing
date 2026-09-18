import { useEffect, useRef, useState } from "react";
import { ExternalLink, Play } from "lucide-react";
import { MediaFrame } from "@/components/media/media-frame";
import { youtubeId } from "@/components/media/youtube";
import type { MediaRef } from "@/content/types";

/**
 * Compact clickable thumbnail. Shows a poster image with a play button;
 * clicking swaps in the full MediaFrame player inline.
 */
export function MediaThumb({
  media,
  sourceUrl,
  sourceLabel,
}: {
  media: MediaRef;
  sourceUrl?: string | undefined;
  sourceLabel?: string | undefined;
}) {
  const { videoUrl, imageUrl, label } = media;
  const [expanded, setExpanded] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  // Expanding replaces the button the reader just activated, which dropped
  // keyboard focus to the top of the document. Move it onto the player.
  useEffect(() => {
    if (expanded) playerRef.current?.focus();
  }, [expanded]);

  if (expanded) {
    return (
      <div ref={playerRef} tabIndex={-1} className="outline-none">
        <MediaFrame media={media} className="border border-border" autoPlay />
      </div>
    );
  }

  // Determine thumbnail image
  const ytId = videoUrl ? youtubeId(videoUrl) : null;
  // maxresdefault is a true 16:9 frame but is not generated for every video;
  // hqdefault always exists, at 4:3 with black bars baked in, which
  // object-cover crops away. Falling back on error covers both.
  const ytThumb = ytId
    ? `https://img.youtube.com/vi/${ytId}/${thumbFailed ? "hqdefault" : "maxresdefault"}.jpg`
    : undefined;
  const thumb = ytThumb ?? imageUrl;

  if (!thumb && !sourceUrl) return null;

  if (!thumb && sourceUrl) {
    // No media — show a compact source-link card
    return (
      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex aspect-video w-full items-center justify-center border border-border bg-muted p-4 text-center transition-colors hover:bg-muted/70"
      >
        <span className="text-[10px] font-bold uppercase leading-tight tracking-wider text-muted-foreground">
          {sourceLabel ?? "View Source"}
          <ExternalLink className="mx-auto mt-1 size-3" />
        </span>
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setExpanded(true)}
      className="group relative aspect-video w-full overflow-hidden border border-border bg-primary/90 transition-[border-color,box-shadow] duration-200 hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-on-dark focus-visible:ring-offset-2"
      aria-label={`Play video: ${label}`}
    >
      <img
        src={thumb}
        alt=""
        loading="lazy"
        decoding="async"
        onError={() => setThumbFailed(true)}
        className="size-full object-cover"
      />
      <span className="absolute inset-0 flex items-center justify-center bg-primary/30 transition-colors group-hover:bg-primary/45">
        <span className="flex size-11 items-center justify-center rounded-full border-2 border-primary-foreground bg-primary/60 shadow-lg">
          <Play className="ml-0.5 size-5 fill-primary-foreground text-primary-foreground" />
        </span>
      </span>
    </button>
  );
}
