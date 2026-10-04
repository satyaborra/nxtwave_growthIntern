"use client";

import { useMemo, useState } from "react";
import { FlaskConical, RotateCcw, Target, TrendingUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { SimulatedLabel } from "@/components/growth-engine/shared/primitives";
import { runSimulation, type SimulatorInputs } from "@/lib/simulator";
import { fmtINR } from "@/lib/format";
import type { CampaignSummary } from "@/lib/types";

const DEFAULTS: SimulatorInputs = {
  whatsappEffort: 100,
  clubsEffort: 100,
  referralEffort: 100,
  paidSpend: 500,
};

export function AdminSimulator({ data }: { data: CampaignSummary }) {
  const [inputs, setInputs] = useState<SimulatorInputs>(DEFAULTS);
  const daysRemaining = data.kpis.daysRemaining;
  const result = useMemo(
    () => runSimulation(inputs, data.kpis.registrations, daysRemaining),
    [inputs, data.kpis.registrations, daysRemaining]
  );

  const set = (key: keyof SimulatorInputs) => (value: number[]) =>
    setInputs((prev) => ({ ...prev, [key]: value[0] }));

  const gapPct = (result.targetGap / 500) * 100;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-gradient-to-br from-cyan-500/8 to-blue-500/8 p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/15 ring-1 ring-cyan-400/30">
            <FlaskConical className="h-5 w-5 text-cyan-600" aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Campaign simulator</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              What if we change the channel allocation? Move the sliders to re-allocate effort for
              the remaining <span className="font-medium text-foreground">{daysRemaining} day(s)</span> of
              the campaign. Every formula is shown below the result — the math is deterministic and auditable.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[380px_1fr]">
        {/* Controls */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Channel allocation</h3>
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setInputs(DEFAULTS)}>
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </Button>
          </div>
          <div className="mt-6 space-y-7">
            <SliderRow
              label="WhatsApp effort"
              hint={`base 11 regs/day · now ${inputs.whatsappEffort}%`}
              value={inputs.whatsappEffort}
              onChange={set("whatsappEffort")}
            />
            <SliderRow
              label="College club effort"
              hint={`base 20 regs/day · now ${inputs.clubsEffort}%`}
              value={inputs.clubsEffort}
              onChange={set("clubsEffort")}
            />
            <SliderRow
              label="Referral push"
              hint={`base 41 regs/day · now ${inputs.referralEffort}%`}
              value={inputs.referralEffort}
              onChange={set("referralEffort")}
            />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Paid spend to deploy</Label>
                <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs tabular-nums">
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
              <p className="text-xs text-muted-foreground">
                {fmtINR(data.budget.remaining)} of contingency + paid budget still unspent
              </p>
            </div>
          </div>
          <SimulatedLabel className="mt-6" />
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className={`card-hover rounded-xl border p-5 ${result.hitsTarget ? "ring-1 ring-emerald-400/30" : "ring-1 ring-amber-400/30"}`}>
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" aria-hidden /> Projected registrations
              </p>
              <p className={`mt-2 text-3xl font-semibold tabular-nums ${result.hitsTarget ? "text-emerald-600" : "text-amber-600"}`}>
                {result.totalProjected}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {result.currentRegistrations} actual + {result.totalProjected - result.currentRegistrations} projected
              </p>
            </div>
            <div className="card-hover rounded-xl border bg-card p-5">
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Target className="h-3.5 w-3.5" aria-hidden /> Target gap
              </p>
              <p className={`mt-2 text-3xl font-semibold tabular-nums ${result.hitsTarget ? "text-emerald-600" : "text-red-600"}`}>
                {result.hitsTarget ? "+" : "−"}{Math.abs(result.targetGap)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {result.hitsTarget
                  ? `${gapPct.toFixed(1)}% above the 500 target`
                  : `${Math.abs(gapPct).toFixed(1)}% short — change the mix above`}
              </p>
            </div>
            <div className="card-hover rounded-xl border bg-card p-5">
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Wallet className="h-3.5 w-3.5" aria-hidden /> Projected paid CPA
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums">{fmtINR(result.paidCPA)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {result.paidProjected} paid regs at ₹29/reg estimate
              </p>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <h3 className="text-sm font-semibold">Transparent math</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Projections = base rate/day × {daysRemaining} day(s) × effort multiplier (diminishing returns, power 0.6). Referral uses power 0.7.
            </p>
            <div className="mt-4 space-y-2">
              {result.organicProjections.map((o) => (
                <div key={o.channel} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/40 px-4 py-2.5 text-sm">
                  <span className="font-medium">{o.channel}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {o.base}/day × {daysRemaining}d × {o.multiplier} ≈ <span className="font-semibold text-foreground">{o.projected}</span>
                  </span>
                </div>
              ))}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-violet-400/25 bg-violet-400/5 px-4 py-2.5 text-sm">
                <span className="font-medium">Friend Referrals</span>
                <span className="font-mono text-xs text-muted-foreground">
                  41/day × {daysRemaining}d × {Math.pow(inputs.referralEffort / 100, 0.7).toFixed(2)} ≈ <span className="font-semibold text-foreground">{result.referralProjected}</span>
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-400/25 bg-amber-400/5 px-4 py-2.5 text-sm">
                <span className="font-medium">Paid (Instagram + LinkedIn)</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {fmtINR(inputs.paidSpend)} ÷ ₹29 ≈ <span className="font-semibold text-foreground">{result.paidProjected}</span>
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/40 px-4 py-2.5 text-sm font-medium">
                <span>Total projected</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {result.currentRegistrations} + {result.organicProjections.reduce((s, o) => s + o.projected, 0)} + {result.referralProjected} + {result.paidProjected} ={" "}
                  <span className="font-semibold text-foreground">{result.totalProjected}</span>
                </span>
              </div>
            </div>
            <SimulatedLabel className="mt-4">Simulation — not actual campaign results.</SimulatedLabel>
          </div>
        </div>
      </div>
    </div>
  );
}

function SliderRow({
  label, hint, value, onChange,
}: {
  label: string; hint: string; value: number; onChange: (v: number[]) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs tabular-nums">{value}%</span>
      </div>
      <Slider value={[value]} onValueChange={onChange} min={0} max={200} step={10} aria-label={label} />
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
