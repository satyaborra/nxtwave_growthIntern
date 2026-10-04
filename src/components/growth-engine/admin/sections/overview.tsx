"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight, Award, Building2, CircleDollarSign, FlaskConical, Info,
  Medal, MousePointerClick, Share2, Target, TrendingUp, UserPlus, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  CountUp, DemoBadge, StatCard,
} from "@/components/growth-engine/shared/primitives";
import { DailyChart, CampaignDonut, FunnelBars } from "@/components/growth-engine/admin/charts";
import { navigate } from "@/lib/router";
import { runSimulation, type SimulatorInputs } from "@/lib/simulator";
import { fmtINR, fmtINR1, fmtNum, fmtPct } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CampaignSummary } from "@/lib/types";

export function AdminOverview({ data }: { data: CampaignSummary }) {
  const { kpis, daily, funnel, channels, budget, leaderboard } = data;
  const paceDeltaPct = kpis.requiredPacePerDay > 0
    ? ((kpis.latestDayRegistrations - kpis.requiredPacePerDay) / kpis.requiredPacePerDay) * 100
    : 0;
  const ahead = paceDeltaPct >= 0;

  return (
    <div className="space-y-5">
      {/* ------------------------------ KPI cards ------------------------------ */}
      <section aria-label="Key campaign metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Registrations"
          tone="blue"
          icon={<Users className="h-4 w-4" />}
          value={<CountUp value={kpis.registrations} />}
          sub={`of ${fmtNum(kpis.target)} target`}
        />
        <StatCard
          label="Target Progress"
          tone="emerald"
          icon={<Target className="h-4 w-4" />}
          value={<CountUp value={kpis.progressPct} decimals={1} suffix="%" />}
          sub={
            <span className={cn("font-medium", ahead ? "text-emerald-600" : "text-amber-600")}>
              {ahead ? "▲ " : "▼ "}
              {Math.abs(paceDeltaPct).toFixed(1)}% {ahead ? "ahead of" : "behind"} required pace
            </span>
          }
        />
        <StatCard
          label="Referral Registrations"
          tone="violet"
          icon={<Share2 className="h-4 w-4" />}
          value={<CountUp value={kpis.referralRegistrations} />}
          sub={`${kpis.referralSharePct.toFixed(1)}% of total`}
        />
        <StatCard
          label="Colleges Reached"
          tone="cyan"
          icon={<Building2 className="h-4 w-4" />}
          value={<CountUp value={kpis.collegesReached} />}
          sub="distinct colleges in the demo dataset"
        />
        <StatCard
          label="Active Referrers"
          tone="amber"
          icon={<UserPlus className="h-4 w-4" />}
          value={<CountUp value={kpis.activeReferrers} />}
          sub="students with ≥1 attributed registration"
        />
        <StatCard
          label="Conversion Rate"
          tone="pink"
          icon={<MousePointerClick className="h-4 w-4" />}
          value={<CountUp value={kpis.conversionRatePct} decimals={1} suffix="%" />}
          sub={`${fmtNum(kpis.registrations)} registrations / ${fmtNum(kpis.visits)} visits`}
        />
      </section>

      {/* --------------------- Trend + campaign progress ---------------------- */}
      <section aria-label="Trend and target progress" className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-soft xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Registration Trend</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Actuals for Days 1–{kpis.latestDay} · projected pace for Days {kpis.latestDay + 1}–7
              </p>
            </div>
          </div>
          <div className="mt-3">
            <DailyChart daily={daily} kpis={kpis} />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-soft">
          <h2 className="text-sm font-semibold text-foreground">Campaign Progress</h2>
          <div className="mt-3 flex flex-col items-center">
            <CampaignDonut value={kpis.progressPct} sublabel={`${fmtNum(kpis.registrations)} / ${fmtNum(kpis.target)} registrations`} />
            <p className="mt-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground tabular-nums">{fmtNum(kpis.remaining)} registrations</span> to target
            </p>
            <span
              className={cn(
                "mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1",
                ahead
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-500/25"
                  : "bg-amber-50 text-amber-700 ring-amber-500/25"
              )}
            >
              <TrendingUp className="h-3 w-3" aria-hidden />
              {ahead ? "Ahead of simulated target" : "Behind simulated target"}
            </span>
          </div>
          <div className="mt-5 space-y-2">
            <MiniStat label="Daily target" value={`${Math.round(kpis.target / 7)}/day`} icon={<Target className="h-3.5 w-3.5" />} tone="bg-blue-100 text-blue-600" />
            <MiniStat label="Current pace" value={`${kpis.latestDayRegistrations}/day`} icon={<TrendingUp className="h-3.5 w-3.5" />} tone="bg-emerald-100 text-emerald-600" />
            <MiniStat
              label="vs target"
              value={`${ahead ? "+" : ""}${paceDeltaPct.toFixed(1)}%`}
              icon={<Award className="h-3.5 w-3.5" />}
              tone={ahead ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}
            />
          </div>
        </div>
      </section>

      {/* ------------------------- Bottom analysis row ------------------------- */}
      <section aria-label="Channel, funnel, leaderboard and simulator" className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <ChannelPerformanceCard channels={channels} />
        <FunnelCard funnel={funnel} />
        <ContributorsCard leaderboard={leaderboard} />
        <MiniSimulatorCard data={data} />
      </section>
    </div>
  );
}

/* ------------------------------- Mini stat --------------------------------- */
function MiniStat({
  label, value, icon, tone,
}: {
  label: string; value: string; icon: React.ReactNode; tone: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3.5 py-2.5">
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className={cn("flex h-6 w-6 items-center justify-center rounded-md", tone)} aria-hidden>
          {icon}
        </span>
        {label}
      </span>
      <span className="text-sm font-semibold tabular-nums text-foreground">{value}</span>
    </div>
  );
}

/* -------------------------- Channel performance --------------------------- */
const CHANNEL_COLORS: Record<string, string> = {
  "WhatsApp Group": "#22c55e",
  "College Club": "#3b82f6",
  "Friend Referral": "#8b5cf6",
  "Instagram": "#ec4899",
  "LinkedIn": "#0ea5e9",
  "Email": "#f59e0b",
  "Other": "#94a3b8",
};

function ChannelPerformanceCard({ channels }: { channels: CampaignSummary["channels"] }) {
  const maxRegs = Math.max(...channels.map((c) => c.registrations), 1);
  return (
    <div className="flex flex-col rounded-xl border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Channel Performance</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Registrations by acquisition channel</p>
        </div>
        <DemoBadge className="shrink-0 border-rose-500/30 bg-rose-100 text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300" />
      </div>
      <div className="mt-3 space-y-2.5">
        {channels.slice(0, 6).map((c) => (
          <div key={c.channel} className="flex items-center gap-2.5 text-xs">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: CHANNEL_COLORS[c.channel] ?? "#94a3b8" }} aria-hidden />
            <span className="w-24 shrink-0 truncate font-medium text-foreground">{c.channel}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(c.registrations / maxRegs) * 100}%`, background: CHANNEL_COLORS[c.channel] ?? "#94a3b8" }}
              />
            </div>
            <span className="w-8 shrink-0 text-right font-semibold tabular-nums text-foreground">{c.registrations}</span>
            <span className="w-11 shrink-0 text-right tabular-nums text-muted-foreground">{fmtPct(c.sharePct, 0)}</span>
            <span className="w-12 shrink-0 text-right tabular-nums text-muted-foreground">
              {c.spend > 0 && c.costPerReg !== null ? `₹${c.costPerReg.toFixed(2)}` : "₹0"}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-between pt-3">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Channel · Regs · Share · ₹/Reg</span>
        <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs text-blue-600 hover:text-blue-700" onClick={() => navigate("/admin/channels")}>
          View all <ArrowRight className="h-3 w-3" aria-hidden />
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------ Growth funnel ------------------------------ */
function FunnelCard({ funnel }: { funnel: CampaignSummary["funnel"] }) {
  return (
    <div className="flex flex-col rounded-xl border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Growth Funnel</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">From awareness to registration</p>
        </div>
        <DemoBadge className="shrink-0 border-rose-500/30 bg-rose-100 text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300" />
      </div>
      <div className="mt-3 flex-1">
        <FunnelBars funnel={funnel} />
      </div>
    </div>
  );
}

/* ---------------------------- Top contributors ----------------------------- */
function ContributorsCard({ leaderboard }: { leaderboard: CampaignSummary["leaderboard"] }) {
  return (
    <div className="flex flex-col rounded-xl border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Top Growth Contributors</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Students driving the most registrations</p>
        </div>
        <DemoBadge className="shrink-0 border-rose-500/30 bg-rose-100 text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300" />
      </div>
      <div className="mt-3 space-y-1">
        <div className="flex items-center gap-2 px-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          <span className="w-6">#</span>
          <span className="flex-1">Student</span>
          <span className="w-10 text-right">Refs</span>
          <span className="w-12 text-right">Clicks</span>
          <span className="w-12 text-right">Conv.</span>
        </div>
        {leaderboard.slice(0, 7).map((row) => (
          <div key={row.studentId} className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 text-xs transition-colors hover:bg-muted/50">
            <span className="flex w-6 items-center">
              {row.rank === 1 ? (
                <Medal className="h-4 w-4 text-amber-500" aria-label="Rank 1" />
              ) : row.rank === 2 ? (
                <Medal className="h-4 w-4 text-slate-400" aria-label="Rank 2" />
              ) : row.rank === 3 ? (
                <Medal className="h-4 w-4 text-orange-500" aria-label="Rank 3" />
              ) : (
                <span className="w-4 text-center tabular-nums text-muted-foreground">{row.rank}</span>
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium text-foreground">{row.maskedName}</span>
              <span className="block truncate text-[10px] text-muted-foreground">{row.college}</span>
            </span>
            <span className="w-10 text-right font-semibold tabular-nums text-foreground">{row.referrals}</span>
            <span className="w-12 text-right tabular-nums text-muted-foreground">{row.clicks}</span>
            <span className="w-12 text-right font-medium tabular-nums text-emerald-600">{row.conversionPct.toFixed(0)}%</span>
          </div>
        ))}
      </div>
      <div className="mt-auto flex justify-end pt-2">
        <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs text-blue-600 hover:text-blue-700" onClick={() => navigate("/admin/leaderboard")}>
          View all <ArrowRight className="h-3 w-3" aria-hidden />
        </Button>
      </div>
    </div>
  );
}

/* ---------------------------- Mini simulator ------------------------------- */
const SIM_DEFAULTS: SimulatorInputs = {
  whatsappEffort: 100,
  clubsEffort: 100,
  referralEffort: 100,
  paidSpend: 500,
};

function MiniSimulatorCard({ data }: { data: CampaignSummary }) {
  const [inputs, setInputs] = useState<SimulatorInputs>(SIM_DEFAULTS);
  const daysRemaining = data.kpis.daysRemaining;

  const result = useMemo(
    () => runSimulation(inputs, data.kpis.registrations, daysRemaining),
    [inputs, data.kpis.registrations, daysRemaining]
  );
  const baseline = useMemo(
    () => runSimulation(SIM_DEFAULTS, data.kpis.registrations, daysRemaining),
    [data.kpis.registrations, daysRemaining]
  );

  const deltaPct = baseline.totalProjected > 0
    ? ((result.totalProjected - baseline.totalProjected) / baseline.totalProjected) * 100
    : 0;
  const blendedCpa = result.totalProjected > 0
    ? (data.budget.spent + inputs.paidSpend) / result.totalProjected
    : 0;

  const set = (key: keyof SimulatorInputs) => (value: number[]) =>
    setInputs((prev) => ({ ...prev, [key]: value[0] }));

  return (
    <div className="flex flex-col rounded-xl border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Campaign Simulator</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">What if we change the channel allocation?</p>
        </div>
        <DemoBadge />
      </div>

      <div className="mt-4 space-y-3.5">
        <SimSlider label="WhatsApp Groups" value={inputs.whatsappEffort} onChange={set("whatsappEffort")} />
        <SimSlider label="College Clubs" value={inputs.clubsEffort} onChange={set("clubsEffort")} />
        <SimSlider label="Student Referrals" value={inputs.referralEffort} onChange={set("referralEffort")} />
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">Paid Ads spend</span>
            <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-muted-foreground">
              {fmtINR(inputs.paidSpend)}
            </span>
          </div>
          <Slider
            value={[inputs.paidSpend]}
            onValueChange={set("paidSpend")}
            min={0}
            max={data.budget.remaining}
            step={50}
            aria-label="Paid spend"
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <div className={cn("rounded-lg border p-3", result.hitsTarget ? "border-emerald-500/30 bg-emerald-50" : "border-amber-500/30 bg-amber-50")}>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Projected Registrations</p>
          <p className={cn("mt-1 text-xl font-bold tabular-nums", result.hitsTarget ? "text-emerald-700" : "text-amber-700")}>
            {fmtNum(result.totalProjected)}
          </p>
          <p className={cn("text-[10px] font-medium", deltaPct >= 0 ? "text-emerald-600" : "text-red-600")}>
            {deltaPct >= 0 ? "▲" : "▼"} {Math.abs(deltaPct).toFixed(1)}% vs current mix
          </p>
        </div>
        <div className="rounded-lg border border-border/60 bg-muted/40 p-3">
          <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            <CircleDollarSign className="h-3 w-3" aria-hidden /> Cost / Registration
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums text-foreground">{fmtINR1(blendedCpa)}</p>
          <p className="text-[10px] text-muted-foreground">blended projection</p>
        </div>
      </div>

      <p className="mt-3 flex items-start gap-1 text-[10px] italic text-muted-foreground">
        <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
        Simulation — not actual campaign results
      </p>
      <div className="mt-auto pt-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-1.5 border-slate-800 bg-slate-900 text-white hover:bg-slate-800 hover:text-white"
          onClick={() => navigate("/admin/simulator")}
        >
          <FlaskConical className="h-3.5 w-3.5" aria-hidden />
          Open full simulator
        </Button>
      </div>
    </div>
  );
}

function SimSlider({
  label, value, onChange,
}: {
  label: string; value: number; onChange: (v: number[]) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-muted-foreground">
          {value}%
        </span>
      </div>
      <Slider value={[value]} onValueChange={onChange} min={0} max={200} step={10} aria-label={label} />
    </div>
  );
}
