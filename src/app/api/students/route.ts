import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Registrations explorer with filters (college, branch, year, channel, day, search). */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const college = searchParams.get("college") ?? "";
    const branch = searchParams.get("branch") ?? "";
    const year = searchParams.get("year") ?? "";
    const channel = searchParams.get("channel") ?? "";
    const day = searchParams.get("day") ?? "";
    const q = (searchParams.get("q") ?? "").trim().toLowerCase();
    const refOnly = searchParams.get("refOnly") === "1";

    const campaign = await db.campaign.findFirst({ orderBy: { startDate: "desc" } });
    const students = await db.student.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, email: true, college: true, branch: true, year: true,
        referralCode: true, channel: true, createdAt: true, referredById: true,
        referredBy: { select: { referralCode: true } },
      },
    });

    const start = campaign ? new Date(campaign.startDate).getTime() : 0;
    const filtered = students.filter((s) => {
      if (college && s.college !== college) return false;
      if (branch && s.branch !== branch) return false;
      if (year && s.year !== year) return false;
      if (channel && s.channel !== channel) return false;
      if (refOnly && !s.referredById) return false;
      if (day) {
        const d = Math.floor((new Date(s.createdAt).getTime() - start) / DAY_MS) + 1;
        if (String(d) !== day) return false;
      }
      if (q) {
        const hay = `${s.name} ${s.college} ${s.referralCode}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return NextResponse.json({
      total: filtered.length,
      students: filtered.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email.replace(/^(.{2}).*(@.*)$/, "$1•••$2"), // partially masked
        college: s.college,
        branch: s.branch,
        year: s.year,
        referralCode: s.referralCode,
        referredByCode: s.referredBy?.referralCode ?? null,
        channel: s.channel,
        createdAt: s.createdAt,
        day: Math.floor((new Date(s.createdAt).getTime() - start) / DAY_MS) + 1,
      })),
    });
  } catch (err) {
    console.error("[students] failed", err);
    return NextResponse.json({ error: "Failed to load registrations." }, { status: 500 });
  }
}
