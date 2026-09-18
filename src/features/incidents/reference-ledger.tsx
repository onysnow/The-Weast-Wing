import { ExternalLink } from "lucide-react";
import type { Reference } from "@/content/types";
import { ROLE_LABELS, getPlatformLabel } from "@/features/incidents/platform-labels";

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
