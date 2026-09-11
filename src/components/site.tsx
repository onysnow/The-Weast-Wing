import { useEffect, useState, type ReactNode } from "react";
import { RATING_LABELS } from "@/data/incidents";
import { cn } from "@/lib/utils";

/* ---------------------------------- Seal --------------------------------- */

export function Seal({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="50" cy="50" r="41" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="3" />
      {Array.from({ length: 32 }).map((_, i) => (
        <rect
          key={i}
          x="49.4"
          y="2"
          width="1.2"
          height="5"
          fill="currentColor"
          transform={`rotate(${(360 / 32) * i} 50 50)`}
        />
      ))}
      <path
        d="M50 30c8 0 11 5 10 9 5 1 8 4 8 8 4 1 6 4 6 7 0 4-4 7-9 7H35c-5 0-9-3-9-7 0-3 2-6 6-7 0-4 3-7 8-8-1-4 2-9 10-9z"
        fill="currentColor"
        opacity="0.9"
      />
      <text
        x="50"
        y="88"
        textAnchor="middle"
        fontSize="7"
        letterSpacing="1"
        fill="currentColor"
        fontFamily="var(--font-sans)"
      >
        EST. 2026
      </text>
    </svg>
  );
}

/* ------------------------------ Source media ----------------------------- */

export function IncidentMedia({
  videoUrl,
  imageUrl,
  imageCredit,
  headline,
  className,
}: {
  videoUrl?: string;
  imageUrl?: string;
  imageCredit?: string;
  headline: string;
  className?: string;
}) {
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
              title={headline}
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
          alt={`Source photograph: ${headline}`}
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

/* --------------------------------- Rating -------------------------------- */

export function PoopRating({ rating, size = "md" }: { rating: number; size?: "sm" | "md" }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        className={cn("flex gap-0.5", size === "md" ? "text-2xl" : "text-base")}
        role="img"
        aria-label={`Evidence rating ${rating} of 5: ${RATING_LABELS[rating]}`}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={n <= rating ? "" : "opacity-20 grayscale"} aria-hidden="true">
            💩
          </span>
        ))}
      </div>
      <span
        className={cn(
          "font-semibold uppercase tracking-wide text-accent",
          size === "md" ? "text-sm" : "text-xs",
        )}
      >
        {rating}/5 — {RATING_LABELS[rating]}
      </span>
    </div>
  );
}

/* --------------------------------- Badge --------------------------------- */

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 border border-accent/40 bg-accent/10 px-2 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-accent">
      <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
      {status}
    </span>
  );
}

/* --------------------------------- Ad slot -------------------------------- */

export function AdSlot({ label }: { label: string }) {
  return (
    <div
      className="my-8 flex h-20 items-center justify-center border border-dashed border-border bg-muted/50 text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
      aria-label="Advertisement placeholder"
    >
      {label}
    </div>
  );
}

/* ---------------------------------- Modal --------------------------------- */

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/60 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto border-t-4 border-accent bg-background p-6 shadow-xl sm:border sm:border-border sm:border-t-4"
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <h2 className="font-display text-xl font-bold uppercase tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="shrink-0 border border-border px-2 py-1 text-xs font-semibold uppercase hover:bg-muted"
          >
            Close
          </button>
        </div>
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}

/* --------------------------------- Share --------------------------------- */

export function ShareBar({ title, url }: { title: string; url?: string }) {
  const [copied, setCopied] = useState<string | null>(null);
  const [href, setHref] = useState(url ?? "");

  useEffect(() => {
    if (!url) setHref(window.location.href);
  }, [url]);

  const enc = encodeURIComponent(href);
  const encT = encodeURIComponent(title);

  const links = [
    { label: "X", href: `https://twitter.com/intent/tweet?text=${encT}&url=${enc}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc}` },
    { label: "Reddit", href: `https://www.reddit.com/submit?url=${enc}&title=${encT}` },
    { label: "Threads", href: `https://www.threads.net/intent/post?text=${encT}%20${enc}` },
  ];

  const shareBtn =
    "border border-border bg-card px-3 py-2 text-xs font-bold uppercase tracking-wider hover:bg-muted";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(href || window.location.href);
      setCopied("link");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  const shareNative = async (platform: string) => {
    const shareUrl = href || window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl, text: title });
        return;
      } catch {
        return; // user cancelled
      }
    }
    // Desktop fallback: copy the link
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(platform.toLowerCase());
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={copyLink} className={shareBtn}>
        {copied === "link" ? "Link copied" : "Copy link"}
      </button>
      {links.map((l) => (
        <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className={shareBtn}>
          {l.label}
        </a>
      ))}
      <button onClick={() => shareNative("Instagram")} className={shareBtn}>
        {copied === "instagram" ? "Link copied" : "Instagram"}
      </button>
      <button onClick={() => shareNative("TikTok")} className={shareBtn}>
        {copied === "tiktok" ? "Link copied" : "TikTok"}
      </button>
    </div>
  );
}
