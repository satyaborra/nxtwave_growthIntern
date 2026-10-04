"use client";

import { useState } from "react";
import { Zap, Menu, X, Rocket, LayoutDashboard, UserRound, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { navigate, useHashRoute } from "@/lib/router";
import { cn } from "@/lib/utils";
import { DemoBadge } from "@/components/growth-engine/shared/primitives";

/* --------------------------------- Logo ----------------------------------- */
export function Logo({
  sub,
  dark = false,
  className,
}: {
  sub?: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 shadow-lg shadow-blue-600/25 ring-1 ring-white/20"
        aria-hidden
      >
        <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
      </span>
      <span className="flex flex-col items-start leading-none">
        <span className={cn("text-[15px] font-bold tracking-tight", dark ? "text-white" : "text-foreground")}>
          NxtWave
        </span>
        {sub ? (
          <span
            className={cn(
              "mt-0.5 text-[10px] font-medium uppercase tracking-widest",
              dark ? "text-blue-300/80" : "text-muted-foreground"
            )}
          >
            {sub}
          </span>
        ) : null}
      </span>
    </span>
  );
}

/* ------------------------------ Public nav --------------------------------- */
const PUBLIC_LINKS = [
  { label: "Workshop", href: "#top" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Why Attend", href: "#why-this-workshop" },
  { label: "Why This Asset", href: "#why-i-built-this" },
];

export function SiteNav({ variant = "light" }: { variant?: "light" | "hero" }) {
  const [open, setOpen] = useState(false);
  const route = useHashRoute();
  const isHero = variant === "hero";

  const go = (href: string) => {
    if (href === "#top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (href.startsWith("#/")) {
      navigate(href.replace(/^#/, ""));
      return;
    }
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full backdrop-blur-xl",
        isHero
          ? "border-b border-white/5 bg-[#070b1e]/75"
          : "border-b border-border/70 bg-background/85"
      )}
    >
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6"
      >
        <button
          onClick={() => go("#top")}
          className="rounded-lg outline-none ring-ring focus-visible:ring-2"
          aria-label="NxtWave AI Workshop Growth Engine — home"
        >
          <Logo sub={isHero ? undefined : "Growth Engine"} dark={isHero} />
        </button>

        <div className="hidden items-center gap-1 lg:flex">
          {PUBLIC_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => go(link.href)}
              className={cn(
                "rounded-lg px-3 py-2 text-sm transition-colors",
                isHero
                  ? "text-slate-300 hover:bg-white/5 hover:text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {link.label}
            </button>
          ))}
          <span className={cn("mx-2 h-5 w-px", isHero ? "bg-white/10" : "bg-border")} aria-hidden />
          <button
            onClick={() => go("#/growth")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors",
              isHero
                ? "text-slate-300 hover:bg-white/5 hover:text-white"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              route.path === "/growth" && !isHero && "text-foreground"
            )}
          >
            <UserRound className="h-3.5 w-3.5" aria-hidden /> My Growth
          </button>
          <button
            onClick={() => go("#/admin")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors",
              isHero
                ? "text-slate-300 hover:bg-white/5 hover:text-white"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <LayoutDashboard className="h-3.5 w-3.5" aria-hidden /> Dashboard
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => navigate("/register")}
            className="gap-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-4 shadow-lg shadow-blue-600/30 hover:from-blue-400 hover:to-indigo-500"
          >
            <Rocket className="h-3.5 w-3.5" aria-hidden />
            Register Free
          </Button>
          <button
            className={cn(
              "rounded-lg p-2 lg:hidden",
              isHero ? "text-slate-300 hover:bg-white/5" : "text-muted-foreground hover:bg-muted"
            )}
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div
          className={cn(
            "border-t px-4 pb-4 pt-2 lg:hidden",
            isHero ? "border-white/5 bg-[#070b1e]/95" : "border-border/70 bg-background/95"
          )}
        >
          <div className="flex flex-col gap-1">
            {PUBLIC_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => {
                  go(link.href);
                  setOpen(false);
                }}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-left text-sm",
                  isHero ? "text-slate-300 hover:bg-white/5 hover:text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                go("#/growth");
                setOpen(false);
              }}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm",
                isHero ? "text-slate-300 hover:bg-white/5 hover:text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <UserRound className="h-4 w-4" /> My Growth
            </button>
            <button
              onClick={() => {
                go("#/admin");
                setOpen(false);
              }}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm",
                isHero ? "text-slate-300 hover:bg-white/5 hover:text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <LayoutDashboard className="h-4 w-4" /> Growth Dashboard
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}

/* ------------------- Back-to-overview button (shared) ---------------------- */
/** The logo doubles as the explicit "back to overview" button — visible arrow +
 *  label, hover pill, and native tooltip make the affordance unmistakable.
 *  `stacked` fits narrow sidebars: logo on top, back label beneath. */
export function BackToOverviewButton({
  dark = false,
  sub,
  stacked = false,
}: {
  dark?: boolean;
  sub?: string;
  stacked?: boolean;
}) {
  const labelCls = cn(
    "flex items-center gap-1 font-medium transition-colors",
    dark
      ? "text-slate-400 group-hover:text-white"
      : "text-muted-foreground group-hover:text-foreground"
  );
  const arrow = (
    <ArrowLeft
      className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5"
      aria-hidden
    />
  );

  if (stacked) {
    return (
      <button
        onClick={() => navigate("/")}
        className={cn(
          "group -m-1 flex w-[calc(100%+0.5rem)] flex-col items-start gap-2 rounded-xl p-1 text-left outline-none ring-ring transition-colors focus-visible:ring-2",
          dark ? "hover:bg-white/5" : "hover:bg-muted/70"
        )}
        aria-label="Back to overview page"
        title="Back to overview"
      >
        <Logo dark={dark} sub={sub} />
        <span className={cn(labelCls, "px-0.5 text-[11px]")}>
          {arrow}
          Back to Overview
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate("/")}
      className={cn(
        "group -ml-1.5 flex items-center gap-2 rounded-xl p-1.5 outline-none ring-ring transition-colors focus-visible:ring-2",
        dark ? "hover:bg-white/5" : "hover:bg-muted/70"
      )}
      aria-label="Back to overview page"
      title="Back to overview"
    >
      <Logo dark={dark} sub={sub} />
      <span className={cn(labelCls, "text-xs")}>
        {arrow}
        <span className="hidden sm:inline">Back to Overview</span>
        <span className="sm:hidden">Back</span>
      </span>
    </button>
  );
}

/* --------------------- Compact app header (register / success) -------------- */
export function AppHeader({ dark = false }: { dark?: boolean }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b backdrop-blur-xl",
        dark ? "border-white/5 bg-[#070b1e]/75" : "border-border/70 bg-background/85"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <BackToOverviewButton dark={dark} />
        <DemoBadge />
      </div>
    </header>
  );
}

/* --------------------------------- Footer ---------------------------------- */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-background/60">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center">
        <div className="space-y-1.5">
          <p className="flex items-center gap-2 text-sm font-medium">
            <DemoBadge />
            NxtWave Growth Intern Challenge — simulation
          </p>
          <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
            This product is a working prototype built for the Growth Challenge. Every campaign
            number shown is <span className="font-medium text-foreground/80">simulated demo data</span> —
            no real student outreach was performed and no actual NxtWave campaign results are
            implied. The workshop itself is described exactly as briefed: free, 60 minutes,
            hands-on, beginner-friendly.
          </p>
        </div>
        <div className="flex flex-col gap-1 text-xs text-muted-foreground md:items-end">
          <span>Acquisition → Registration → Referral → Attribution → Analytics → Optimization</span>
          <span className="font-mono text-[11px] text-muted-foreground/70">
            Built with Next.js · TypeScript · Prisma · Recharts
          </span>
        </div>
      </div>
    </footer>
  );
}
