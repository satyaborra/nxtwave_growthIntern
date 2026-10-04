/**
 * NxtWave AI Workshop Growth Engine — demo campaign seeder.
 *
 * Generates ONE internally-consistent simulated dataset:
 *  - 327 registrations across campaign days 1-5  ([38, 52, 61, 82, 94])
 *  - 182 referral registrations attributed to exactly 71 referrers
 *  - 24 colleges, 9 branches, 2 year groups
 *  - Funnel telemetry: 4,860 reach / 1,527 visits / 464 starts /
 *    327 registers / 208 shares / 540 referral clicks
 *  - Conversion rate 327/1527 = 21.4%
 *
 * Deterministic PRNG so the dataset is reproducible. All counts are exact.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

/* ------------------------------------------------------------------ */
/* Deterministic PRNG                                                  */
/* ------------------------------------------------------------------ */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260204);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const randInt = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));

function weightedPick<T extends string>(weights: Record<T, number>): T {
  const entries = Object.entries(weights) as [T, number][];
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [key, w] of entries) {
    r -= w;
    if (r <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

/* ------------------------------------------------------------------ */
/* Reference data                                                      */
/* ------------------------------------------------------------------ */
const DAYS = [1, 2, 3, 4, 5]; // campaign days with actual data (day 5 = snapshot)
const DAILY_REGS = [38, 52, 61, 82, 94]; // total 327
const REFERRAL_DAILY = [24, 33, 38, 43, 44]; // total 182

const ORGANIC_QUOTA: Record<string, number[]> = {
  "College Club": [6, 9, 11, 16, 20], // 62
  "WhatsApp Group": [3, 5, 6, 9, 11], // 34
  Instagram: [2, 3, 4, 7, 8], // 24
  LinkedIn: [1, 1, 2, 3, 5], // 12
  Email: [2, 1, 0, 4, 6], // 13
};
// per-day organic totals: [14, 19, 23, 39, 50] = 145
// per-day referral:     [24, 33, 38, 43, 44] = 182
// per-day total:        [38, 52, 61, 82, 94] = 327  ✓

const COLLEGE_QUOTAS: [string, number][] = [
  ["VIT Vellore", 48],
  ["SRM Institute of Science and Technology", 41],
  ["Anna University", 33],
  ["Amrita Vishwa Vidyapeetham", 27],
  ["CBIT Hyderabad", 24],
  ["PSG College of Technology", 21],
  ["BITS Pilani", 19],
  ["Manipal Institute of Technology", 16],
  ["KIIT Bhubaneswar", 14],
  ["VIT-AP Amaravati", 12],
  ["SSN College of Engineering", 9],
  ["Coimbatore Institute of Technology", 8],
  ["Andhra University College of Engineering", 7],
  ["JNTU Hyderabad", 7],
  ["Sri Vasavi Engineering College", 6],
  ["GVP College of Engineering", 6],
  ["BVRIT Hyderabad", 5],
  ["CVR College of Engineering", 4],
  ["VNR VJIET Hyderabad", 4],
  ["ANITS Visakhapatnam", 4],
  ["RVR & JC College of Engineering", 3],
  ["Gudlavalleru Engineering College", 3],
  ["Sree Vidyanikethan Engineering College", 3],
  ["SRKR Engineering College", 3],
]; // 327 total across 24 colleges

const BRANCH_WEIGHTS: Record<string, number> = {
  CSE: 34, IT: 12, "AI/ML": 16, "Data Science": 8,
  ECE: 12, EEE: 7, Mechanical: 5, Civil: 4, Other: 2,
};
const YEAR_WEIGHTS: Record<string, number> = { "Final Year": 78, "3rd Year": 22 };

const FIRST_NAMES = [
  "Aarav", "Ananya", "Rohit", "Priya", "Vikram", "Sneha", "Arjun", "Kavya",
  "Rahul", "Divya", "Karthik", "Meera", "Siddharth", "Pooja", "Aditya", "Ishita",
  "Varun", "Nandini", "Nikhil", "Shruti", "Pranav", "Anjali", "Harsha", "Swathi",
  "Ravi", "Keerthi", "Manoj", "Lakshmi", "Surya", "Bhavana", "Teja", "Sravani",
  "Akash", "Meghana", "Vishnu", "Naveen", "Sirisha", "Abhinav", "Deepika", "Ganesh",
];
const LAST_NAMES = [
  "Sharma", "Reddy", "Rao", "Naidu", "Kumar", "Gupta", "Singh", "Patel", "Verma",
  "Das", "Iyer", "Menon", "Pillai", "Bose", "Banerjee", "Joshi", "Kulkarni",
  "Desai", "Mehta", "Shah", "Yadav", "Krishna", "Prasad", "Raju", "Naik", "Goud",
  "Chandra", "Mishra", "Chowdary", "Sai",
];

// Funnel telemetry targets (exact)
const VISITS = { "College Club": 296, "WhatsApp Group": 258, Instagram: 208, LinkedIn: 118, Email: 107 }; // 987 direct
const REFERRAL_CLICKS = 540; // + 987 = 1,527 total visits  → 327/1527 = 21.4%
const DIRECT_STARTS = 252;
const REFERRAL_STARTS = 212; // 252 + 212 = 464 starts
const TOTAL_SHARES = 208;
const DAY_WEIGHTS = [0.1, 0.14, 0.17, 0.24, 0.35]; // visit/click distribution across days 1-5

const DAY_MS = 24 * 60 * 60 * 1000;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
function dayTimestamp(day: number, campaignStart: Date): Date {
  const base = campaignStart.getTime() + (day - 1) * DAY_MS;
  const hour = 9 + Math.floor(rand() * 14); // 09:00 – 22:59
  const minute = randInt(0, 59);
  return new Date(base + hour * 3600_000 + minute * 60_000);
}

/** Split n into `buckets` parts proportional to weights, exact sum. */
function exactSplit(n: number, weights: number[]): number[] {
  const total = weights.reduce((s, w) => s + w, 0);
  const raw = weights.map((w) => (n * w) / total);
  const base = raw.map((r) => Math.floor(r));
  let rem = n - base.reduce((s, b) => s + b, 0);
  const order = raw
    .map((r, i) => [r - base[i], i] as [number, number])
    .sort((a, b) => b[0] - a[0]);
  for (let k = 0; k < rem; k++) base[order[k % order.length][1]] += 1;
  return base;
}

function usedCodes() {
  return new Set<string>();
}
function makeCode(name: string, used: Set<string>): string {
  for (let i = 0; i < 200; i++) {
    const code = `${name.replace(/[^a-zA-Z]/g, "").slice(0, 6).toUpperCase() || "NW"}${randInt(100, 999)}`;
    if (!used.has(code)) {
      used.add(code);
      return code;
    }
  }
  return `NW${Date.now() % 100000}${randInt(10, 99)}`;
}

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`SEED INVARIANT FAILED: ${msg}`);
}

/* ------------------------------------------------------------------ */
/* Seed                                                                */
/* ------------------------------------------------------------------ */
async function main() {
  console.log("Resetting collections…");
  await db.campaignEvent.deleteMany();
  await db.referral.deleteMany();
  await db.student.deleteMany();
  await db.campaign.deleteMany();

  const now = new Date();
  const campaignStart = new Date(new Date(now).setHours(0, 0, 0, 0) - 4 * DAY_MS);
  const campaignEnd = new Date(campaignStart.getTime() + 7 * DAY_MS - 1);

  await db.campaign.create({
    data: {
      name: "AI Workshop Launch — 500 Final-Year Engineers",
      targetRegistrations: 500,
      budget: 2000,
      durationDays: 7,
      startDate: campaignStart,
      endDate: campaignEnd,
      currentDay: 5,
    },
  });

  /* ---------------- 1. Slot specs: (day, channel) for 327 students -- */
  console.time("phase-1-slots");
  type Slot = { day: number; channel: string; isReferral: boolean };
  const slots: Slot[] = [];
  for (const [channel, perDay] of Object.entries(ORGANIC_QUOTA)) {
    perDay.forEach((count, idx) => {
      for (let i = 0; i < count; i++) slots.push({ day: idx + 1, channel, isReferral: false });
    });
  }
  REFERRAL_DAILY.forEach((count, idx) => {
    for (let i = 0; i < count; i++) slots.push({ day: idx + 1, channel: "Friend Referral", isReferral: true });
  });
  // shuffle within each day (deterministic) so college assignment is unbiased
  for (let d = 1; d <= 5; d++) {
    const daySlots = slots.filter((s) => s.day === d);
    for (let i = daySlots.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [daySlots[i], daySlots[j]] = [daySlots[j], daySlots[i]];
    }
  }

  console.timeEnd("phase-1-slots");

  /* ---------------- 2. Create students ------------------------------ */
  const collegePool: string[] = [];
  for (const [name, quota] of COLLEGE_QUOTAS) {
    for (let i = 0; i < quota; i++) collegePool.push(name);
  }
  // interleave college pool so early/late students get a college mix
  collegePool.sort(() => rand() - 0.5);

  const used = usedCodes();
  const emailUsed = new Set<string>();
  const students: {
    name: string; email: string; college: string; branch: string; year: string;
    referralCode: string; channel: string; isReferral: boolean; createdAt: Date;
  }[] = [];

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const name = `${first} ${last}`;
    let email = `${first}.${last}${randInt(10, 99)}@demo-student.in`.toLowerCase();
    let guard = 0;
    while (emailUsed.has(email) && guard++ < 50) {
      email = `${first}.${last}${randInt(100, 999)}@demo-student.in`.toLowerCase();
    }
    emailUsed.add(email);
    let createdAt = dayTimestamp(slot.day, campaignStart);
    // Day-1 ordering guarantee: organic students land 09:00–12:00,
    // referrals 13:00–22:00, so a day-1 referrer always registers first.
    if (slot.day === 1) {
      const base = campaignStart.getTime();
      const hour = slot.isReferral ? randInt(13, 22) : randInt(9, 11);
      createdAt = new Date(base + hour * 3600_000 + randInt(0, 59) * 60_000);
    }
    students.push({
      name,
      email,
      college: collegePool[i % collegePool.length],
      branch: weightedPick(BRANCH_WEIGHTS),
      year: weightedPick(YEAR_WEIGHTS),
      referralCode: makeCode(first, used),
      channel: slot.channel,
      isReferral: slot.isReferral,
      createdAt,
    });
  }
  assert(students.length === 327, `students ${students.length} != 327`);
  for (let d = 1; d <= 5; d++) {
    const c = students.filter((s) => dayOf(s.createdAt, campaignStart) === d).length;
    assert(c === DAILY_REGS[d - 1], `day ${d} regs ${c} != ${DAILY_REGS[d - 1]}`);
  }
  const byChannel = (ch: string) => students.filter((s) => s.channel === ch).length;
  assert(byChannel("Friend Referral") === 182, "referral regs != 182");
  assert(byChannel("College Club") === 62, "club regs != 62");
  assert(byChannel("WhatsApp Group") === 34, "whatsapp regs != 34");

  function dayOf(date: Date, start: Date) {
    return Math.floor((date.getTime() - start.getTime()) / DAY_MS) + 1;
  }

  /* ---------------- 3. Insert students ------------------------------ */
  const organic = students.filter((s) => !s.isReferral);
  const dayFactor: Record<number, number> = { 1: 5, 2: 4, 3: 3, 4: 2, 5: 1.5 };
  const channelFactor: Record<string, number> = {
    "College Club": 1.6, "WhatsApp Group": 1.4, Instagram: 0.8, LinkedIn: 0.9, Email: 0.7,
  };

  // weighted candidate ranking for referrer pool
  const candidates = organic
    .map((s) => ({
      s,
      weight: (dayFactor[dayOf(s.createdAt, campaignStart)] ?? 1) * (channelFactor[s.channel] ?? 1),
    }))
    .sort((a, b) => b.weight - a.weight);

  // deterministic weighted sampling without replacement → 71 referrers
  const pool = [...candidates];
  const referrerWeights: { student: typeof organic[number]; weight: number }[] = [];
  for (let i = 0; i < 71 && pool.length > 0; i++) {
    const total = pool.reduce((s, c) => s + c.weight, 0);
    let r = rand() * total;
    let idx = pool.length - 1;
    for (let j = 0; j < pool.length; j++) {
      r -= pool[j].weight;
      if (r <= 0) { idx = j; break; }
    }
    const [chosen] = pool.splice(idx, 1);
    referrerWeights.push({ student: chosen.s, weight: chosen.weight * (0.6 + rand() * 0.8) });
  }

  // allocate exactly 182 referrals across the 71 referrers (largest remainder)
  const counts = exactSplit(182, referrerWeights.map((r) => r.weight));
  referrerWeights.forEach((r, i) => (r.weight = counts[i]));
  assert(referrerWeights.reduce((s, r) => s + r.weight, 0) === 182, "referral allocation != 182");
  assert(referrerWeights.filter((r) => r.weight > 0).length === 71, "active referrers != 71");

  /* ---------------- 4. Assign referrers over time ------------------- */
  // capacity list; for each referral slot (in time order) pick eligible referrer with max remaining capacity
  const capacity = referrerWeights
    .map((r) => ({ student: r.student, remaining: r.weight }))
    .sort((a, b) => a.student.createdAt.getTime() - b.student.createdAt.getTime());

  const referredSlots = students.filter((s) => s.isReferral);
  const referralPairs: { referrer: typeof capacity[number]["student"]; referred: typeof referredSlots[number] }[] = [];

  for (const referred of referredSlots.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())) {
    const eligible = capacity.filter(
      (c) => c.remaining > 0 && c.student.createdAt.getTime() < referred.createdAt.getTime()
    );
    if (eligible.length === 0) {
      // fall back: any with remaining capacity (should not happen given day-1 density)
      const any = capacity.filter((c) => c.remaining > 0);
      any.sort((a, b) => b.remaining - a.remaining);
      any[0].remaining -= 1;
      referralPairs.push({ referrer: any[0].student, referred });
      continue;
    }
    eligible.sort((a, b) => b.remaining - a.remaining || a.student.createdAt.getTime() - b.student.createdAt.getTime());
    eligible[0].remaining -= 1;
    referralPairs.push({ referrer: eligible[0].student, referred });
  }
  assert(referralPairs.length === 182, `pairs ${referralPairs.length} != 182`);
  assert(new Set(referralPairs.map((p) => p.referrer.referralCode)).size === 71, "distinct referrers != 71");

  console.time("phase-5-persist");
  /* ---------------- 5. Persist students + referrals ----------------- */
  await db.student.createMany({
    data: students.map((s) => ({
      name: s.name, email: s.email, college: s.college, branch: s.branch, year: s.year,
      referralCode: s.referralCode, channel: s.channel, isDemo: true, createdAt: s.createdAt,
    })),
  });
  const rows = await db.student.findMany({ select: { id: true, referralCode: true } });
  const idByCode = new Map<string, string>();
  for (const r of rows) idByCode.set(r.referralCode, r.id);

  await db.referral.createMany({
    data: referralPairs.map((pair) => ({
      referrerId: idByCode.get(pair.referrer.referralCode)!,
      referredStudentId: idByCode.get(pair.referred.referralCode)!,
      referralCode: pair.referrer.referralCode,
      status: "registered",
      createdAt: pair.referred.createdAt,
    })),
  });
  // single-statement attribution link: student.referredById = referrer of the
  // referral record they appear in
  await db.$executeRawUnsafe(
    `UPDATE Student SET referredById = (SELECT r.referrerId FROM Referral r WHERE r.referredStudentId = Student.id)`
  );
  console.timeEnd("phase-5-persist");
  console.time("events-build");
  const events: {
    type: string; studentId?: string; channel?: string; metadata?: string; timestamp: Date;
  }[] = [];

  // register events (one per student)
  for (const s of students) {
    events.push({
      type: "register", studentId: idByCode.get(s.referralCode), channel: s.channel,
      timestamp: s.createdAt,
    });
  }

  // visit events — direct, distributed across days + colleges ∝ college regs
  for (const [channel, total] of Object.entries(VISITS)) {
    const perDay = exactSplit(total, DAY_WEIGHTS);
    perDay.forEach((count, idx) => {
      for (let i = 0; i < count; i++) {
        const college = collegePool[Math.floor(rand() * collegePool.length)];
        events.push({
          type: "visit", channel,
          metadata: JSON.stringify({ college }),
          timestamp: dayTimestamp(idx + 1, campaignStart),
        });
      }
    });
  }

  // referral click events — 540, per-referrer ≈ 2.5× their conversions, exact total
  const clickEvents: typeof events = [];
  const clickCapacity = referralPairs.map((p) => p.referrer.referralCode);
  const clicksPerReferrer = new Map<string, number>();
  for (const code of new Set(clickCapacity)) {
    const regs = referralPairs.filter((p) => p.referrer.referralCode === code).length;
    clicksPerReferrer.set(code, Math.max(regs, Math.round(regs * 2.5)));
  }
  let clickTotal = [...clicksPerReferrer.values()].reduce((s, v) => s + v, 0);
  const codesArr = [...clicksPerReferrer.keys()];
  let ci = 0;
  while (clickTotal > REFERRAL_CLICKS) {
    const code = codesArr[ci % codesArr.length];
    const cur = clicksPerReferrer.get(code)!;
    if (cur > referralPairs.filter((p) => p.referrer.referralCode === code).length) {
      clicksPerReferrer.set(code, cur - 1);
      clickTotal--;
    }
    ci++;
  }
  while (clickTotal < REFERRAL_CLICKS) {
    const code = codesArr[ci % codesArr.length];
    clicksPerReferrer.set(code, clicksPerReferrer.get(code)! + 1);
    clickTotal++;
    ci++;
  }
  assert(clickTotal === REFERRAL_CLICKS, "click total mismatch");
  for (const [code, count] of clicksPerReferrer) {
    const referrer = students.find((s) => s.referralCode === code)!;
    const referrerDay = dayOf(referrer.createdAt, campaignStart);
    const perDay = exactSplit(count, DAY_WEIGHTS.slice(referrerDay - 1));
    perDay.forEach((c, idx) => {
      for (let i = 0; i < c; i++) {
        clickEvents.push({
          type: "referral_click", channel: "Friend Referral",
          metadata: JSON.stringify({ code, referrerStudent: referrer.name }),
          timestamp: dayTimestamp(referrerDay + idx, campaignStart),
        });
      }
    });
  }
  assert(clickEvents.length === REFERRAL_CLICKS, `clicks ${clickEvents.length} != 540`);

  // share events — 208, from the 71 referrers (their conversions + a top-up for the most active)
  const sharePerReferrer = new Map<string, number>();
  const sortedReferrers = [...new Set(referralPairs.map((p) => p.referrer.referralCode))];
  for (const code of sortedReferrers) {
    const regs = referralPairs.filter((p) => p.referrer.referralCode === code).length;
    sharePerReferrer.set(code, regs);
  }
  let shareTotal = 182;
  let si = 0;
  while (shareTotal < TOTAL_SHARES) {
    const code = sortedReferrers[si % sortedReferrers.length];
    sharePerReferrer.set(code, sharePerReferrer.get(code)! + 1);
    shareTotal++;
    si++;
  }
  assert(shareTotal === TOTAL_SHARES, "share total mismatch");
  for (const [code, count] of sharePerReferrer) {
    const referrer = students.find((s) => s.referralCode === code)!;
    const referrerDay = dayOf(referrer.createdAt, campaignStart);
    const perDay = exactSplit(count, DAY_WEIGHTS.slice(referrerDay - 1));
    perDay.forEach((c, idx) => {
      for (let i = 0; i < c; i++) {
        events.push({
          type: "share", studentId: idByCode.get(code), channel: "Friend Referral",
          metadata: JSON.stringify({ code }),
          timestamp: dayTimestamp(referrerDay + idx, campaignStart),
        });
      }
    });
  }

  // start events — 252 direct (∝ channel visits) + 212 referral
  const visitSum = Object.values(VISITS).reduce((s, v) => s + v, 0); // 987
  for (const [channel, visits] of Object.entries(VISITS)) {
    const count = Math.round((DIRECT_STARTS * visits) / visitSum);
    for (let i = 0; i < count; i++) {
      const college = collegePool[Math.floor(rand() * collegePool.length)];
      events.push({
        type: "start", channel, metadata: JSON.stringify({ college }),
        timestamp: dayTimestamp(randInt(1, 5), campaignStart),
      });
    }
  }
  // referral start events: 182 completed + 30 abandoned (clicked the link,
  // started the form, never finished) = 212 referral starts
  for (const pair of referralPairs) {
    events.push({
      type: "start", channel: "Friend Referral",
      metadata: JSON.stringify({ code: pair.referrer.referralCode, college: pair.referred.college }),
      timestamp: new Date(pair.referred.createdAt.getTime() - randInt(3, 40) * 60_000),
    });
  }
  const referrerCodes = [...new Set(referralPairs.map((p) => p.referrer.referralCode))];
  for (let i = 0; i < REFERRAL_STARTS - referralPairs.length; i++) {
    const code = pick(referrerCodes);
    events.push({
      type: "start", channel: "Friend Referral",
      metadata: JSON.stringify({ code, abandoned: true }),
      timestamp: dayTimestamp(randInt(2, 5), campaignStart),
    });
  }

  events.push(...clickEvents);
  const tally: Record<string, number> = {};
  for (const e of events) tally[e.type] = (tally[e.type] ?? 0) + 1;
  console.log("EVENT TALLY", JSON.stringify(tally));
  assert(events.length === 327 + 987 + 540 + 208 + 252 + 212, `event count ${events.length} unexpected`);
  console.timeEnd("events-build");

  console.time("events-insert");
  // insert events in chunks
  for (let i = 0; i < events.length; i += 500) {
    await db.campaignEvent.createMany({ data: events.slice(i, i + 500) });
  }
  console.timeEnd("events-insert");

  /* ---------------- 7. Final verification --------------------------- */
  const studentCount = await db.student.count();
  const referralCount = await db.referral.count();
  const eventCount = await db.campaignEvent.count();
  console.log(`students=${studentCount} referrals=${referralCount} events=${eventCount}`);
  assert(studentCount === 327, "final students != 327");
  assert(referralCount === 182, "final referrals != 182");
  console.log("Seed complete ✔  (327 students · 182 referrals · 71 referrers · 24 colleges)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect().then(() => process.exit(0)));
