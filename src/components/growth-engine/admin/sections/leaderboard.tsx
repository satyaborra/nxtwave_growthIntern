"use client";

import { Trophy } from "lucide-react";
import { EmptyState } from "@/components/growth-engine/shared/primitives";
import type { CampaignSummary } from "@/lib/types";

const RANK_STYLES = [
  "bg-amber-100 text-amber-700 ring-1 ring-amber-500/40",
  "bg-slate-200 text-slate-700 ring-1 ring-slate-400/40",
  "bg-orange-100 text-orange-700 ring-1 ring-orange-500/40",
];

export function AdminLeaderboard({ data }: { data: CampaignSummary }) {
  const rows = data.leaderboard;
  const totalReferrals = data.kpis.referralRegistrations;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-gradient-to-br from-blue-500/8 to-violet-500/8 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <Trophy className="h-5 w-5 text-amber-400" aria-hidden />
              Top Growth Contributors
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Students whose referral codes generated the most friend registrations. Names are
              anonymized (Student A, B, C…) — only colleges and conversion metrics are shown.
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-semibold tabular-nums">{totalReferrals}</p>
            <p className="text-xs text-muted-foreground">total referral registrations</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<Trophy className="h-6 w-6" />}
              title="No referrals recorded yet"
              description="The leaderboard fills up as soon as students share their referral codes and friends register."
            />
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-slim">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Rank</th>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">College</th>
                  <th className="px-4 py-3 font-medium">Referrals</th>
                  <th className="px-4 py-3 font-medium">Link clicks</th>
                  <th className="px-5 py-3 text-right font-medium">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.studentId} className="border-b border-border/40 last:border-0 hover:bg-muted/30">
                    <td className="px-5 py-3.5">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                          RANK_STYLES[row.rank - 1] ?? "bg-muted text-muted-foreground"
                        }`}
                      >
                        {row.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium">{row.maskedName}</td>
                    <td className="max-w-56 truncate px-4 py-3.5 text-muted-foreground">{row.college}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold tabular-nums">{row.referrals}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {((row.referrals / totalReferrals) * 100).toFixed(1)}% of loop
                      </span>
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-muted-foreground">{row.clicks}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums">{row.conversionPct.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="px-5 py-3 text-[11px] italic text-muted-foreground">
          Referrals = registrations attributed to this student&apos;s code. Conversion = referrals ÷ link clicks (simulated event data).
        </p>
      </div>
    </div>
  );
}
