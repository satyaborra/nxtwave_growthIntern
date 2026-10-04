"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, FilterX, Search, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/growth-engine/shared/primitives";
import { api } from "@/lib/api";
import { BRANCHES, YEARS, ACQUISITION_CHANNELS } from "@/lib/types";
import { DEMO_COLLEGES } from "@/lib/campaign-config";
import { shortDate } from "@/lib/format";

const PAGE_SIZE = 12;

export function AdminRegistrations() {
  const [college, setCollege] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [channel, setChannel] = useState("");
  const [day, setDay] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (college) p.set("college", college);
    if (branch) p.set("branch", branch);
    if (year) p.set("year", year);
    if (channel) p.set("channel", channel);
    if (day) p.set("day", day);
    if (q.trim()) p.set("q", q.trim());
    return p;
  }, [college, branch, year, channel, day, q]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["students", params.toString()],
    queryFn: () => api.students(params),
    placeholderData: (prev) => prev,
  });

  const students = data?.students ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageRows = students.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const activeFilters = [college, branch, year, channel, day, q].filter(Boolean).length;

  const resetFilters = () => {
    setCollege(""); setBranch(""); setYear(""); setChannel(""); setDay(""); setQ("");
    setPage(0);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-40 flex-1 space-y-1.5">
            <Label htmlFor="reg-q">Search</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden />
              <Input
                id="reg-q"
                className="pl-8"
                placeholder="Name, college or referral code"
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(0); }}
              />
            </div>
          </div>
          <div className="w-48 space-y-1.5">
            <Label>College</Label>
            <Select value={college} onValueChange={(v) => { setCollege(v === "all" ? "" : v); setPage(0); }}>
              <SelectTrigger aria-label="Filter by college"><SelectValue placeholder="All" /></SelectTrigger>
              <SelectContent className="max-h-72 overflow-y-auto scrollbar-slim">
                <SelectItem value="all">All colleges</SelectItem>
                {DEMO_COLLEGES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-40 space-y-1.5">
            <Label>Branch</Label>
            <Select value={branch} onValueChange={(v) => { setBranch(v === "all" ? "" : v); setPage(0); }}>
              <SelectTrigger aria-label="Filter by branch"><SelectValue placeholder="All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All branches</SelectItem>
                {BRANCHES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-36 space-y-1.5">
            <Label>Year</Label>
            <Select value={year} onValueChange={(v) => { setYear(v === "all" ? "" : v); setPage(0); }}>
              <SelectTrigger aria-label="Filter by year"><SelectValue placeholder="All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All years</SelectItem>
                {YEARS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-44 space-y-1.5">
            <Label>Channel</Label>
            <Select value={channel} onValueChange={(v) => { setChannel(v === "all" ? "" : v); setPage(0); }}>
              <SelectTrigger aria-label="Filter by channel"><SelectValue placeholder="All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All channels</SelectItem>
                {ACQUISITION_CHANNELS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-32 space-y-1.5">
            <Label>Day</Label>
            <Select value={day} onValueChange={(v) => { setDay(v === "all" ? "" : v); setPage(0); }}>
              <SelectTrigger aria-label="Filter by day"><SelectValue placeholder="All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All days</SelectItem>
                {[1, 2, 3, 4, 5].map((d) => <SelectItem key={d} value={String(d)}>Day {d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={resetFilters} disabled={activeFilters === 0}>
            <FilterX className="h-3.5 w-3.5" /> Clear{activeFilters ? ` (${activeFilters})` : ""}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
          <p className="text-sm">
            <span className="font-semibold">{total.toLocaleString("en-IN")}</span>{" "}
            <span className="text-muted-foreground">registrations found</span>
          </p>
          <p className="text-xs text-muted-foreground">Demo data · emails partially masked</p>
        </div>

        {isLoading && !data ? (
          <div className="space-y-2 p-5" aria-busy>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-muted/60" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-600">Registrations could not be loaded.</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>Try again</Button>
          </div>
        ) : total === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<UserRound className="h-6 w-6" />}
              title="No registrations found for this filter"
              description="Try clearing filters or searching for a different term."
              action={<Button size="sm" variant="outline" onClick={resetFilters}>Clear all filters</Button>}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto scrollbar-slim">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>College</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Referral code</TableHead>
                    <TableHead>Referred by</TableHead>
                    <TableHead className="text-right">Day</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRows.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="font-medium">{s.name}</div>
                        <div className="text-xs text-muted-foreground">{s.email}</div>
                      </TableCell>
                      <TableCell className="max-w-52 truncate">{s.college}</TableCell>
                      <TableCell>{s.branch}</TableCell>
                      <TableCell>{s.year}</TableCell>
                      <TableCell>
                        <span className={`rounded-full px-2 py-0.5 text-xs ${
                          s.channel === "Friend Referral"
                            ? "bg-violet-100 text-violet-700"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {s.channel}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{s.referralCode}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {s.referredByCode ?? "—"}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        Day {s.day} · {shortDate(s.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between border-t border-border/60 px-5 py-3">
              <p className="text-xs text-muted-foreground">
                Page {page + 1} of {pageCount}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline" size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                <Button
                  variant="outline" size="sm"
                  disabled={page >= pageCount - 1}
                  onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
