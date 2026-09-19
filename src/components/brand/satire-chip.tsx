import { cn } from "@/lib/utils";

/**
 * The satire marker.
 *
 * Not decoration. The standard fact-checkers apply is that a satire marker is
 * visible without scrolling or clicking, and this site works against itself on
 * that front: a news-style domain, journalistic prose, sourced allegations and
 * a government-document layout all push a skim-reader toward "real". The
 * disclaimers in the ticker and the footer are both one scroll away from the
 * thing a reader would screenshot.
 *
 * So this sits in the header — which is sticky, so it is on screen at every
 * scroll position — and on every card that can travel on its own.
 *
 * `tone` picks the surface: `dark` for the navy bars, `light` for paper. Both
 * are measured against their own background, and the marker is real text, not
 * an image or a background pattern, so it survives a screenshot reader, a
 * translation layer and a stylesheet that fails to load.
 */
export function SatireChip({
  tone = "light",
  className,
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center border px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase leading-none tracking-[0.16em]",
        tone === "dark" ? "border-accent-on-dark text-accent-on-dark" : "border-accent text-accent",
        className,
      )}
    >
      Satire
    </span>
  );
}
