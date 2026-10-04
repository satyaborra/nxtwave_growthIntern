import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { BRANCHES, YEARS, ACQUISITION_CHANNELS } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Sanitize free-text: trim, collapse whitespace, strip control chars. */
function clean(value: string): string {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const registrationSchema = z.object({
  name: z.string().transform(clean).pipe(
    z
      .string()
      .min(2, "Please enter your full name")
      .max(60, "Name is too long")
      .regex(/^[a-zA-Z][a-zA-Z .'-]*$/, "Name contains invalid characters")
  ),
  email: z.string().transform(clean).pipe(
    z.string().email("Enter a valid email address").max(120).toLowerCase()
  ),
  college: z.string().transform(clean).pipe(
    z.string().min(2, "College is required").max(120)
  ),
  branch: z.string().refine((v) => (BRANCHES as readonly string[]).includes(v), {
    message: "Select your branch",
  }),
  year: z.string().refine((v) => (YEARS as readonly string[]).includes(v), {
    message: "Select your year",
  }),
  channel: z
    .string()
    .refine((v) => (ACQUISITION_CHANNELS as readonly string[]).includes(v), {
      message: "Select how you heard about us",
    }),
  refCode: z
    .string()
    .transform((v) => clean(v).toUpperCase())
    .pipe(z.string().max(20))
    .optional()
    .or(z.literal("")),
});

function generateReferralCode(name: string): string {
  const base = name.replace(/[^a-zA-Z]/g, "").slice(0, 6).toUpperCase() || "GROWTH";
  const digits = Math.floor(100 + Math.random() * 900);
  return `${base}${digits}`;
}

export async function POST(req: NextRequest) {
  try {
    const parsed = registrationSchema.safeParse(await req.json());
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return NextResponse.json(
        { error: first?.message ?? "Invalid registration details" },
        { status: 400 }
      );
    }
    const { name, email, college, branch, year, channel } = parsed.data;
    const refCode = (parsed.data.refCode ?? "").trim().toUpperCase();

    // Duplicate registration guard (email is the identity key)
    const existing = await db.student.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        {
          error:
            "This email is already registered for the workshop. Open your growth profile instead.",
          code: "DUPLICATE_EMAIL",
          referralCode: existing.referralCode,
        },
        { status: 409 }
      );
    }

    // Referral attribution — validate code, prevent self-referral by email match
    let referrer: { id: string; referralCode: string } | null = null;
    if (refCode) {
      const found = await db.student.findUnique({ where: { referralCode: refCode } });
      if (!found) {
        return NextResponse.json(
          { error: `Referral code "${refCode}" is not valid. Clear it or check with your friend.` },
          { status: 400 }
        );
      }
      if (found.email === email) {
        return NextResponse.json(
          { error: "You cannot use your own referral code." },
          { status: 400 }
        );
      }
      referrer = { id: found.id, referralCode: found.referralCode };
    }

    // Unique referral code generation
    let referralCode = generateReferralCode(name);
    for (let i = 0; i < 10; i++) {
      const clash = await db.student.findUnique({ where: { referralCode } });
      if (!clash) break;
      referralCode = generateReferralCode(name);
    }

    const student = await db.student.create({
      data: {
        name,
        email,
        college,
        branch,
        year,
        channel: referrer ? "Friend Referral" : channel,
        referralCode,
        referredById: referrer?.id ?? null,
        isDemo: false,
      },
    });

    const now = new Date();
    const events = [
      {
        type: "visit",
        studentId: null as string | null,
        channel: referrer ? "Friend Referral" : channel,
        metadata: JSON.stringify({ college, code: referrer?.referralCode ?? null }),
        timestamp: new Date(now.getTime() - 60_000),
      },
      {
        type: "start",
        studentId: null as string | null,
        channel: referrer ? "Friend Referral" : channel,
        metadata: JSON.stringify({ college, code: referrer?.referralCode ?? null }),
        timestamp: new Date(now.getTime() - 30_000),
      },
      {
        type: "register",
        studentId: student.id,
        channel: student.channel,
        metadata: JSON.stringify({ college }),
        timestamp: now,
      },
    ];
    if (referrer) {
      events.push({
        type: "referral_click",
        studentId: null,
        channel: "Friend Referral",
        metadata: JSON.stringify({ code: referrer.referralCode, college }),
        timestamp: new Date(now.getTime() - 90_000),
      });
      await db.referral.create({
        data: {
          referrerId: referrer.id,
          referredStudentId: student.id,
          referralCode: referrer.referralCode,
          status: "registered",
          createdAt: now,
        },
      });
    }
    await db.campaignEvent.createMany({ data: events });

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        college: student.college,
        branch: student.branch,
        year: student.year,
        referralCode: student.referralCode,
        referredByCode: referrer?.referralCode ?? null,
        channel: student.channel,
        createdAt: student.createdAt,
      },
    });
  } catch (err) {
    console.error("[register] failed", err);
    return NextResponse.json(
      { error: "Registration failed due to a server error. Please try again." },
      { status: 500 }
    );
  }
}
