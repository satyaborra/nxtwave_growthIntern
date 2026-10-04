"use client";

import { CalendarRange, CheckCircle2, Circle, CircleDot, Rocket, Target, Wallet } from "lucide-react";
import { CountUp, SimulatedLabel } from "@/components/growth-engine/shared/primitives";
import { fmtINR, fmtPct } from "@/lib/format";
import type { CampaignSummary } from "@/lib/types";

const DAY_PLAN: { day: number; title: string; focus: string; lever: string }[] = [
  { day: 1, title: "Build + launch", focus: "Ship the landing page, referral engine and WhatsApp share loop.", lever: "Registration flow live" },
  { day: 2, title: "College club outreach", focus: "Brief 15–20 technical clubs and class reps with the share kit.", lever: "Clubs ×2" },
  { day: 3, title: "WhatsApp community distribution", focus: "Push through class groups, hostel groups and senior communities.", lever: "WhatsApp ×2" },
  { day: 4, title: "Referral push", focus: "Nudge every registrant to share their code with a ready-made message.", lever: "Referral loop" },
  { day: 5, title: "Paid acquisition experiment", focus: "Small, measured spend to test cost per registration vs ₹0 organic.", lever: "₹1,500 cap" },
  { day: 6, title: "Optimize best-performing channel", focus: "Reallocate effort to the top channel; A/B the referral message.", lever: "Reallocation" },
  { day: 7, title: "Final registration push", focus: "Last-day urgency messaging + direct club follow-ups to close the gap.", lever: "All channels" },
];

export function AdminCampaign({ data }: { data: CampaignSummary }) {
  const { kpis, daily, budget } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card-hover rounded-xl border bg-card p-5">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Target className="h-3.5 w-3.5" aria-hidden /> Daily target
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            ≈ <CountUp value={Math.round(kpis.target / 7)} />
            <span className="text-sm font-normal text-muted-foreground">/day</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">500 registrations ÷ 7 days</p>
        </div>
        <div className="card-hover rounded-xl border bg-card p-5">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Rocket className="h-3.5 w-3.5" aria-hidden /> Current pace
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            <CountUp value={kpis.latestDayRegistrations} />
            <span className="text-sm font-normal text-muted-foreground">/day</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Day {kpis.latestDay} · avg {kpis.avgPacePerDay.toFixed(1)}/day
          </p>
        </div>
        <div className="card-hover rounded-xl border bg-card p-5">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Wallet className="h-3.5 w-3.5" aria-hidden /> Budget deployed
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{fmtINR(budget.spent)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{fmtPct((budget.spent / budget.total) * 100, 0)} of ₹2,000 · {fmtINR(budget.remaining)} left</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <CalendarRange className="h-4 w-4 text-blue-400" aria-hidden /> 7-day campaign view
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Each day has a target slice of the 500-registration goal. Days 1–{kpis.latestDay} show actuals (demo data).
        </p>
        <ol className="mt-6 space-y-0">
          {DAY_PLAN.map((plan) => {
            const dayData = daily.find((d) => d.day === plan.day);
            const isPast = plan.day < kpis.latestDay;
            const isToday = plan.day === kpis.latestDay;
            const hit = dayData?.isActual ? dayData.registrations >= dayData.targetPerDay : false;
            return (
              <li key={plan.day} className="relative flex gap-4 pb-6 last:pb-0">
                {plan.day < 7 ? (
                  <span className="absolute left-[15px] top-8 h-full w-px bg-border" aria-hidden />
                ) : null}
                <span
                  className={`relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    isToday
                      ? "bg-blue-500 text-white ring-4 ring-blue-500/20"
                      : isPast
                        ? "bg-emerald-100 text-emerald-600 ring-1 ring-emerald-500/30"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isPast ? (
                    hit ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <CircleDot className="h-4 w-4" aria-hidden />
                  ) : isToday ? (
                    <CircleDot className="h-4 w-4" aria-hidden />
                  ) : (
                    <Circle className="h-4 w-4" aria-hidden />
                  )}
                </span>
                <div className={`flex-1 rounded-xl border p-4 ${isToday ? "border-blue-500/40 bg-blue-500/5" : "border-border/60 bg-background/40"}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Day {plan.day}
                      </span>
                      <p className="text-sm font-semibold">{plan.title}</p>
                    </div>
                    <div className="text-right text-xs">
                      {dayData?.isActual ? (
                        <span className="tabular-nums">
                          <span className="font-semibold text-foreground">{dayData.registrations}</span>{" "}
                          <span className="text-muted-foreground">/ {dayData.targetPerDay} target</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground tabular-nums">target: {dayData?.targetPerDay ?? Math.round(500 / 7)}</span>
                      )}
                    </div>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">{plan.focus}</p>
                  <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-blue-600">{plan.lever}</p>
                </div>
              </li>
            );
          })}
        </ol>
        <SimulatedLabel />
      </div>
    </div>
  );
}
