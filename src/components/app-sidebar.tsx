import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Pause, Play } from "lucide-react";
import type { ReactNode } from "react";
import { Seal } from "@/components/brand/seal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { setMotionState, useMotionState } from "@/lib/motion-preference";
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

// These ids must match the section ids in src/routes/index.tsx.
const POS_SECTIONS = [
  { id: "hero", label: "Counter" },
  { id: "what-reset-the-clock", label: "Latest report" },
  { id: "statistics", label: "Statistics" },
  { id: "incident-log", label: "Incident log" },
  { id: "submit-report", label: "Submit report" },
] as const;

/* ------------------------------- Sidebar -------------------------------- */

function AppSidebar({ activeAgency }: { activeAgency: "POS" | "BEA" }) {
  const { isMobile, setOpenMobile } = useSidebar();
  // On mobile the sidebar is a sheet laid over the page, so jumping to a
  // section has to close it or the sheet covers the thing you asked for.
  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="offcanvas" side="left" className="border-r-2 border-accent">
      <SidebarHeader className="on-navy bg-primary text-primary-foreground">
        <div className="flex items-center gap-2 px-1 py-2">
          <Seal className="size-9 shrink-0 text-seal" />
          <div className="min-w-0">
            <p className="font-display text-sm font-bold uppercase leading-tight tracking-[0.04em]">
              The Weast Wing
            </p>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-accent-on-dark">
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
                      <Link to={agency.to} onClick={closeOnMobile}>
                        <span className="flex items-center gap-1 font-mono text-xs font-bold text-accent">
                          {agency.acronym}
                          {agency.acronym === "POS" && (
                            <span
                              className="size-1.5 animate-pulse rounded-full bg-destructive"
                              aria-hidden="true"
                            />
                          )}
                        </span>
                        <span className="text-xs font-semibold leading-tight">{agency.name}</span>
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
                      <a href={`#${section.id}`} onClick={closeOnMobile}>
                        {section.label}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        <SidebarGroup>
          <SidebarGroupLabel>Screenings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/quiz" onClick={closeOnMobile}>
                    Aptitude screenings
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <p className="border-l-2 border-accent px-2 text-[10px] font-semibold uppercase leading-relaxed tracking-wide text-foreground">
          Our mission: defend the President. Badly.
        </p>
        <p className="px-2 pt-1 text-[10px] leading-relaxed text-muted-foreground">
          A parody site. Not an official government resource. Allegations are unproven.
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
    <Button
      variant="bar"
      size="icon-lg"
      onClick={toggleSidebar}
      aria-label={isOpen ? "Close navigation" : "Open navigation"}
      aria-expanded={isOpen}
      className="shrink-0"
    >
      <Menu className="size-7" strokeWidth={2.25} aria-hidden="true" />
    </Button>
  );
}

/* --------------------------- Motion control ------------------------------ */

const NOTICE = "A parody site. Not an official government resource. Allegations are unproven.";

function MotionToggle() {
  const motion = useMotionState();
  const paused = motion === "paused";

  return (
    <Button
      variant="bar"
      onClick={() => setMotionState(paused ? "running" : "paused")}
      aria-pressed={paused}
      className="h-auto min-h-8 shrink-0 gap-1 self-stretch border-l border-border bg-muted px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground sm:text-[11px]"
    >
      {paused ? (
        <Play className="size-3" aria-hidden="true" />
      ) : (
        <Pause className="size-3" aria-hidden="true" />
      )}
      <span>{paused ? "Play motion" : "Pause motion"}</span>
    </Button>
  );
}

/* ------------------------------- Ticker ---------------------------------- */

function NoticeTicker() {
  return (
    <div className="flex items-center border-b border-border bg-muted">
      {/* The moving copy is decorative duplication; the notice itself is
          announced once, below, so screen readers don't hear it six times. */}
      <div className="flex flex-1 overflow-hidden py-1.5" aria-hidden="true">
        {[0, 1].map((i) => (
          <div key={i} className="marquee-track">
            {[0, 1, 2].map((j) => (
              <span
                key={j}
                className="whitespace-nowrap px-6 text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:text-[11px]"
              >
                ⚠ {NOTICE}
              </span>
            ))}
          </div>
        ))}
      </div>
      <p className="sr-only">{NOTICE}</p>
      <MotionToggle />
    </div>
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
      <div className={cn("flex min-h-svh w-full flex-col bg-background font-sans text-foreground")}>
        <NoticeTicker />

        <header className="on-navy sticky top-0 z-30 bg-primary text-primary-foreground shadow-[0_1px_0_0_var(--color-accent)]">
          <div className="flex w-full items-center gap-2 px-2 py-2.5 sm:px-4 sm:py-4 lg:px-8">
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
