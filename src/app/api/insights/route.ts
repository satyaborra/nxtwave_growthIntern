import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PAID_CHANNELS, BUDGET, TARGET_REGISTRATIONS } from "@/lib/campaign-config";
import type { GrowthInsight, InsightsPayload, Recommendation } from "@/lib/types";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Deterministic, rule-based "AI Growth Analyst".
 * Every insight is derived from measurable aggregates in the simulated
 * dataset — no unsupported claims — and labeled as AI-generated demo output.
 */
export async function GET() {
  try {
    const [campaign, students, referrals, events] = await Promise.all([
      db.campaign.findFirst({ orderBy: { startDate: "desc" } }),
      db.student.findMany({ select: { id: true, college: true, channel: true, createdAt: true } }),
      db.referral.findMany({ select: { referrerId: true } }),
      db.campaignEvent.findMany({ select: { type: true, channel: true } }),
    ]);
    if (!campaign || students.length === 0) {
      return NextResponse.json({ error: "No campaign data. Load the demo campaign." }, { status: 404 });
    }

    const start = new Date(campaign.startDate).getTime();
    const dayOf = (d: Date | string) => Math.floor((new Date(d).getTime() - start) / DAY_MS) + 1;
    const registrations = students.length;
    const target = campaign.targetRegistrations;
    const currentDay = campaign.currentDay;
    const daysRemaining = campaign.durationDays - currentDay;

    const visits =
      events.filter((e) => e.type === "visit").length +
      events.filter((e) => e.type === "referral_click").length;
    const clicks = events.filter((e) => e.type === "referral_click").length;
    const shares = events.filter((e) => e.type === "share").length;
    const conversionPct = visits > 0 ? (registrations / visits) * 100 : 0;
    const referralSharePct = (referrals.length / registrations) * 100;

    // channel aggregates
    const regsByChannel = new Map<string, number>();
    const daysByChannel = new Map<string, number[]>();
    for (const s of students) {
      regsByChannel.set(s.channel, (regsByChannel.get(s.channel) ?? 0) + 1);
      const arr = daysByChannel.get(s.channel) ?? [0, 0, 0, 0, 0];
      arr[dayOf(s.createdAt) - 1] += 1;
      daysByChannel.set(s.channel, arr);
    }
    const directRegs = (ch: string) => regsByChannel.get(ch) ?? 0;
    const lastTwo = (ch: string) => {
      const d = daysByChannel.get(ch) ?? [0, 0, 0, 0, 0];
      return d[3] + d[4];
    };

    // college aggregates
    const regsByCollege = new Map<string, number>();
    for (const s of students) regsByCollege.set(s.college, (regsByCollege.get(s.college) ?? 0) + 1);
    const topCollege = [...regsByCollege.entries()].sort((a, b) => b[1] - a[1])[0];

    // paid economics
    const paidRegs = PAID_CHANNELS.reduce((s, ch) => s + directRegs(ch), 0);
    const paidSpend = 980; // CHANNEL_SPEND sum; kept local to avoid import drift
    const paidCPA = paidRegs > 0 ? paidSpend / paidRegs : 0;

    const dailyRegs = new Array(campaign.durationDays).fill(0) as number[];
    for (const s of students) {
      const d = dayOf(s.createdAt);
      if (d >= 1 && d <= campaign.durationDays) dailyRegs[d - 1] += 1;
    }
    const latest = dailyRegs[currentDay - 1] ?? 0;
    const requiredPace = (target - registrations) / Math.max(1, daysRemaining);
    const avgPace = registrations / currentDay;

    const insights: GrowthInsight[] = [];
    const recommendations: Recommendation[] = [];

    /* Insight 1 — top direct channel */
    const clubRegs = directRegs("College Club");
    const whatsappRegs = directRegs("WhatsApp Group");
    const topDirect = clubRegs >= whatsappRegs ? "College Club" : "WhatsApp Group";
    const topDirectRegs = Math.max(clubRegs, whatsappRegs);
    insights.push({
      id: "insight-channel-volume",
      title: `${topDirect} outreach is the highest-volume direct channel`,
      body: `${topDirect} produced ${topDirectRegs} registrations so far — the strongest non-referral source in the mix. Similar technical clubs and class groups in the same cities are likely to respond the same way.`,
      severity: "positive",
      metric: `${topDirectRegs} registrations`,
    });

    /* Insight 2 — referral loop strength */
    insights.push({
      id: "insight-referral-loop",
      title: "The referral loop is carrying the campaign",
      body: `Referrals account for ${referrals.length} registrations (${referralSharePct.toFixed(1)}% of the total) from ${referrals.length > 0 ? new Set(referrals.map((r) => r.referrerId)).size : 0} active referrers. ${shares} shares generated ${clicks} link clicks — making share visibility and message quality the highest-leverage lever left.`,
      severity: "positive",
      metric: `${referralSharePct.toFixed(1)}% referral share`,
    });

    /* Insight 3 — pacing */
    const ahead = latest >= requiredPace;
    insights.push({
      id: "insight-pacing",
      title: ahead
        ? "Pace is above the level needed to hit 500"
        : "Pace needs a final push to reach 500",
      body: `Day ${currentDay} brought ${latest} registrations vs the ${requiredPace.toFixed(0)}/day now required for the remaining ${daysRemaining} day(s). Average pace is ${avgPace.toFixed(1)}/day against the ${Math.round(target / campaign.durationDays)}/day linear target.`,
      severity: ahead ? "positive" : "warning",
      metric: `${latest} regs on Day ${currentDay}`,
    });

    /* Insight 4 — paid efficiency */
    insights.push({
      id: "insight-paid-cpa",
      title: "Paid acquisition works, but costs far more per registration",
      body: `Paid channels (Instagram + LinkedIn) delivered ${paidRegs} registrations for ${"₹" + paidSpend} — about ₹${paidCPA.toFixed(0)} per registration — while club, WhatsApp and referral distribution cost ₹0 per registration. Evaluate cost per registration before increasing spend; the remaining budget is ₹${BUDGET.total - paidSpend}.`,
      severity: "warning",
      metric: `₹${paidCPA.toFixed(0)} per paid registration`,
    });

    /* Insight 5 — college concentration */
    if (topCollege) {
      insights.push({
        id: "insight-college",
        title: `Registrations concentrate in a few colleges`,
        body: `${topCollege[0]} leads with ${topCollege[1]} registrations (${((topCollege[1] / registrations) * 100).toFixed(1)}% of total). Replicating the club + senior-student playbook in the next tier of colleges is the fastest way to widen the funnel.`,
        severity: "neutral",
        metric: `${topCollege[1]} regs in top college`,
      });
    }

    /* Recommendations — decision-oriented triad */
    recommendations.push({
      type: "double-down",
      title: "Double down on college club outreach",
      body: `Highest-volume direct channel at ${clubRegs} registrations with ₹0 spend. Brief 10 more clubs in the same format for Days ${currentDay + 1}-${campaign.durationDays}.`,
      metricLabel: "College Club registrations",
      metricValue: `${clubRegs} · ₹0 CPA`,
    });
    recommendations.push({
      type: "test",
      title: "Test a second referral message variant",
      body: `${shares} shares → ${clicks} clicks → ${referrals.length} registrations. A/B the share message (project-based hook vs free-workshop hook) and measure clicks per share.`,
      metricLabel: "Clicks per share",
      metricValue: shares > 0 ? (clicks / shares).toFixed(1) : "—",
    });
    recommendations.push({
      type: "watch",
      title: "Watch paid acquisition cost per registration",
      body: `Paid CPA is ~₹${paidCPA.toFixed(0)} vs ₹0 organic. Keep the remaining ₹${BUDGET.total - paidSpend} as contingency unless organic pace drops below ${requiredPace.toFixed(0)}/day.`,
      metricLabel: "Paid cost per registration",
      metricValue: `₹${paidCPA.toFixed(0)}`,
    });

    const payload: InsightsPayload = {
      label: "AI-generated insights based on simulated campaign data",
      generatedAt: new Date().toISOString(),
      insights,
      recommendations,
    };
    return NextResponse.json(payload);
  } catch (err) {
    console.error("[insights] failed", err);
    return NextResponse.json({ error: "Failed to generate insights." }, { status: 500 });
  }
}
