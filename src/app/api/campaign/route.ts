import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  CHANNEL_SPEND,
  CHANNEL_PLANNED_SPEND,
  PAID_CHANNELS,
  BUDGET,
  TARGET_REGISTRATIONS,
  CAMPAIGN_DAYS,
} from "@/lib/campaign-config";
import { maskName } from "@/lib/types";
import type {
  CampaignSummary,
  ChannelStat,
  CollegeStat,
  DailyPoint,
  FunnelStage,
  LeaderboardRow,
} from "@/lib/types";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function GET() {
  try {
    const [campaign, students, referrals, events] = await Promise.all([
      db.campaign.findFirst({ orderBy: { startDate: "desc" } }),
      db.student.findMany({ select: { id: true, name: true, college: true, channel: true, referralCode: true, createdAt: true, referredById: true } }),
      db.referral.findMany({ select: { referrerId: true, createdAt: true } }),
      db.campaignEvent.findMany({ select: { type: true, channel: true, metadata: true, timestamp: true } }),
    ]);
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found. Load the demo campaign first." }, { status: 404 });
    }

    const start = new Date(campaign.startDate).getTime();
    const dayOf = (d: Date | string) =>
      Math.min(CAMPAIGN_DAYS, Math.max(1, Math.floor((new Date(d).getTime() - start) / DAY_MS) + 1));

    const registrations = students.length;
    const target = campaign.targetRegistrations;
    const currentDay = campaign.currentDay;
    const daysElapsed = currentDay; // days 1..currentDay have actuals
    const daysRemaining = CAMPAIGN_DAYS - currentDay;

    /* ---------------- daily series ---------------- */
    const regsByDay = new Array(CAMPAIGN_DAYS).fill(0) as number[];
    for (const s of students) regsByDay[dayOf(s.createdAt) - 1] += 1;

    const targetPerDay = target / CAMPAIGN_DAYS;
    const daily: DailyPoint[] = [];
    let cumulative = 0;
    let actualCumulative = 0;
    for (let d = 1; d <= CAMPAIGN_DAYS; d++) {
      const isActual = d <= currentDay;
      cumulative += targetPerDay;
      if (isActual) actualCumulative += regsByDay[d - 1];
      const prev = d > 1 ? regsByDay[d - 2] : null;
      daily.push({
        day: d,
        label: `Day ${d}`,
        registrations: isActual ? regsByDay[d - 1] : 0,
        cumulative: isActual ? actualCumulative : 0,
        targetCumulative: Math.round(cumulative),
        targetPerDay: Math.round(targetPerDay),
        growthRatePct: prev && prev > 0 && isActual ? ((regsByDay[d - 1] - prev) / prev) * 100 : null,
        isActual,
      });
    }

    const latestDayRegistrations = regsByDay[currentDay - 1] ?? 0;
    const avgPacePerDay = registrations / daysElapsed;
    const requiredPacePerDay = (target - registrations) / Math.max(1, daysRemaining);
    // projection: momentum blend of latest day pace and required pace
    const projectedAdditional = Math.round(
      latestDayRegistrations * 0.6 * daysRemaining + requiredPacePerDay * 0.4 * daysRemaining
    );
    const projectedFinal = registrations + projectedAdditional;

    /* ---------------- events → funnel ---------------- */
    const countBy = (type: string) => events.filter((e) => e.type === type).length;
    // total visits = direct landing visits + referral link clicks (both are
    // people who opened the registration page)
    const visits = countBy("visit") + countBy("referral_click");
    const starts = countBy("start");
    const shares = countBy("share");
    const clicks = countBy("referral_click");
    const referralRegs = referrals.length;

    const funnel: FunnelStage[] = [
      { key: "reach", label: "Campaign Reach (Awareness)", value: visits * 3 + 386, prevValue: null, convPct: null, stage: "acquisition", hint: "simulated impressions across groups, clubs & social" },
      { key: "visits", label: "Landing Page Visits", value: visits, prevValue: visits * 3 + 386, convPct: null, stage: "acquisition" },
      { key: "starts", label: "Registration Starts", value: starts, prevValue: visits, convPct: null, stage: "acquisition" },
      { key: "registrations", label: "Registrations", value: registrations, prevValue: starts, convPct: null, stage: "acquisition" },
      { key: "shares", label: "Referral Shares", value: shares, prevValue: registrations, convPct: null, stage: "loop", hint: "students who shared their referral link" },
      { key: "clicks", label: "Referral Link Clicks", value: clicks, prevValue: shares, convPct: null, stage: "loop", hint: "friends who opened a referral link" },
      { key: "refRegs", label: "Referral Registrations", value: referralRegs, prevValue: clicks, convPct: null, stage: "loop" },
    ];
    for (const stage of funnel) {
      if (stage.prevValue && stage.prevValue > 0) {
        stage.convPct = (stage.value / stage.prevValue) * 100;
      }
    }

    /* ---------------- channels ---------------- */
    const channelNames = ["WhatsApp Group", "College Club", "Friend Referral", "Instagram", "LinkedIn", "Email"];
    const visitsByChannel = new Map<string, number>();
    const startsByChannel = new Map<string, number>();
    for (const e of events) {
      // referral link clicks count as Friend Referral visits
      if ((e.type === "visit" || e.type === "referral_click") && e.channel) {
        visitsByChannel.set(e.channel, (visitsByChannel.get(e.channel) ?? 0) + 1);
      }
      if (e.type === "start" && e.channel) startsByChannel.set(e.channel, (startsByChannel.get(e.channel) ?? 0) + 1);
    }
    const regsByChannel = new Map<string, number>();
    const recentByChannel = new Map<string, number[]>();
    for (const s of students) {
      regsByChannel.set(s.channel, (regsByChannel.get(s.channel) ?? 0) + 1);
      const day = dayOf(s.createdAt);
      if (!recentByChannel.has(s.channel)) recentByChannel.set(s.channel, [0, 0, 0, 0, 0]);
      recentByChannel.get(s.channel)![day - 1] += 1;
    }
    const channels: ChannelStat[] = channelNames.map((name) => {
      const regs = regsByChannel.get(name) ?? 0;
      const chVisits = visitsByChannel.get(name) ?? 0;
      const spend = CHANNEL_SPEND[name] ?? 0;
      const days = recentByChannel.get(name) ?? [0, 0, 0, 0, 0];
      const lastTwo = days[3] + days[4];
      const prevTwo = days[1] + days[2];
      return {
        channel: name,
        type: PAID_CHANNELS.includes(name) ? "paid" : "organic",
        registrations: regs,
        sharePct: registrations > 0 ? (regs / registrations) * 100 : 0,
        visits: chVisits,
        conversionPct: chVisits > 0 ? (regs / chVisits) * 100 : 0,
        spend,
        plannedSpend: CHANNEL_PLANNED_SPEND[name] ?? 0,
        costPerReg: regs > 0 && spend > 0 ? spend / regs : spend > 0 ? null : 0,
        // directional trend indicator; too-small samples report null ("flat")
        trendPct: prevTwo >= 2 ? Math.max(-150, Math.min(150, ((lastTwo - prevTwo) / prevTwo) * 100)) : null,
      };
    });

    /* ---------------- budget ---------------- */
    const paidSpend = channels.filter((c) => c.type === "paid").reduce((s, c) => s + c.spend, 0);
    const paidRegs = channels.filter((c) => c.type === "paid").reduce((s, c) => s + c.registrations, 0);
    const organicRegs = registrations - paidRegs;
    const budget = {
      total: BUDGET.total,
      paidExperiment: BUDGET.paidExperiment,
      contingency: BUDGET.contingency,
      spent: paidSpend,
      remaining: BUDGET.total - paidSpend,
      paidSpend,
      paidRegs,
      costPerRegPaid: paidRegs > 0 ? paidSpend / paidRegs : 0,
      costPerRegBlended: registrations > 0 ? paidSpend / registrations : 0,
      organicRegs,
      organicSharePct: registrations > 0 ? (organicRegs / registrations) * 100 : 0,
    };

    /* ---------------- colleges ---------------- */
    const visitsByCollege = new Map<string, number>();
    for (const e of events) {
      if ((e.type === "visit" || e.type === "referral_click") && e.metadata) {
        try {
          const meta = JSON.parse(e.metadata) as { college?: string };
          if (meta.college) visitsByCollege.set(meta.college, (visitsByCollege.get(meta.college) ?? 0) + 1);
        } catch { /* ignore malformed */ }
      }
    }
    const collegeMap = new Map<string, CollegeStat & { days: number[]; channelCounts: Map<string, number> }>();
    for (const s of students) {
      if (!collegeMap.has(s.college)) {
        collegeMap.set(s.college, {
          college: s.college, registrations: 0, referrals: 0, visits: 0, conversionPct: 0,
          primaryChannel: "—", trendPct: null, lastTwoDays: 0, prevTwoDays: 0,
          days: [0, 0, 0, 0, 0], channelCounts: new Map(),
        });
      }
      const row = collegeMap.get(s.college)!;
      row.registrations += 1;
      row.days[dayOf(s.createdAt) - 1] += 1;
      if (s.channel !== "Friend Referral") {
        row.channelCounts.set(s.channel, (row.channelCounts.get(s.channel) ?? 0) + 1);
      }
    }
    const referralsByCollege = new Map<string, number>();
    const referrerById = new Map(students.map((s) => [s.id, s]));
    for (const r of referrals) {
      const referrer = referrerById.get(r.referrerId);
      if (referrer) referralsByCollege.set(referrer.college, (referralsByCollege.get(referrer.college) ?? 0) + 1);
    }
    const colleges: CollegeStat[] = [...collegeMap.values()]
      .map((row) => {
        const lastTwo = row.days[3] + row.days[4];
        const prevTwo = row.days[1] + row.days[2];
        const primary = [...row.channelCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
        return {
          college: row.college,
          registrations: row.registrations,
          referrals: referralsByCollege.get(row.college) ?? 0,
          visits: visitsByCollege.get(row.college) ?? 0,
          conversionPct: (visitsByCollege.get(row.college) ?? 0) > 0
            ? (row.registrations / (visitsByCollege.get(row.college) ?? 1)) * 100
            : 0,
          primaryChannel: primary,
          trendPct: prevTwo >= 2 ? Math.max(-150, Math.min(150, ((lastTwo - prevTwo) / prevTwo) * 100)) : null,
          lastTwoDays: lastTwo,
          prevTwoDays: prevTwo,
        };
      })
      .sort((a, b) => b.registrations - a.registrations);

    /* ---------------- leaderboard ---------------- */
    const referralsByReferrer = new Map<string, number>();
    for (const r of referrals) {
      referralsByReferrer.set(r.referrerId, (referralsByReferrer.get(r.referrerId) ?? 0) + 1);
    }
    const clicksByCode = new Map<string, number>();
    for (const e of events) {
      if (e.type === "referral_click" && e.metadata) {
        try {
          const meta = JSON.parse(e.metadata) as { code?: string };
          if (meta.code) clicksByCode.set(meta.code, (clicksByCode.get(meta.code) ?? 0) + 1);
        } catch { /* ignore */ }
      }
    }
    const leaderboard: LeaderboardRow[] = [...referralsByReferrer.entries()]
      .map(([studentId, count]) => {
        const s = referrerById.get(studentId);
        const clicks = clicksByCode.get(s?.referralCode ?? "") ?? count;
        return { studentId, s, count, clicks };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
      .map((row, idx) => ({
        rank: idx + 1,
        studentId: row.studentId,
        maskedName: maskName(row.s?.name ?? "Student", idx),
        college: row.s?.college ?? "—",
        referrals: row.count,
        clicks: row.clicks,
        conversionPct: row.clicks > 0 ? (row.count / row.clicks) * 100 : 0,
      }));

    /* ---------------- branches ---------------- */
    const branchMap = new Map<string, number>();
    for (const s of students) branchMap.set(s.branch, (branchMap.get(s.branch) ?? 0) + 1);
    const branches = [...branchMap.entries()]
      .map(([branch, count]) => ({ branch, count }))
      .sort((a, b) => b.count - a.count);

    const summary: CampaignSummary = {
      demo: { label: "Demo Campaign Data", generatedAt: new Date().toISOString() },
      campaign: {
        name: campaign.name,
        targetRegistrations: target,
        budget: campaign.budget,
        durationDays: campaign.durationDays,
        startDate: campaign.startDate.toISOString(),
        endDate: campaign.endDate.toISOString(),
        currentDay,
      },
      kpis: {
        registrations,
        target,
        progressPct: (registrations / target) * 100,
        remaining: Math.max(0, target - registrations),
        referralRegistrations: referralRegs,
        referralSharePct: (referralRegs / registrations) * 100,
        collegesReached: colleges.length,
        activeReferrers: referralsByReferrer.size,
        conversionRatePct: visits > 0 ? (registrations / visits) * 100 : 0,
        visits,
        starts,
        avgPacePerDay,
        latestDay: currentDay,
        latestDayRegistrations,
        requiredPacePerDay,
        projectedFinal,
        daysRemaining,
      },
      daily,
      channels,
      budget,
      colleges,
      leaderboard,
      funnel,
      branches,
    };

    return NextResponse.json(summary);
  } catch (err) {
    console.error("[campaign] failed", err);
    return NextResponse.json({ error: "Failed to load campaign data." }, { status: 500 });
  }
}
