"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { EmptyState, TrendBadge } from "@/components/growth-engine/shared/primitives";
import { api } from "@/lib/api";
import { DEMO_COLLEGES } from "@/lib/campaign-config";
import { BRANCHES, YEARS, ACQUISITION_CHANNELS } from "@/lib/types";
import type { CampaignSummary, CollegeStat } from "@/lib/types";

export function AdminColleges({ data }: { data: CampaignSummary }) {
  const [collegeFilter, setCollegeFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  // Branch / year / channel filters apply to registration-level data via /api/students
  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (collegeFilter !== "all") p.set("college", collegeFilter);
    if (branchFilter !== "all") p.set("branch", branchFilter);
    if (yearFilter !== "all") p.set("year", yearFilter);
    if (channelFilter !== "all") p.set("channel", channelFilter);
    return p;
  }, [collegeFilter, branchFilter, yearFilter, channelFilter]);

  const { data: regData } = useStudentCounts(params);

  const rows = useMemo(() => {
    const counts = new Map<string, number>();
    (regData?.students ?? []).forEach((s) => counts.set(s.college, (counts.get(s.college) ?? 0) + 1));
    const base = data.colleges;
    if (collegeFilter !== "all") {
      return base.filter((c) => c.college === collegeFilter).map((c) => ({ ...c, registrations: counts.get(c.college) ?? c.registrations }));
    }
    // when branch/year/channel filters are active, show live-filtered counts where available
    const filteredActive = branchFilter !== "all" || yearFilter !== "all" || channelFilter !== "all";
    if (!filteredActive) return base;
    return base
      .map((c) => ({ ...c, registrations: counts.get(c.college) ?? 0 }))
      .sort((a, b) => b.registrations - a.registrations);
  }, [regData, data.colleges, collegeFilter, branchFilter, yearFilter, channelFilter]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-52 space-y-1.5">
            <Label>College</Label>
            <Select value={collegeFilter} onValueChange={setCollegeFilter}>
              <SelectTrigger aria-label="Filter by college"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72 overflow-y-auto scrollbar-slim">
                <SelectItem value="all">All colleges</SelectItem>
                {DEMO_COLLEGES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-40 space-y-1.5">
            <Label>Branch</Label>
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger aria-label="Filter by branch"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All branches</SelectItem>
                {BRANCHES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-36 space-y-1.5">
            <Label>Year</Label>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger aria-label="Filter by year"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All years</SelectItem>
                {YEARS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-44 space-y-1.5">
            <Label>Channel</Label>
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger aria-label="Filter by channel"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All channels</SelectItem>
                {ACQUISITION_CHANNELS.filter((c) => c !== "Other").map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {(collegeFilter !== "all" || branchFilter !== "all" || yearFilter !== "all" || channelFilter !== "all") ? (
            <Button
              variant="ghost" size="sm"
              onClick={() => { setCollegeFilter("all"); setBranchFilter("all"); setYearFilter("all"); setChannelFilter("all"); }}
            >
              Clear filters
            </Button>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
          <p className="text-sm">
            <span className="font-semibold">{rows.length}</span>{" "}
            <span className="text-muted-foreground">colleges · {regData?.total ?? data.kpis.registrations} registrations in view</span>
          </p>
          <p className="text-xs text-muted-foreground">Demo data</p>
        </div>

        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<Building2 className="h-6 w-6" />}
              title="No colleges match this filter"
              description="No registrations found for the selected combination — try widening the filters."
            />
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-slim">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">College</th>
                  <th className="px-4 py-3 font-medium">Registrations</th>
                  <th className="px-4 py-3 font-medium">Referrals generated</th>
                  <th className="px-4 py-3 font-medium">Visits</th>
                  <th className="px-4 py-3 font-medium">Conversion</th>
                  <th className="px-4 py-3 font-medium">Primary channel</th>
                  <th className="px-5 py-3 text-right font-medium">Growth trend</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c: CollegeStat) => (
                  <tr key={c.college} className="border-b border-border/40 last:border-0 hover:bg-muted/30">
                    <td className="max-w-64 truncate px-5 py-3.5 font-medium">{c.college}</td>
                    <td className="px-4 py-3.5 font-semibold tabular-nums">{c.registrations}</td>
                    <td className="px-4 py-3.5 tabular-nums text-violet-600">{c.referrals}</td>
                    <td className="px-4 py-3.5 tabular-nums text-muted-foreground">{c.visits.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3.5 tabular-nums">{c.conversionPct.toFixed(1)}%</td>
                    <td className="px-4 py-3.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${
                        c.primaryChannel === "College Club" ? "bg-blue-100 text-blue-700" :
                        c.primaryChannel === "WhatsApp Group" ? "bg-emerald-100 text-emerald-700" :
                        c.primaryChannel === "—" ? "bg-muted text-muted-foreground" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {c.primaryChannel}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right"><TrendBadge value={c.trendPct} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="px-5 py-3 text-[11px] italic text-muted-foreground">
          Referrals generated = registrations attributed to referrers from that college. Trend compares the last two campaign days with the previous two (simulated).
        </p>
      </div>
    </div>
  );
}

// Small local hook for registration-level filtering (branch / year / channel).
function useStudentCounts(params: URLSearchParams) {
  return useQuery({
    queryKey: ["students", params.toString()],
    queryFn: () => api.students(params),
    placeholderData: (prev) => prev,
  });
}
