import { cn } from "@/lib/utils";
import type { MediaRef } from "@/content/types";

/**
 * A 16:9 media frame for any content item. Takes a normalized MediaRef rather
 * than an Incident's fields, which is what lets articles reuse it.
 */
export function MediaFrame({
  media,
  className,
}: {
  media: MediaRef;
  className?: string | undefined;
}) {
  const { videoUrl, imageUrl, imageCredit, label } = media;
  const isFile = !!videoUrl && /\.(mp4|webm)(\?|$)/i.test(videoUrl);
  if (!videoUrl && !imageUrl) return null;

  return (
    <figure className={cn("m-0", className)}>
      {videoUrl ? (
        <div className="aspect-video w-full bg-primary/90">
          {isFile ? (
            <video
              src={videoUrl}
              poster={imageUrl}
              controls
              preload="none"
              playsInline
              className="size-full object-contain"
            />
          ) : (
            <iframe
              src={videoUrl}
              title={label}
              loading="lazy"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
              className="size-full"
            />
          )}
        </div>
      ) : (
        <img
          src={imageUrl}
          alt={`Source photograph: ${label}`}
          loading="lazy"
          decoding="async"
          className="aspect-video w-full bg-muted object-cover"
        />
      )}
      {imageCredit && (
        <figcaption className="border-t border-border bg-muted px-3 py-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
          Source media: {imageCredit}
        </figcaption>
      )}
    </figure>
  );
}
