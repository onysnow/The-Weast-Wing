import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, ExternalLink, Play } from "lucide-react";
import { type Reference, type ReferenceRole } from "@/data/incidents";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* ---------------------------------- Seal --------------------------------- */

export function BEASeal({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {Array.from({ length: 24 }).map((_, i) => (
        <rect
          key={i}
          x="49.5"
          y="4"
          width="1"
          height="4"
          fill="currentColor"
          transform={`rotate(${(360 / 24) * i} 50 50)`}
        />
      ))}
      <text
        x="50"
        y="44"
        textAnchor="middle"
        fontSize="20"
        fontWeight="bold"
        fill="currentColor"
        fontFamily="var(--font-display)"
      >
        BEA
      </text>
      <line x1="30" y1="50" x2="70" y2="50" stroke="currentColor" strokeWidth="1" />
      <text
        x="50"
        y="62"
        textAnchor="middle"
        fontSize="5"
        letterSpacing="0.5"
        fill="currentColor"
        fontFamily="var(--font-sans)"
      >
        BUREAU OF
      </text>
      <text
        x="50"
        y="70"
        textAnchor="middle"
        fontSize="5"
        letterSpacing="0.5"
        fill="currentColor"
        fontFamily="var(--font-sans)"
      >
        EXECUTIVE
      </text>
      <text
        x="50"
        y="78"
        textAnchor="middle"
        fontSize="5"
        letterSpacing="0.5"
        fill="currentColor"
        fontFamily="var(--font-sans)"
      >
        ANOMALIES
      </text>
    </svg>
  );
}

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
  videoUrl?: string | undefined;
  imageUrl?: string | undefined;
  imageCredit?: string | undefined;
  headline: string;
  className?: string | undefined;
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

/* -------------------------- Compact media thumbnail ----------------------- */

/** Extract a YouTube video ID from an embed URL. */
function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtube-nocookie\.com|youtube\.com)\/embed\/([^/?]+)/);
  return m?.[1] ?? null;
}

/**
 * Compact clickable thumbnail. Shows a small poster image with a play button;
 * clicking loads the full IncidentMedia player inline.
 */
export function CompactMedia({
  videoUrl,
  imageUrl,
  imageCredit,
  headline,
  sourceUrl,
  sourceLabel,
}: {
  videoUrl?: string | undefined;
  imageUrl?: string | undefined;
  imageCredit?: string | undefined;
  headline: string;
  sourceUrl?: string | undefined;
  sourceLabel?: string | undefined;
}) {
  const [expanded, setExpanded] = useState(false);

  if (expanded) {
    return (
      <IncidentMedia
        videoUrl={videoUrl}
        imageUrl={imageUrl}
        imageCredit={imageCredit}
        headline={headline}
        className="border border-border"
      />
    );
  }

  // Determine thumbnail image
  const ytId = videoUrl ? youtubeId(videoUrl) : null;
  const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : imageUrl;

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
      className="group relative aspect-video w-full overflow-hidden border border-border bg-primary/90 transition-[border-color,box-shadow] duration-200 hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`Play video: ${headline}`}
    >
      <img
        src={thumb}
        alt=""
        loading="lazy"
        decoding="async"
        className="size-full object-contain"
      />
      <span className="absolute inset-0 flex items-center justify-center bg-primary/30 transition-colors group-hover:bg-primary/45">
        <span className="flex size-11 items-center justify-center rounded-full border-2 border-primary-foreground bg-primary/60 shadow-lg">
          <Play className="ml-0.5 size-5 fill-primary-foreground text-primary-foreground" />
        </span>
      </span>
    </button>
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

/* ---------------------------- Official response --------------------------- */

/**
 * The Weast Wing's official defense of the President: earnest, official-looking,
 * and deeply unconvincing. This is the joke.
 */
export function OfficialResponse({ text }: { text?: string | undefined }) {
  if (!text) return null;
  return (
    <blockquote className="m-0 border border-border bg-muted p-3">
      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
        <Seal className="size-4 shrink-0 text-primary" />
        Official Response — The Weast Wing
      </p>
      <p className="mt-1.5 border-l-2 border-accent pl-3 text-xs italic leading-relaxed text-muted-foreground">
        “{text}”
      </p>
      <p className="mt-1.5 text-[9px] uppercase tracking-[0.14em] text-muted-foreground/70">
        Issued with total confidence. Reviewed by no one.
      </p>
    </blockquote>
  );
}

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

function getPlatformLabel(url: string): string {
  try {
    const host = new URL(url).hostname.replace("www.", "");
    return PLATFORM_MAP.find((p) => p.test(host))?.label ?? host;
  } catch {
    return "Link";
  }
}

const ROLE_LABELS: Record<ReferenceRole, string> = {
  primary: "Primary",
  allegation: "Allegation",
  "fact-check": "Fact Check",
  transcript: "Transcript",
  news: "News",
  commentary: "Commentary",
};

/* --------------------------- Reference ledger ----------------------------- */

/**
 * Unified cross-platform reference list. Every source — X, YouTube, Reddit,
 * news sites, fact-checkers — renders with the same compact citation-row
 * treatment regardless of platform.
 */
export function ReferenceLedger({
  references,
}: {
  references?: Reference[] | undefined;
}) {
  if (!references || references.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        Cross-Platform References
      </p>
      <ul className="space-y-1">
        {references.map((ref, i) => (
          <li key={i}>
            <a
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-border bg-muted px-2 py-1.5 transition-colors hover:bg-muted/70"
            >
              <span className="shrink-0 border border-border bg-card px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-foreground">
                {getPlatformLabel(ref.url)}
              </span>
              <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-accent">
                {ROLE_LABELS[ref.role]}
              </span>
              <span className="min-w-0 flex-1 truncate text-xs text-foreground underline underline-offset-2">
                {ref.label}
              </span>
              <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------ Expandable drawer ------------------------- */

export function ResearchDrawer({
  established,
  notes,
  references,
  permalink,
  sourceUrl,
  sourceLabel,
}: {
  established?: string | undefined;
  notes?: string | undefined;
  references?: Reference[] | undefined;
  permalink: string;
  sourceUrl?: string | undefined;
  sourceLabel?: string | undefined;
}) {
  return (
    <details className="group border-t border-border">
      <summary className="flex min-h-12 cursor-pointer items-center justify-between px-4 py-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-5 [&::-webkit-details-marker]:hidden">
        <span className="text-xs font-bold uppercase tracking-tight text-foreground">
          Research Dossier
        </span>
        <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-4 px-4 pb-5 pt-1 sm:px-5">
        {established && (
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              What Is Established
            </p>
            <p className="border-l-2 border-foreground/20 pl-3 text-xs leading-relaxed text-foreground">
              {established}
            </p>
          </div>
        )}
        {notes && (
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Editorial Notes
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">{notes}</p>
          </div>
        )}
        <ReferenceLedger references={references} />
        <div className="flex flex-wrap items-center gap-4 border-t border-border pt-3 text-xs font-semibold uppercase tracking-wider">
          <a href={permalink} className="text-accent underline underline-offset-4">
            Permalink
          </a>
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline underline-offset-4"
            >
              {sourceLabel ?? "Primary Source"} ↗
            </a>
          )}
        </div>
      </div>
    </details>
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
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open && document.activeElement instanceof HTMLElement) {
      openerRef.current = document.activeElement;
    }
  }, [open]);

  const closeAndRestoreFocus = () => {
    onClose();
    window.requestAnimationFrame(() => openerRef.current?.focus());
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && closeAndRestoreFocus()}>
      <DialogContent className="inset-x-0 bottom-0 top-auto max-h-[88dvh] w-full max-w-none translate-x-0 translate-y-0 gap-0 overflow-y-auto rounded-none border-x-0 border-b-0 border-t-4 border-t-accent p-0 sm:left-1/2 sm:top-1/2 sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:border-x sm:border-b">
        <DialogHeader className="border-b border-border px-5 py-5 pr-14 text-left sm:px-6">
          <DialogTitle className="font-display text-xl font-bold uppercase leading-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Information from The Weast Wing about {title.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 px-5 py-5 text-sm leading-relaxed text-muted-foreground sm:px-6">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"visible" | "hidden">("visible");

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (element.getBoundingClientRect().top <= window.innerHeight * 0.92) return;

    setState("hidden");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setState("visible");
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} data-reveal={state} className="incident-reveal">
      {children}
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
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className={shareBtn}
        >
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
