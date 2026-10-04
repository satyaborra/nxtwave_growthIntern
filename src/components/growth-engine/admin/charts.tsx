"use client";

import { useEffect, useState } from "react";
import {
  Area, Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { CampaignSummary, DailyPoint, FunnelStage } from "@/lib/types";
import { fmtNum } from "@/lib/format";

/* --------------------------- Daily analytics chart ------------------------ */
type TrendMode = "both" | "daily" | "cumulative";

function TrendTooltip({
  active, payload, label,
}: {
  active?: boolean;
  payload?: { dataKey: string; value: number | null; name: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const meta: Record<string, { label: string; color: string }> = {
    registrations: { label: "Daily registrations", color: "#3b82f6" },
    projected: { label: "Projected daily", color: "#93c5fd" },
    cumulative: { label: "Cumulative", color: "#8b5cf6" },
    projectedCumulative: { label: "Cumulative (projected)", color: "#c4b5fd" },
    targetCumulative: { label: "Target", color: "#f43f5e" },
  };
  const rows = payload.filter((p) => {
    if (p.value === null || p.value === undefined) return false;
    if (p.dataKey === "cumulativeFill") return false; // decorative gradient fill only
    if (p.dataKey === "projectedCumulative") {
      // boundary day: projected equals the actual — hide the duplicate row
      const actual = payload.find((q) => q.dataKey === "cumulative");
      return Number(p.value) !== Number(actual?.value);
    }
    return true;
  });
  if (!rows.length) return null;
  return (
    <div className="rounded-xl border border-border/70 bg-popover px-3.5 py-2.5 text-xs shadow-xl shadow-slate-900/10">
      <p className="mb-1.5 font-semibold text-foreground">{label}</p>
      <div className="space-y-1">
        {rows.map((p) => (
          <p key={p.dataKey} className="flex items-center gap-2 text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ background: meta[p.dataKey]?.color ?? "#94a3b8" }} aria-hidden />
            <span className="font-semibold tabular-nums text-foreground">{fmtNum(Number(p.value))}</span>
            {meta[p.dataKey]?.label ?? p.name}
          </p>
        ))}
      </div>
    </div>
  );
}

export function DailyChart({ daily, kpis }: { daily: DailyPoint[]; kpis: CampaignSummary["kpis"] }) {
  const [mode, setMode] = useState<TrendMode>("both");
  const projectedPerDay = Math.round(kpis.latestDayRegistrations * 0.6 + kpis.requiredPacePerDay * 0.4);
  const lastActual = daily.filter((d) => d.isActual).slice(-1)[0]?.cumulative ?? 0;
  const data = daily.map((d) => ({
    ...d,
    registrations: d.isActual ? d.registrations : null,
    projected: d.isActual ? null : projectedPerDay,
    cumulative: d.isActual ? d.cumulative : null,
    projectedCumulative:
      d.day === kpis.latestDay
        ? lastActual // boundary point so the dashed line connects to actuals
        : d.isActual
          ? null
          : lastActual + projectedPerDay * (d.day - kpis.latestDay),
    // own dataKey so the decorative gradient fill never collides with the cumulative line
    cumulativeFill: d.isActual ? d.cumulative : null,
  }));

  const showDaily = mode === "both" || mode === "daily";
  const showCum = mode === "both" || mode === "cumulative";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
          {showDaily ? (
            <>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" /> Daily Registrations</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-300" /> Projected</span>
            </>
          ) : null}
          {showCum ? (
            <>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-violet-500" /> Cumulative</span>
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 border-t-2 border-dashed border-rose-500" /> Target</span>
            </>
          ) : null}
        </div>
        <Select value={mode} onValueChange={(v) => setMode(v as TrendMode)}>
          <SelectTrigger className="h-8 w-[130px] text-xs" aria-label="Chart view mode">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="both">Day-wise</SelectItem>
            <SelectItem value="daily">Daily only</SelectItem>
            <SelectItem value="cumulative">Cumulative</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="mt-2 h-72 w-full" role="img" aria-label="Daily registrations and cumulative trend across the 7-day campaign">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -14 }}>
            <defs>
              <linearGradient id="dailyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.26 0.032 261 / 8%)" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis yAxisId="daily" tickLine={false} axisLine={false} width={44} />
            <YAxis yAxisId="cum" orientation="right" tickLine={false} axisLine={false} width={44} />
            <Tooltip content={<TrendTooltip />} cursor={{ stroke: "oklch(0.26 0.032 261 / 18%)", strokeDasharray: "4 4" }} />
            <Area
              yAxisId="daily" type="monotone" dataKey="registrations" name="registrations"
              stroke="#3b82f6" strokeWidth={2.4} fill="url(#dailyGrad)"
              dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }} activeDot={{ r: 5 }} connectNulls
              hide={!showDaily}
            />
            <Bar yAxisId="daily" dataKey="projected" name="projected" fill="#93c5fd" fillOpacity={0.5} radius={[4, 4, 0, 0]} maxBarSize={30} hide={!showDaily} />
            <Area yAxisId="cum" type="monotone" dataKey="cumulativeFill" name="cumulativeFill" stroke="none" fill="url(#cumGrad)" connectNulls hide={!showCum} />
            <Line yAxisId="cum" type="monotone" dataKey="cumulative" name="cumulative" stroke="#8b5cf6" strokeWidth={2.4} dot={{ r: 3, fill: "#8b5cf6", strokeWidth: 0 }} connectNulls hide={!showCum} />
            <Line
              yAxisId="cum" type="monotone" dataKey="projectedCumulative" name="projectedCumulative"
              stroke="#a78bfa" strokeWidth={2} strokeDasharray="5 4" strokeOpacity={0.65} dot={false} connectNulls hide={!showCum}
            />
            <Line yAxisId="cum" type="monotone" dataKey="targetCumulative" name="targetCumulative" stroke="#f43f5e" strokeWidth={1.6} strokeDasharray="5 5" strokeOpacity={0.8} dot={false} hide={!showCum} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ------------------------------ Campaign donut ----------------------------- */
export function CampaignDonut({ value, sublabel }: { value: number; sublabel?: string }) {
  const size = 168;
  const stroke = 15;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, value));
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(clamped), 80);
    return () => clearTimeout(t);
  }, [clamped]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }} role="img" aria-label={`Campaign progress ${clamped.toFixed(1)} percent`}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <defs>
          <linearGradient id="donutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="oklch(0.26 0.032 261 / 8%)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="url(#donutGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (animated / 100) * circumference }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[28px] font-bold leading-none tracking-tight text-foreground">
          {clamped.toFixed(1)}
          <span className="text-lg">%</span>
        </span>
        {sublabel ? <span className="mt-1 text-[11px] text-muted-foreground">{sublabel}</span> : null}
      </div>
    </div>
  );
}

/* ----------------------------- Channel bar chart -------------------------- */
export function ChannelContributionChart({ channels }: { channels: CampaignSummary["channels"] }) {
  const data = [...channels].sort((a, b) => b.registrations - a.registrations);
  return (
    <div className="h-64 w-full" role="img" aria-label="Registrations contribution by channel">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} layout="vertical" margin={{ top: 4, right: 12, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.26 0.032 261 / 7%)" horizontal={false} />
          <XAxis type="number" tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="channel"
            width={110}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "oklch(0.53 0.026 258)" }}
          />
          <Tooltip
            cursor={{ fill: "oklch(0.54 0.222 262 / 5%)" }}
            contentStyle={{
              background: "#ffffff",
              border: "1px solid oklch(0.917 0.011 253)",
              borderRadius: 12,
              fontSize: 12,
              boxShadow: "0 10px 28px -14px oklch(0.26 0.032 261 / 18%)",
            }}
            labelStyle={{ color: "oklch(0.26 0.032 261)", fontWeight: 600 }}
            formatter={(value: number | string, name: string) => {
              if (name === "registrations") return [fmtNum(Number(value)), "Registrations"];
              if (name === "visits") return [fmtNum(Number(value)), "Visits"];
              return [String(value), name];
            }}
          />
          <Bar dataKey="visits" name="visits" fill="oklch(0.26 0.032 261 / 8%)" radius={[0, 4, 4, 0]} maxBarSize={14} />
          <Bar dataKey="registrations" name="registrations" fill="#3b82f6" radius={[0, 4, 4, 0]} maxBarSize={14} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------- Growth funnel ---------------------------- */
const FUNNEL_COLORS = ["#3b82f6", "#8b5cf6", "#6366f1", "#10b981", "#f97316", "#f43f5e", "#14b8a6"];

/** Compact colored funnel bars for the overview card. */
export function FunnelBars({ funnel }: { funnel: FunnelStage[] }) {
  const max = Math.max(...funnel.map((f) => f.value), 1);
  return (
    <div className="space-y-2">
      {funnel.map((stage, idx) => {
        const widthPct = Math.max(8, (stage.value / max) * 100);
        const color = FUNNEL_COLORS[idx % FUNNEL_COLORS.length];
        return (
          <div key={stage.key}>
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} aria-hidden />
              <div className="h-6 flex-1 overflow-hidden rounded-md bg-muted/70">
                <motion.div
                  className="h-full rounded-md"
                  style={{ background: color, opacity: 0.9 }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${widthPct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <span className="w-12 shrink-0 text-right text-xs font-semibold tabular-nums text-foreground">
                {fmtNum(stage.value)}
              </span>
              <span className="w-11 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground">
                {stage.convPct !== null ? `${stage.convPct.toFixed(0)}%` : "—"}
              </span>
            </div>
            <p className="mt-0.5 pl-[18px] text-[11px] text-muted-foreground">{stage.label}</p>
          </div>
        );
      })}
    </div>
  );
}

/** Detailed funnel with conversion rows (used in Referrals section). */
export function FunnelViz({ funnel }: { funnel: FunnelStage[] }) {
  const max = Math.max(...funnel.map((f) => f.value), 1);
  return (
    <div className="space-y-2.5">
      {funnel.map((stage, idx) => {
        const widthPct = Math.max(10, (stage.value / max) * 100);
        const isLoop = stage.stage === "loop";
        return (
          <div key={stage.key}>
            {idx > 0 ? (
              <div className="flex items-center gap-2 py-0.5 text-[11px] text-muted-foreground" aria-hidden>
                <ChevronRight className="h-3 w-3" />
                {stage.prevValue && stage.prevValue > 0 ? (
                  <span>
                    <span className="font-semibold text-foreground/80">
                      {((stage.value / stage.prevValue) * 100).toFixed(1)}%
                    </span>{" "}
                    continue from previous stage
                  </span>
                ) : null}
              </div>
            ) : null}
            <div
              className={cn(
                "relative overflow-hidden rounded-lg border p-3.5 transition-colors",
                isLoop ? "border-violet-500/25 bg-violet-500/5" : "border-border/70 bg-muted/30"
              )}
              title={stage.hint ?? undefined}
            >
              <div
                className={cn(
                  "absolute inset-y-0 left-0 -z-0 opacity-15",
                  isLoop ? "bg-violet-500" : "bg-blue-500"
                )}
                style={{ width: `${widthPct}%` }}
                aria-hidden
              />
              <div className="relative flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{stage.label}</p>
                  {stage.hint ? <p className="text-[11px] text-muted-foreground">{stage.hint}</p> : null}
                </div>
                <div className="flex items-baseline gap-3">
                  <p className="text-lg font-semibold tabular-nums">{fmtNum(stage.value)}</p>
                  {stage.convPct !== null ? (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] tabular-nums text-muted-foreground">
                      {stage.convPct.toFixed(1)}%
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <p className="pt-1 text-[11px] italic text-muted-foreground">
        Acquisition funnel feeds the referral loop — the last three stages are where one student
        becomes several.
      </p>
    </div>
  );
}
