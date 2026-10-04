"use client";

import { IndianRupee, Leaf, Scale, Wallet } from "lucide-react";
import {
  CountUp, SimulatedLabel, StatCard, TrendBadge,
} from "@/components/growth-engine/shared/primitives";
import { ChannelContributionChart } from "@/components/growth-engine/admin/charts";
import type { CampaignSummary } from "@/lib/types";
import { fmtINR, fmtINR1, fmtPct } from "@/lib/format";

export function AdminChannels({ data }: { data: CampaignSummary }) {
  const { channels, budget } = data;
  const maxRegs = Math.max(...channels.map((c) => c.registrations), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-sm font-semibold">Campaign target model — channel contribution</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Registrations (solid) against visits (faint) per channel. This is the target model, not guaranteed results.
          </p>
          <div className="mt-4">
            <ChannelContributionChart channels={channels} />
          </div>
        </div>
        <div className="grid w-full grid-cols-2 gap-4 lg:w-72 lg:grid-cols-1">
          <StatCard
            label="Organic contribution"
            value={<CountUp value={budget.organicSharePct} decimals={1} suffix="%" />}
            sub={`${budget.organicRegs} of ${budget.organicRegs + budget.paidRegs} registrations`}
            icon={<Leaf className="h-4 w-4 text-emerald-400" />}
          />
          <StatCard
            label="Paid cost / registration"
            value={fmtINR1(budget.costPerRegPaid)}
            sub={`organic channels cost ₹0`}
            icon={<Scale className="h-4 w-4 text-amber-400" />}
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="border-b border-border/60 px-5 py-4">
          <h2 className="text-sm font-semibold">Channel performance</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Registrations, contribution, conversion, spend and trend per channel — computed from the simulated event log.
          </p>
        </div>
        <div className="overflow-x-auto scrollbar-slim">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Channel</th>
                <th className="px-4 py-3 font-medium">Registrations</th>
                <th className="px-4 py-3 font-medium">Share</th>
                <th className="px-4 py-3 font-medium">Visits</th>
                <th className="px-4 py-3 font-medium">Conversion</th>
                <th className="px-4 py-3 font-medium">Spend</th>
                <th className="px-4 py-3 font-medium">Cost / reg</th>
                <th className="px-5 py-3 text-right font-medium">Trend</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((c) => (
                <tr key={c.channel} className="border-b border-border/40 last:border-0">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: c.channel === "Friend Referral" ? "#8b5cf6" : c.channel === "College Club" ? "#3b82f6" : c.channel === "WhatsApp Group" ? "#22c55e" : c.channel === "Instagram" ? "#ec4899" : c.channel === "LinkedIn" ? "#0ea5e9" : "#f59e0b" }}
                        aria-hidden
                      />
                      <div>
                        <p className="font-medium">{c.channel}</p>
                        <p className={`text-[11px] ${c.type === "paid" ? "text-amber-600" : "text-emerald-600"}`}>
                          {c.type === "paid" ? "Paid experiment" : "Organic"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold tabular-nums">{c.registrations}</span>
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${(c.registrations / maxRegs) * 100}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 tabular-nums text-muted-foreground">{fmtPct(c.sharePct, 1)}</td>
                  <td className="px-4 py-3.5 tabular-nums text-muted-foreground">{c.visits.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3.5 tabular-nums">{fmtPct(c.conversionPct, 1)}</td>
                  <td className="px-4 py-3.5 tabular-nums">{c.spend > 0 ? fmtINR(c.spend) : "₹0"}</td>
                  <td className="px-4 py-3.5 tabular-nums">
                    {c.spend > 0 ? (
                      c.costPerReg !== null ? fmtINR1(c.costPerReg) : <span className="text-xs text-muted-foreground">no regs yet</span>
                    ) : (
                      <span className="text-emerald-600">₹0</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right"><TrendBadge value={c.trendPct} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3">
          <SimulatedLabel />
        </div>
      </div>

      <BudgetTracker data={data} />
    </div>
  );
}

function BudgetTracker({ data }: { data: CampaignSummary }) {
  const { budget } = data;
  const usedPct = (budget.spent / budget.total) * 100;
  return (
    <section aria-label="Budget tracker" className="rounded-xl border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Wallet className="h-4 w-4 text-emerald-400" aria-hidden /> ₹2,000 budget tracker
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            The strategy deliberately prioritizes high-leverage organic distribution — ₹2,000 cannot buy 500 registrations, but college communities and referrals can deliver them.
          </p>
        </div>
        <div className="flex gap-4 text-right">
          <div>
            <p className="text-xs text-muted-foreground">Used</p>
            <p className="text-lg font-semibold tabular-nums">{fmtINR(budget.spent)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Remaining</p>
            <p className="text-lg font-semibold tabular-nums text-emerald-600">{fmtINR(budget.remaining)}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700"
          style={{ width: `${Math.min(100, usedPct)}%` }}
          role="progressbar"
          aria-valuenow={budget.spent}
          aria-valuemin={0}
          aria-valuemax={budget.total}
          aria-label="Budget used"
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
        <span>{usedPct.toFixed(0)}% deployed</span>
        <span>₹1,500 paid experiment + ₹500 contingency</span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "College / community outreach", amount: 0, note: "effort-based, not cash", cls: "text-emerald-600" },
          { label: "Referral infrastructure", amount: 0, note: "built into the product", cls: "text-emerald-600" },
          { label: "Organic distribution", amount: 0, note: "WhatsApp, clubs, email", cls: "text-emerald-600" },
          { label: "Paid acquisition experiment", amount: 1500, note: `${fmtINR(budget.spent)} deployed so far`, cls: "text-amber-600" },
          { label: "Contingency", amount: 500, note: "reserved", cls: "text-muted-foreground" },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-border/60 bg-background/40 p-4">
            <p className="text-xs font-medium">{item.label}</p>
            <p className={`mt-1.5 text-lg font-semibold tabular-nums ${item.cls}`}>{fmtINR(item.amount)}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{item.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border/60 bg-background/40 p-4">
          <p className="text-xs text-muted-foreground">Blended cost / registration</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{fmtINR1(budget.costPerRegBlended)}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{fmtINR(budget.spent)} ÷ {budget.organicRegs + budget.paidRegs} total registrations</p>
        </div>
        <div className="rounded-lg border border-border/60 bg-background/40 p-4">
          <p className="text-xs text-muted-foreground">Paid cost / registration</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{fmtINR1(budget.costPerRegPaid)}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{fmtINR(budget.paidSpend)} ÷ {budget.paidRegs} paid registrations</p>
        </div>
        <div className="rounded-lg border border-border/60 bg-background/40 p-4">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <IndianRupee className="h-3 w-3" /> Organic vs paid split
          </p>
          <p className="mt-1 text-xl font-semibold tabular-nums">
            {budget.organicRegs} <span className="text-sm text-muted-foreground">organic</span> · {budget.paidRegs} <span className="text-sm text-muted-foreground">paid</span>
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{budget.organicSharePct.toFixed(1)}% of registrations cost ₹0</p>
        </div>
      </div>
      <SimulatedLabel className="mt-4" />
    </section>
  );
}
