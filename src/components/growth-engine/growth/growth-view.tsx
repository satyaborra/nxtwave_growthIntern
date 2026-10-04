"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity, ArrowDown, Check, ClipboardList, Copy, Link2, Loader2, Search,
  Share2, Trophy, UserRound, Users, Building2, MousePointerClick, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { BackToOverviewButton } from "@/components/growth-engine/shared/site-chrome";
import {
  CountUp, DemoBadge, EmptyState, TrendBadge,
} from "@/components/growth-engine/shared/primitives";
import { api } from "@/lib/api";
import { absoluteUrl, navigate, useHashRoute } from "@/lib/router";
import { useGrowthStore } from "@/lib/store";
import { relativeTime } from "@/lib/format";
import type { GrowthProfile } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SIDE_NAV = [
  { key: "top", label: "My Growth", icon: Zap, target: "growth-top" },
  { key: "referrals", label: "Referrals", icon: Users, target: "growth-funnel" },
  { key: "share", label: "Share", icon: Share2, target: "growth-share" },
  { key: "profile", label: "Profile", icon: UserRound, target: "growth-lookup" },
];

export function GrowthView() {
  const route = useHashRoute();
  const currentStudent = useGrowthStore((s) => s.currentStudent);
  const followedCode = useGrowthStore((s) => s.followedCode);
  const setFollowedCode = useGrowthStore((s) => s.setFollowedCode);
  const [lookup, setLookup] = useState("");
  const [activeNav, setActiveNav] = useState("top");

  const urlCode = (route.params.get("code") ?? "").toUpperCase();
  useEffect(() => {
    if (urlCode) setFollowedCode(urlCode);
  }, [urlCode, setFollowedCode]);

  const activeCode = followedCode ?? currentStudent?.referralCode ?? urlCode ?? "";

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["growth", activeCode],
    queryFn: () => api.growthProfile(activeCode),
    enabled: !!activeCode,
    retry: false,
  });

  const goto = (key: string, target: string) => {
    setActiveNav(key);
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
  };

  const shareMessage = data
    ? `Join me at "Build Your First AI Project in 60 Minutes" — a free online workshop for engineering students. Reserve your seat with my link: ${absoluteUrl(`/#/register?ref=${data.student.referralCode}`)}`
    : "";

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-sidebar lg:flex">
        <div className="px-5 py-5">
          <BackToOverviewButton dark stacked sub="Growth Profile" />
        </div>
        <nav aria-label="Profile sections" className="flex-1 space-y-1 px-3 py-2">
          {SIDE_NAV.map((item) => (
            <button
              key={item.key}
              onClick={() => goto(item.key, item.target)}
              aria-current={activeNav === item.key ? "true" : undefined}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors",
                activeNav === item.key
                  ? "bg-gradient-to-r from-blue-600/90 to-indigo-600/80 font-medium text-white shadow-lg shadow-blue-950/40"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4" aria-hidden />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="space-y-1 border-t border-white/5 p-4">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-slate-400 hover:bg-white/5 hover:text-white" onClick={() => navigate("/admin")}>
            <Activity className="h-4 w-4" aria-hidden /> Admin Dashboard
          </Button>
        </div>
        {/* user card */}
        <div className="mx-3 mb-4 flex items-center gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white" aria-hidden>
            {(data?.student.firstName ?? "Y")[0]}
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-white">
              {data ? data.student.firstName : "You"}
            </p>
            <p className="truncate text-[11px] text-slate-400">
              {data ? data.student.college : "Register to claim"}
            </p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* mobile anchor bar */}
        <div className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between gap-2 px-4 py-3">
            <BackToOverviewButton sub="Growth Profile" />
            <DemoBadge />
          </div>
          <nav aria-label="Profile sections" className="flex gap-1 overflow-x-auto px-3 pb-2 scrollbar-slim">
            {SIDE_NAV.map((item) => (
              <button
                key={item.key}
                onClick={() => goto(item.key, item.target)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs",
                  activeNav === item.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <item.icon className="h-3.5 w-3.5" aria-hidden />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-10">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-3" id="growth-top">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">My Growth</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Track your impact and invite more friends.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <DemoBadge className="hidden sm:inline-flex" />
              <Button
                className="gap-2 rounded-lg bg-[#25D366] text-[#052e16] shadow-sm hover:bg-[#1fb857]"
                disabled={!data}
                onClick={() =>
                  data &&
                  window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, "_blank", "noopener")
                }
              >
                <Share2 className="h-4 w-4" aria-hidden /> Share on WhatsApp
              </Button>
            </div>
          </div>

          {/* Lookup bar */}
          <div id="growth-lookup" className="mt-6 flex flex-wrap items-center gap-2.5 rounded-xl border bg-card p-3 shadow-soft">
            <form
              className="flex flex-1 flex-wrap items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const code = lookup.trim().toUpperCase();
                if (!code) return;
                setFollowedCode(code);
                setLookup("");
              }}
            >
              <Input
                value={lookup}
                onChange={(e) => setLookup(e.target.value)}
                placeholder="Look up any referral code — e.g. a code from the leaderboard"
                className="h-9 max-w-sm font-mono uppercase"
                aria-label="Referral code lookup"
              />
              <Button type="submit" size="sm" variant="outline" className="gap-1.5">
                <Search className="h-3.5 w-3.5" /> View profile
              </Button>
            </form>
            {currentStudent && activeCode !== currentStudent.referralCode ? (
              <Button size="sm" variant="ghost" onClick={() => setFollowedCode(currentStudent.referralCode)}>
                Back to my profile
              </Button>
            ) : null}
          </div>

          {isLoading ? <ProfileSkeleton /> : null}

          {isError ? (
            <div className="mt-6">
              <EmptyState
                icon={<UserRound className="h-6 w-6" />}
                title={error instanceof Error ? error.message : "Profile not found"}
                description={
                  currentStudent
                    ? `Try ${currentStudent.referralCode} — your own code from this browser.`
                    : "Register for the workshop first, or look up a referral code from the leaderboard."
                }
                action={
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => navigate("/register")}>Register free</Button>
                    <Button size="sm" variant="outline" onClick={() => navigate("/admin")}>
                      Open leaderboard
                    </Button>
                  </div>
                }
              />
            </div>
          ) : null}

          {data ? <ProfileBody data={data} /> : null}
        </div>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mt-6 space-y-4" aria-busy>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}

/* ------------------------------ KPI card ---------------------------------- */
function KpiCard({
  label, value, sub, icon, tone,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <div className="card-hover rounded-xl border bg-card p-5 shadow-soft">
      <div className="flex items-center gap-2.5">
        <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", tone)} aria-hidden>
          {icon}
        </span>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <div className="mt-3 text-[26px] font-semibold leading-none tracking-tight tabular-nums sm:text-[28px]">{value}</div>
      {sub ? <div className="mt-1.5 text-xs text-muted-foreground">{sub}</div> : null}
    </div>
  );
}

function ProfileBody({ data }: { data: GrowthProfile }) {
  const { student, stats, funnel, timeline } = data;
  const referralLink = absoluteUrl(`/#/register?ref=${student.referralCode}`);
  const shareMessage = `Join me at "Build Your First AI Project in 60 Minutes" — a free online workshop for engineering students. Reserve your seat with my link: ${referralLink}`;
  const [copied, setCopied] = useState<"link" | "code" | null>(null);

  const copy = async (text: string, what: "link" | "code") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      toast.success(what === "link" ? "Referral link copied" : "Referral code copied");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("Couldn't access the clipboard — copy it manually.");
    }
  };

  const stages = [
    { label: "Shared", value: funnel.shared, bar: "bg-sky-400", pct: 100 },
    { label: "Clicked", value: funnel.clicked, bar: "bg-indigo-500", pct: funnel.shared > 0 ? (funnel.clicked / funnel.shared) * 100 : 0 },
    { label: "Registered", value: funnel.registered, bar: "bg-violet-500", pct: funnel.shared > 0 ? (funnel.registered / funnel.shared) * 100 : 0 },
  ];

  const timelineIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("regist")) return { icon: <Users className="h-3.5 w-3.5" />, cls: "bg-emerald-100 text-emerald-600" };
    if (t.includes("click")) return { icon: <MousePointerClick className="h-3.5 w-3.5" />, cls: "bg-blue-100 text-blue-600" };
    if (t.includes("start")) return { icon: <ClipboardList className="h-3.5 w-3.5" />, cls: "bg-violet-100 text-violet-600" };
    return { icon: <Share2 className="h-3.5 w-3.5" />, cls: "bg-amber-100 text-amber-600" };
  };

  return (
    <div className="mt-6 space-y-5">
      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Registrations generated"
          value={<CountUp value={stats.registrations} />}
          sub="friends who registered via your link"
          icon={<Users className="h-4 w-4" />}
          tone="bg-blue-100 text-blue-600"
        />
        <KpiCard
          label="Referral conversion"
          value={
            stats.conversionPct !== null ? (
              <CountUp value={stats.conversionPct} decimals={1} suffix="%" />
            ) : (
              "—"
            )
          }
          sub="clicks that became registrations"
          icon={<MousePointerClick className="h-4 w-4" />}
          tone="bg-amber-100 text-amber-600"
        />
        <KpiCard
          label="Leaderboard position"
          value={
            stats.leaderboardRank ? (
              <span>#<CountUp value={stats.leaderboardRank} /></span>
            ) : (
              "Unranked"
            )
          }
          sub={stats.leaderboardRank ? `of ${stats.totalReferrers} active referrers` : "generate a referral to rank"}
          icon={<Trophy className="h-4 w-4" />}
          tone="bg-violet-100 text-violet-600"
        />
        <KpiCard
          label="College contribution"
          value={<CountUp value={stats.collegeRegistrations} />}
          sub={`total registrations from ${student.college}`}
          icon={<Building2 className="h-4 w-4" />}
          tone="bg-cyan-100 text-cyan-600"
        />
      </div>

      {/* Funnel / Activity / Share */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Referral funnel */}
        <div id="growth-funnel" className="scroll-mt-24 rounded-xl border bg-card p-6 shadow-soft">
          <h3 className="text-sm font-semibold text-foreground">Referral Funnel</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Shared → Clicked → Registered, measured from real events in the demo dataset.
          </p>
          <div className="mt-6 space-y-3">
            {stages.map((stage, idx) => (
              <div key={stage.label}>
                {idx > 0 ? (
                  <div className="mb-1.5 flex items-center justify-end gap-1 text-[11px] font-medium text-muted-foreground" aria-hidden>
                    <ArrowDown className="h-3 w-3" />
                    {stages[idx - 1].value > 0
                      ? `${((stage.value / stages[idx - 1].value) * 100).toFixed(0)}% continue`
                      : "—"}
                  </div>
                ) : null}
                <div className="flex items-center gap-3">
                  <div className="flex h-14 flex-1 items-center justify-center rounded-lg bg-muted/60">
                    <div
                      className={cn("flex h-full items-center rounded-lg transition-all duration-700", stage.bar)}
                      style={{ width: `${Math.max(14, Math.min(100, stage.pct))}%` }}
                    >
                      <span className="w-full text-center text-sm font-bold text-white drop-shadow-sm">
                        {stage.value}
                      </span>
                    </div>
                  </div>
                  <span className="w-12 text-right text-xs font-semibold tabular-nums text-muted-foreground">
                    {stage.pct.toFixed(0)}%
                  </span>
                </div>
                <p className="mt-1 text-[11px] font-medium text-muted-foreground">{stage.label}</p>
              </div>
            ))}
          </div>
          {funnel.registered === 0 ? (
            <p className="mt-4 rounded-lg bg-muted/50 px-3.5 py-2.5 text-xs text-muted-foreground">
              No referrals yet. Share your referral link to start your growth loop.
            </p>
          ) : null}
        </div>

        {/* Referral activity */}
        <div className="rounded-xl border bg-card p-6 shadow-soft">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Activity className="h-4 w-4 text-blue-500" aria-hidden />
            Referral Activity
          </h3>
          {timeline.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon={<ClipboardList className="h-5 w-5" />}
                title="No referral activity yet"
                description="When a friend registers through your link, they appear here with their college and branch."
              />
            </div>
          ) : (
            <ol className="scrollbar-slim mt-5 max-h-72 space-y-0 overflow-y-auto pr-1">
              {timeline.map((item, idx) => {
                const meta = timelineIcon(item.type);
                return (
                  <li key={idx} className="relative flex gap-3 pb-5 last:pb-0">
                    {idx < timeline.length - 1 ? (
                      <span className="absolute left-[13px] top-7 h-full w-px bg-border" aria-hidden />
                    ) : null}
                    <span className={cn("relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full", meta.cls)} aria-hidden>
                      {meta.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-sm font-medium text-foreground">{item.label}</p>
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {relativeTime(item.at as unknown as string)}
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Share your link */}
        <div id="growth-share" className="scroll-mt-24 rounded-xl border bg-card p-6 shadow-soft">
          <h3 className="text-sm font-semibold text-foreground">Share Your Link</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Your code: <span className="font-mono font-semibold text-foreground">{student.referralCode}</span>
          </p>
          <div className="mt-4 break-all rounded-lg bg-muted/60 px-3.5 py-2.5 font-mono text-[11px] text-muted-foreground">
            {referralLink}
          </div>
          <div className="mt-4 grid gap-2.5">
            <Button
              className="h-10 gap-2 rounded-lg bg-[#25D366] font-semibold text-[#052e16] hover:bg-[#1fb857]"
              onClick={() =>
                window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, "_blank", "noopener")
              }
            >
              <Share2 className="h-4 w-4" /> Share on WhatsApp
            </Button>
            <div className="grid grid-cols-2 gap-2.5">
              <Button variant="outline" className="h-10 gap-2 rounded-lg" onClick={() => copy(referralLink, "link")}>
                {copied === "link" ? <Check className="h-4 w-4 text-emerald-600" /> : <Link2 className="h-4 w-4" />}
                Copy Link
              </Button>
              <Button variant="outline" className="h-10 gap-2 rounded-lg" onClick={() => copy(student.referralCode, "code")}>
                {copied === "code" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                Copy Code
              </Button>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2.5">
            {[
              { label: "WhatsApp", cls: "bg-emerald-100 text-emerald-600", icon: <Share2 className="h-4 w-4" /> },
              { label: "Instagram", cls: "bg-pink-100 text-pink-600", icon: <Activity className="h-4 w-4" /> },
              { label: "Community", cls: "bg-blue-100 text-blue-600", icon: <Users className="h-4 w-4" /> },
            ].map((s) => (
              <button
                key={s.label}
                className={cn("flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-110", s.cls)}
                aria-label={`Share via ${s.label}`}
                title={`Share via ${s.label}`}
                onClick={() => copy(referralLink, "link")}
              >
                {s.icon}
              </button>
            ))}
          </div>
          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            The more you share, the more students we can reach!
          </p>
        </div>
      </div>
    </div>
  );
}
