import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Growth profile for a student, looked up by their referral code. */
export async function GET(req: NextRequest) {
  try {
    const code = (new URL(req.url).searchParams.get("code") ?? "").trim().toUpperCase();
    if (!code) {
      return NextResponse.json({ error: "Referral code is required." }, { status: 400 });
    }
    const student = await db.student.findUnique({
      where: { referralCode: code },
      include: { referredBy: { select: { referralCode: true } } },
    });
    if (!student) {
      return NextResponse.json({ error: `No student found for code "${code}".` }, { status: 404 });
    }

    const [referrals, shareEvents, clickEvents, allReferralCounts, collegeCount] =
      await Promise.all([
        db.referral.findMany({
          where: { referrerId: student.id },
          orderBy: { createdAt: "desc" },
          include: {
            referredStudent: { select: { name: true, college: true, branch: true } },
          },
        }),
        db.campaignEvent.count({ where: { type: "share", studentId: student.id } }),
        db.campaignEvent.count({
          where: { type: "referral_click", metadata: { contains: `"${student.referralCode}"` } },
        }),
        db.referral.groupBy({ by: ["referrerId"], _count: { id: true }, orderBy: { _count: { id: "desc" } } }),
        db.student.count({ where: { college: student.college } }),
      ]);

    const registrations = referrals.length;
    const shares = Math.max(shareEvents, registrations);
    const clicks = Math.max(clickEvents, registrations);
    const rank = allReferralCounts.findIndex((r) => r.referrerId === student.id);
    const leaderboardRank = rank >= 0 ? rank + 1 : null;

    const timeline = referrals.map((r) => ({
      type: "referral_registered",
      label: `${r.referredStudent.name.split(" ")[0]} from ${r.referredStudent.college} registered`,
      detail: `via your referral link · ${r.referredStudent.branch}`,
      at: r.createdAt,
    }));

    return NextResponse.json({
      student: {
        name: student.name,
        firstName: student.name.split(" ")[0],
        college: student.college,
        branch: student.branch,
        year: student.year,
        referralCode: student.referralCode,
        createdAt: student.createdAt,
        channel: student.channel,
        referredByCode: student.referredBy?.referralCode ?? null,
      },
      stats: {
        registrations,
        clicks,
        shares,
        conversionPct: clicks > 0 ? (registrations / clicks) * 100 : null,
        leaderboardRank,
        totalReferrers: allReferralCounts.length,
        collegeRegistrations: collegeCount,
      },
      funnel: { shared: shares, clicked: clicks, registered: registrations },
      timeline,
    });
  } catch (err) {
    console.error("[student] failed", err);
    return NextResponse.json({ error: "Failed to load growth profile." }, { status: 500 });
  }
}
