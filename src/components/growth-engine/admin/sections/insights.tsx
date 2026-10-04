"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle, ArrowUpRight, BrainCircuit, Eye, FlaskConical, Info,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/growth-engine/shared/primitives";
import { api } from "@/lib/api";
import { navigate } from "@/lib/router";
import type { InsightSeverity, Recommendation } from "@/lib/types";

export function AdminInsights() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["insights"],
    queryFn: api.insights,
  });

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy>
        <Skeleton className="h-24 rounded-xl" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <EmptyState
        icon={<BrainCircuit className="h-6 w-6" />}
        title="AI insights could not be generated"
        description="Make sure the demo campaign is loaded, then try again."
        action={<Button size="sm" variant="outline" onClick={() => refetch()}>Try again</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-gradient-to-br from-violet-500/10 to-blue-500/10 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/15 ring-1 ring-violet-400/30">
              <BrainCircuit className="h-5 w-5 text-violet-600" aria-hidden />
            </span>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">AI Growth Analyst</h2>
              <p className="text-xs text-muted-foreground">
                Analyzing the simulated campaign dataset — channels, colleges, referrals, pacing and spend.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate("/admin/simulator")}>
            <FlaskConical className="h-3.5 w-3.5" /> Test moves in the simulator
          </Button>
        </div>
        <p className="mt-4 rounded-lg border border-violet-400/20 bg-background/50 px-3.5 py-2.5 text-[11px] italic text-muted-foreground">
          {data.label} · deterministic rule-based engine (works without an external LLM; swap-in point for a real model)
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {data.insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h3 className="text-sm font-semibold">What should we do next?</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Decision-oriented recommendations — each one shows the metric that caused it.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {data.recommendations.map((rec) => (
            <RecommendationCard key={rec.title} rec={rec} />
          ))}
        </div>
      </div>
    </div>
  );
}

const SEVERITY_META: Record<InsightSeverity, { icon: React.ReactNode; ring: string; label: string }> = {
  positive: { icon: <TrendingUp className="h-4 w-4 text-emerald-400" />, ring: "ring-emerald-400/25 bg-emerald-400/5", label: "Working well" },
  warning: { icon: <AlertTriangle className="h-4 w-4 text-amber-400" />, ring: "ring-amber-400/25 bg-amber-400/5", label: "Needs attention" },
  neutral: { icon: <Info className="h-4 w-4 text-blue-400" />, ring: "ring-blue-400/25 bg-blue-400/5", label: "Worth knowing" },
};

function InsightCard({ insight }: { insight: { id: string; title: string; body: string; severity: InsightSeverity; metric: string } }) {
  const meta = SEVERITY_META[insight.severity];
  return (
    <div className={`card-hover rounded-xl border p-5 ring-1 ${meta.ring} bg-card`}>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {meta.icon} {meta.label}
        </span>
        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium tabular-nums">{insight.metric}</span>
      </div>
      <h3 className="mt-3 text-sm font-semibold leading-snug">{insight.title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{insight.body}</p>
    </div>
  );
}

const REC_META: Record<Recommendation["type"], { icon: React.ReactNode; badge: string; title: string }> = {
  "double-down": { icon: <ArrowUpRight className="h-3.5 w-3.5" />, badge: "bg-emerald-100 text-emerald-700 ring-emerald-500/30", title: "Double down" },
  "test": { icon: <FlaskConical className="h-3.5 w-3.5" />, badge: "bg-blue-100 text-blue-700 ring-blue-500/30", title: "Test" },
  "watch": { icon: <Eye className="h-3.5 w-3.5" />, badge: "bg-amber-100 text-amber-700 ring-amber-500/30", title: "Watch" },
};

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const meta = REC_META[rec.type];
  return (
    <div className="card-hover rounded-xl border bg-background/40 p-5">
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${meta.badge}`}>
        {meta.icon} {meta.title}
      </span>
      <h4 className="mt-3 text-sm font-semibold leading-snug">{rec.title}</h4>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{rec.body}</p>
      <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-xs">
        <span className="text-muted-foreground">{rec.metricLabel}</span>
        <span className="font-semibold tabular-nums">{rec.metricValue}</span>
      </div>
    </div>
  );
}
