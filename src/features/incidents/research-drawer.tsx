import { m } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";

import type { Reference } from "@/content/types";
import { ReferenceLedger } from "@/features/incidents/reference-ledger";
import { TRANSITION, collapseVariants } from "@/lib/motion";

/**
 * The per-incident sources panel.
 *
 * This was a native `<details>`, which cannot be animated: the content
 * appeared and disappeared in a single frame, and on a long dossier the page
 * jumped under the reader. A controlled disclosure animates its height
 * instead. The markup keeps what `<details>` gave for free — a button that
 * reports its state, and a region the button owns — rather than dropping it
 * along with the element.
 */
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
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="border-t border-border">
      <button
        type="button"
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        aria-expanded={open}
        aria-controls={panelId}
        className="focus-ring-inset flex min-h-12 w-full cursor-pointer items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted sm:px-5"
      >
        <span className="text-xs font-bold uppercase tracking-tight text-foreground">
          Research Dossier
        </span>
        <m.span animate={{ rotate: open ? 180 : 0 }} transition={TRANSITION.fast} className="flex">
          <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
        </m.span>
      </button>

      <m.div
        id={panelId}
        variants={collapseVariants}
        // Mounted whether or not it is open, so the dossier — the sourcing
        // that makes this a research site rather than a joke — is in the
        // server-rendered HTML for crawlers instead of appearing only after a
        // click. `initial={false}` starts it at its current height without
        // animating on load; `inert` keeps the hidden copy out of the tab
        // order and out of the accessibility tree.
        initial={false}
        animate={open ? "visible" : "hidden"}
        transition={TRANSITION.drawer}
        inert={!open}
        // Height animates from 0, so the content has to be clipped on the way
        // through or it spills past the card edge mid-transition.
        className="overflow-hidden"
      >
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
      </m.div>
    </div>
  );
}
