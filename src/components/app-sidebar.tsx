import { Link, useRouterState } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import type { ReactNode } from "react";
import { Seal } from "@/components/site";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

const AGENCIES = [
  { to: "/", acronym: "POS", name: "Presidential Office of Shitistics" },
  { to: "/bea", acronym: "BEA", name: "Bureau of Executive Anomalies" },
] as const;

const POS_SECTIONS = [
  { id: "hero", label: "Counter" },
  { id: "latest", label: "Latest report" },
  { id: "statistics", label: "Statistics" },
  { id: "log", label: "Incident log" },
  { id: "submit-report", label: "Submit report" },
] as const;

/* ------------------------------- Sidebar -------------------------------- */

function AppSidebar({ activeAgency }: { activeAgency: "POS" | "BEA" }) {
  return (
    <Sidebar
      collapsible="offcanvas"
      side="left"
      className="border-r-2 border-accent"
    >
      <SidebarHeader className="bg-primary text-primary-foreground">
        <div className="flex items-center gap-2 px-1 py-2">
          <Seal className="size-9 shrink-0 text-seal" />
          <div className="min-w-0">
            <p className="font-display text-sm font-bold uppercase leading-tight tracking-[0.04em]">
              The Weast Wing
            </p>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-accent">
              Agency directory
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator className="bg-primary-foreground/20" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Agencies</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {AGENCIES.map((agency) => {
                const active = activeAgency === agency.acronym;
                return (
                  <SidebarMenuItem key={agency.acronym}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={agency.to}>
                        <span className="flex items-center gap-1 font-mono text-xs font-bold text-accent">
                          {agency.acronym}
                          {agency.acronym === "POS" && (
                            <span
                              className="size-1.5 animate-pulse rounded-full bg-destructive"
                              aria-hidden="true"
                            />
                          )}
                        </span>
                        <span className="text-xs font-semibold leading-tight">
                          {agency.name}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {activeAgency === "POS" && (
          <SidebarGroup>
            <SidebarGroupLabel>POS sections</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {POS_SECTIONS.map((section) => (
                  <SidebarMenuItem key={section.id}>
                    <SidebarMenuButton asChild>
                      <a href={`#${section.id}`}>{section.label}</a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <p className="border-l-2 border-accent px-2 text-[10px] font-semibold uppercase leading-relaxed tracking-wide text-foreground">
          Our mission: defend the President. Badly.
        </p>
        <p className="px-2 pt-1 text-[10px] leading-relaxed text-muted-foreground">
          A parody site. Not an official government resource. Allegations are
          unproven.
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}

/* ------------------------------- Trigger -------------------------------- */

function BarsTrigger() {
  const { toggleSidebar, open, openMobile } = useSidebar();
  const isOpen = open || openMobile;
  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-label={isOpen ? "Close navigation" : "Open navigation"}
      aria-expanded={isOpen}
      className="flex size-11 shrink-0 items-center justify-center text-primary-foreground transition-colors hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
    >
      <Menu className="size-6" aria-hidden="true" />
    </button>
  );
}

/* ------------------------------- Shell ---------------------------------- */

/**
 * Root-level shell. Mounted once around <Outlet /> so the sidebar open state
 * survives client-side navigation between routes. The active agency is derived
 * from the current pathname.
 */
export function WeastShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const activeAgency: "POS" | "BEA" = pathname.startsWith("/bea") ? "BEA" : "POS";

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar activeAgency={activeAgency} />
      <div
        className={cn(
          "flex min-h-svh w-full flex-col bg-background font-sans text-foreground",
        )}
      >
        <div
          className="flex overflow-hidden border-b border-border bg-muted py-1.5"
          role="marquee"
          aria-label="Site notice"
        >
          {[0, 1].map((i) => (
            <div key={i} className="marquee-track" aria-hidden={i === 1}>
              {[0, 1, 2].map((j) => (
                <span
                  key={j}
                  className="whitespace-nowrap px-6 text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:text-[11px]"
                >
                  ⚠ A parody site. Not an official government resource.
                  Allegations are unproven.
                </span>
              ))}
            </div>
          ))}
        </div>

        <header className="bg-primary text-primary-foreground">
          <div className="mx-auto flex max-w-4xl items-center gap-1 px-2 py-2.5 sm:px-4 sm:py-4">
            <BarsTrigger />
            <Seal className="size-11 shrink-0 text-seal" />
            <p className="font-display text-lg font-bold uppercase leading-tight tracking-[0.06em] sm:text-xl">
              The Weast Wing
            </p>
          </div>
        </header>

        {children}
      </div>
    </SidebarProvider>
  );
}
