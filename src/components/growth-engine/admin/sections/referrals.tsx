"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Link2, MousePointerClick, Share2, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CountUp, EmptyState, StatCard,
} from "@/components/growth-engine/shared/primitives";
import { FunnelViz } from "@/components/growth-engine/admin/charts";
import { navigate } from "@/lib/router";
import type { CampaignSummary } from "@/lib/types";

export function AdminReferrals({ data }: { data: CampaignSummary }) {
  const { kpis, funnel, leaderboard } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Referral registrations"
          value={<CountUp value={kpis.referralRegistrations} />}
          sub={`${kpis.referralSharePct.toFixed(1)}% of all registrations`}
          icon={<Users className="h-4 w-4 text-violet-400" />}
        />
        <StatCard
          label="Active referrers"
          value={<CountUp value={kpis.activeReferrers} />}
          sub="students with ≥1 attributed friend"
          icon={<Link2 className="h-4 w-4 text-blue-400" />}
        />
        <StatCard
          label="Referral shares"
          value={<CountUp value={funnel.find((f) => f.key === "shares")?.value ?? 0} />}
          sub="students who shared their link"
          icon={<Share2 className="h-4 w-4 text-emerald-400" />}
        />
        <StatCard
          label="Link clicks"
          value={<CountUp value={funnel.find((f) => f.key === "clicks")?.value ?? 0} />}
          sub={`≈ ${(
            (funnel.find((f) => f.key === "clicks")?.value ?? 0) /
            Math.max(1, funnel.find((f) => f.key === "shares")?.value ?? 1)
          ).toFixed(1)} clicks per share`}
          icon={<MousePointerClick className="h-4 w-4 text-cyan-400" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-sm font-semibold">Referral loop funnel</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Registrations → shares → clicks → referred registrations. The loop that compounds growth.
          </p>
          <div className="mt-4">
            <FunnelViz funnel={funnel.filter((f) => f.stage === "loop" || f.key === "registrations")} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Trophy className="h-4 w-4 text-amber-400" aria-hidden /> Top growth contributors
              </h2>
              <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/admin/leaderboard")}>
                Full leaderboard <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
            {leaderboard.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  title="No referrals recorded yet"
                  description="Referral attribution will appear here as soon as students start sharing their codes."
                />
              </div>
            ) : (
              <ol className="mt-4 space-y-2">
                {leaderboard.slice(0, 5).map((row) => (
                  <li
                    key={row.studentId}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/40 px-4 py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          row.rank === 1
                            ? "bg-amber-100 text-amber-700 ring-1 ring-amber-500/40"
                            : row.rank <= 3
                              ? "bg-slate-200 text-slate-700 ring-1 ring-slate-400/40"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {row.rank}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{row.maskedName}</p>
                        <p className="truncate text-[11px] text-muted-foreground">{row.college}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums">{row.referrals} <span className="text-xs font-normal text-muted-foreground">referrals</span></p>
                      <p className="text-[11px] text-muted-foreground tabular-nums">{row.clicks} clicks · {row.conversionPct.toFixed(0)}% conv</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="flex-1 rounded-xl border bg-card p-6">
            <h2 className="text-sm font-semibold">How attribution works</h2>
            <ol className="mt-3 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex gap-2.5"><span className="font-mono text-xs text-blue-400">01</span> Every student receives a unique code (e.g. <span className="font-mono text-foreground/80">JASWAN123</span>) at registration.</li>
              <li className="flex gap-2.5"><span className="font-mono text-xs text-blue-400">02</span> Their referral link (<span className="font-mono text-xs text-foreground/80">/#/register?ref=CODE</span>) pre-fills attribution for friends.</li>
              <li className="flex gap-2.5"><span className="font-mono text-xs text-blue-400">03</span> On registration, the referral record is created — referrer, friend, timestamp, college.</li>
              <li className="flex gap-2.5"><span className="font-mono text-xs text-blue-400">04</span> Self-referrals are blocked and duplicate emails are rejected server-side.</li>
            </ol>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate("/admin/leaderboard")}>
              Inspect leaderboard conversion
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
