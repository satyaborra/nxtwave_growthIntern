import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Reset Demo — removes every non-demo (live UI) registration plus its
 * referral records and events, restoring the pristine simulated campaign.
 */
export async function POST() {
  try {
    const liveStudents = await db.student.findMany({
      where: { isDemo: false },
      select: { id: true },
    });
    const ids = liveStudents.map((s) => s.id);
    if (ids.length > 0) {
      await db.campaignEvent.deleteMany({ where: { studentId: { in: ids } } });
      await db.referral.deleteMany({
        where: { OR: [{ referrerId: { in: ids } }, { referredStudentId: { in: ids } }] },
      });
      // detach attribution from demo students that were referred by live ones
      await db.student.updateMany({ where: { referredById: { in: ids } }, data: { referredById: null } });
      await db.student.deleteMany({ where: { id: { in: ids } } });
    }
    return NextResponse.json({ ok: true, removed: ids.length });
  } catch (err) {
    console.error("[demo/reset] failed", err);
    return NextResponse.json({ error: "Failed to reset demo data." }, { status: 500 });
  }
}
