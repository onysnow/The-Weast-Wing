import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "@/lib/utils";

const AGENCIES = [
  { to: "/", acronym: "POS", name: "Presidential Office of Shitistics" },
  { to: "/bea", acronym: "BEA", name: "Bureau of Executive Anomalies" },
] as const;

export function AgencyNav({ activeAgency }: { activeAgency: "POS" | "BEA" }) {
  const [lockedAgency, setLockedAgency] = useState<string | null>(null);

  return (
    <nav
      aria-label="Weast Wing agencies"
      className="no-scrollbar sticky top-0 z-40 border-b-2 border-accent bg-primary shadow-lg"
    >
      <div className="no-scrollbar mx-auto flex max-w-4xl snap-x overflow-x-auto scroll-smooth">
        {AGENCIES.map((agency) => {
          const active = activeAgency === agency.acronym;
          const locked = lockedAgency === agency.acronym;

          return (
            <Link
              key={agency.acronym}
              to={agency.to}
              onClick={() =>
                setLockedAgency((current) =>
                  current === agency.acronym ? null : agency.acronym,
                )
              }
              aria-current={active ? "page" : undefined}
              aria-expanded={locked}
              aria-label={`${agency.acronym}: ${agency.name}`}
              className={cn(
                "group relative flex h-12 min-w-0 shrink-0 snap-start items-center justify-start overflow-hidden border-r border-primary-foreground/10 px-4 py-0 font-mono text-sm font-medium text-primary-foreground transition-[width,background-color] duration-300 hover:bg-primary-foreground/5 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:h-14",
                locked ? "w-[min(19rem,78vw)]" : "w-[4.75rem] hover:w-[min(19rem,78vw)]",
                active && "bg-primary-foreground/5",
              )}
            >
              <span className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-accent">
                {agency.acronym}
                {agency.acronym === "POS" && (
                  <span className="size-1.5 animate-pulse rounded-full bg-destructive" aria-hidden="true" />
                )}
              </span>
              <span
                className={cn(
                  "ml-3 overflow-hidden whitespace-nowrap text-[10px] font-bold uppercase text-primary-foreground/90 transition-[max-width,opacity] duration-300 sm:text-[11px]",
                  locked
                    ? "max-w-64 opacity-100"
                    : "max-w-0 opacity-0 group-hover:max-w-64 group-hover:opacity-100",
                )}
              >
                {agency.name}
              </span>
              <span
                className={cn(
                  "absolute bottom-0 left-0 h-1 w-full origin-left bg-accent transition-transform duration-200",
                  active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                )}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}