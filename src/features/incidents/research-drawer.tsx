import { ChevronDown } from "lucide-react";
import type { Reference } from "@/content/types";
import { ReferenceLedger } from "@/features/incidents/reference-ledger";

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
      <summary className="focus-ring-inset flex min-h-12 cursor-pointer items-center justify-between px-4 py-3 transition-colors hover:bg-muted sm:px-5 [&::-webkit-details-marker]:hidden">
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
