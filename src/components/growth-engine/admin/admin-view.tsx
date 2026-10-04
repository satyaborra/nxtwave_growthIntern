"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2, BrainCircuit, CalendarRange, FlaskConical, Gauge,
  LayoutDashboard, Loader2, Menu, Network, RotateCcw, Share2, Sparkles,
  Trophy, UserRound, Users, X, Zap, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { navigate } from "@/lib/router";
import { useGrowthStore } from "@/lib/store";
import { DemoBadge } from "@/components/growth-engine/shared/primitives";
import { BackToOverviewButton } from "@/components/growth-engine/shared/site-chrome";
import { cn } from "@/lib/utils";
import { shortDate } from "@/lib/format";
import { AdminOverview } from "@/components/growth-engine/admin/sections/overview";
import { AdminRegistrations } from "@/components/growth-engine/admin/sections/registrations";
import { AdminReferrals } from "@/components/growth-engine/admin/sections/referrals";
import { AdminChannels } from "@/components/growth-engine/admin/sections/channels";
import { AdminColleges } from "@/components/growth-engine/admin/sections/colleges";
import { AdminLeaderboard } from "@/components/growth-engine/admin/sections/leaderboard";
import { AdminCampaign } from "@/components/growth-engine/admin/sections/campaign";
import { AdminInsights } from "@/components/growth-engine/admin/sections/insights";
import { AdminSimulator } from "@/components/growth-engine/admin/sections/simulator";

const NAV = [
  { key: "overview", href: "/admin", label: "Overview", icon: LayoutDashboard },
  { key: "registrations", href: "/admin/registrations", label: "Registrations", icon: Users },
  { key: "referrals", href: "/admin/referrals", label: "Referrals", icon: Share2 },
  { key: "channels", href: "/admin/channels", label: "Channels", icon: Network },
  { key: "colleges", href: "/admin/colleges", label: "Colleges", icon: Building2 },
  { key: "leaderboard", href: "/admin/leaderboard", label: "Leaderboard", icon: Trophy },
  { key: "campaign", href: "/admin/campaign", label: "Campaign", icon: CalendarRange },
  { key: "insights", href: "/admin/insights", label: "AI Insights", icon: BrainCircuit },
  { key: "simulator", href: "/admin/simulator", label: "Simulator", icon: FlaskConical },
];

export function AdminView({ path }: { path: string }) {
  const sub = path.replace(/^\/admin\/?/, "") || "overview";
  const [navOpen, setNavOpen] = useState(false);
  const queryClient = useQueryClient();
  const clearSession = useGrowthStore((s) => s.clear);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["campaign"],
    queryFn: api.campaign,
  });

  const resetMutation = useMutation({
    mutationFn: api.resetDemo,
    onSuccess: async () => {
      clearSession();
      await queryClient.invalidateQueries();
      toast.success("Demo reset", { description: "Live registrations were removed and the pristine simulated campaign restored." });
    },
    onError: (err: Error) => toast.error("Reset failed", { description: err.message }),
  });

  const section = (() => {
    switch (sub) {
      case "registrations": return <AdminRegistrations />;
      case "referrals": return <AdminReferrals data={data!} />;
      case "channels": return <AdminChannels data={data!} />;
      case "colleges": return <AdminColleges data={data!} />;
      case "leaderboard": return <AdminLeaderboard data={data!} />;
      case "campaign": return <AdminCampaign data={data!} />;
      case "insights": return <AdminInsights />;
      case "simulator": return <AdminSimulator data={data!} />;
      default: return <AdminOverview data={data!} />;
    }
  })();

  const demoControls = (onDone?: () => void) => (
    <DemoControls
      isFetching={isFetching}
      resetPending={resetMutation.isPending}
      onLoad={() => {
        refetch();
        toast.success("Demo campaign loaded", { description: "Simulated dataset synced from the seed." });
        onDone?.();
      }}
      onReset={() => {
        resetMutation.mutate();
        onDone?.();
      }}
    />
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-sidebar lg:flex">
        <div className="px-5 py-5">
          <BackToOverviewButton dark stacked sub="Admin" />
        </div>
        <nav aria-label="Dashboard sections" className="flex-1 space-y-1 overflow-y-auto px-3 py-2 scrollbar-slim">
          {NAV.map((item) => (
            <button
              key={item.key}
              onClick={() => navigate(item.href)}
              aria-current={sub === item.key ? "page" : undefined}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors",
                sub === item.key
                  ? "bg-gradient-to-r from-blue-600/90 to-indigo-600/80 font-medium text-white shadow-lg shadow-blue-950/40"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4" aria-hidden />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="space-y-1.5 border-t border-white/5 p-4">
          {demoControls()}
        </div>
        <div className="mx-3 mb-4 flex items-center gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600" aria-hidden>
            <UserRound className="h-4 w-4 text-white" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-white">Admin</p>
            <p className="text-[11px] text-slate-400">Growth Team</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
                onClick={() => setNavOpen(!navOpen)}
                aria-expanded={navOpen}
                aria-label={navOpen ? "Close navigation" : "Open navigation"}
              >
                {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <div className="lg:hidden">
                <BackToOverviewButton />
              </div>
              <div className="hidden sm:block">
                <h1 className="flex items-center gap-2 text-base font-bold tracking-tight text-foreground sm:text-lg">
                  <Gauge className="h-5 w-5 text-blue-600" aria-hidden />
                  AI Workshop Growth Command Center
                </h1>
                <p className="text-xs text-muted-foreground">
                  7-Day Campaign <span className="mx-0.5">•</span> Target: 500 Registrations
                  {data ? (
                    <>
                      {" "}
                      <span className="mx-0.5">•</span> Day {data.campaign.currentDay} of 7 in progress
                    </>
                  ) : null}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <DemoBadge />
              {data ? (
                <span
                  className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-soft md:inline-flex"
                  title={`Campaign window ${data.campaign.startDate} → ${data.campaign.endDate}`}
                >
                  <CalendarRange className="h-3.5 w-3.5 text-blue-600" aria-hidden />
                  <span>
                    <span className="font-semibold text-foreground">Day 1 – Day 7</span>
                    <span className="mx-1.5">·</span>
                    {shortDate(data.campaign.startDate)} – {shortDate(data.campaign.endDate)}
                  </span>
                </span>
              ) : null}
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => navigate("/register")}
              >
                <UserRound className="h-3.5 w-3.5" />
                Student view
              </Button>
            </div>
          </div>

          {navOpen ? (
            <nav aria-label="Dashboard sections" className="border-t border-border/70 bg-sidebar lg:hidden">
              <div className="px-4 pt-3 sm:hidden">
                <h1 className="flex items-center gap-2 text-base font-bold text-white">
                  <Gauge className="h-5 w-5 text-blue-400" aria-hidden />
                  AI Workshop Growth Command Center
                </h1>
                <p className="mt-0.5 text-xs text-slate-400">
                  7-Day Campaign • Target: 500 Registrations
                  {data ? ` • Day ${data.campaign.currentDay} of 7` : ""}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-1 p-3 sm:grid-cols-3">
                {NAV.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      navigate(item.href);
                      setNavOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                      sub === item.key
                        ? "bg-gradient-to-r from-blue-600/90 to-indigo-600/80 font-medium text-white"
                        : "text-slate-300 hover:bg-white/5"
                    )}
                  >
                    <item.icon className="h-4 w-4" aria-hidden />
                    {item.label}
                  </button>
                ))}
                <div className="col-span-2 mt-2 grid grid-cols-2 gap-2 sm:col-span-3">
                  {demoControls(() => setNavOpen(false))}
                </div>
              </div>
            </nav>
          ) : null}
        </header>

        <div className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {isLoading ? <DashboardSkeleton /> : null}
          {isError ? (
            <div className="rounded-xl border border-red-500/30 bg-red-50 p-6 text-sm text-red-700">
              <p className="flex items-center gap-2 font-medium">
                <XCircle className="h-4 w-4" /> Campaign data could not be loaded.
              </p>
              <p className="mt-1 text-red-600/80">{error instanceof Error ? error.message : "Unknown error."}</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          ) : null}
          {data ? <div className="animate-in fade-in duration-300">{section}</div> : null}
          <p className="mt-10 text-center text-[11px] italic text-muted-foreground">
            Demo Campaign Data — all figures in this command center are simulated for the Growth
            Challenge. They do not represent actual NxtWave campaign results.
          </p>
        </div>
      </div>
    </div>
  );
}

function DemoControls({
  isFetching, resetPending, onLoad, onReset,
}: {
  isFetching: boolean;
  resetPending: boolean;
  onLoad: () => void;
  onReset: () => void;
}) {
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-1.5 border-white/15 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
        onClick={onLoad}
      >
        {isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
        Load Demo Campaign
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-1.5 border-white/15 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
        disabled={resetPending}
        onClick={onReset}
      >
        {resetPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
        Reset Demo
      </Button>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4" aria-busy>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl border bg-card/60" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-xl border bg-card/60" />
      <div className="h-64 animate-pulse rounded-xl border bg-card/60" />
    </div>
  );
}
