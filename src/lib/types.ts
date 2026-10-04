/* Shared TypeScript contracts between the API layer and the UI. */

export const BRANCHES = [
  "CSE", "IT", "AI/ML", "Data Science", "ECE", "EEE", "Mechanical", "Civil", "Other",
] as const;

export const YEARS = ["3rd Year", "Final Year"] as const;

export const ACQUISITION_CHANNELS = [
  "WhatsApp Group", "College Club", "Friend Referral", "Instagram", "LinkedIn", "Email", "Other",
] as const;

export type Branch = (typeof BRANCHES)[number];
export type Year = (typeof YEARS)[number];
export type AcquisitionChannel = (typeof ACQUISITION_CHANNELS)[number];

/* ---------------- Registration ---------------- */

export interface RegistrationInput {
  name: string;
  email: string;
  college: string;
  branch: string;
  year: string;
  channel: string;
  refCode?: string;
}

export interface StudentDTO {
  id: string;
  name: string;
  email: string;
  college: string;
  branch: string;
  year: string;
  referralCode: string;
  referredByCode: string | null;
  channel: string;
  createdAt: string;
}

/* ---------------- Campaign summary ---------------- */

export interface CampaignInfo {
  name: string;
  targetRegistrations: number;
  budget: number;
  durationDays: number;
  startDate: string;
  endDate: string;
  currentDay: number;
}

export interface Kpis {
  registrations: number;
  target: number;
  progressPct: number;
  remaining: number;
  referralRegistrations: number;
  referralSharePct: number;
  collegesReached: number;
  activeReferrers: number;
  conversionRatePct: number;
  visits: number;
  starts: number;
  avgPacePerDay: number;
  latestDay: number;
  latestDayRegistrations: number;
  requiredPacePerDay: number;
  projectedFinal: number;
  daysRemaining: number;
}

export interface DailyPoint {
  day: number;
  label: string;
  registrations: number;
  cumulative: number;
  targetCumulative: number;
  targetPerDay: number;
  growthRatePct: number | null;
  isActual: boolean;
}

export interface ChannelStat {
  channel: string;
  type: "organic" | "paid";
  registrations: number;
  sharePct: number;
  visits: number;
  conversionPct: number;
  spend: number;
  plannedSpend: number;
  costPerReg: number | null;
  trendPct: number | null;
}

export interface BudgetStat {
  total: number;
  paidExperiment: number;
  contingency: number;
  spent: number;
  remaining: number;
  paidSpend: number;
  paidRegs: number;
  costPerRegPaid: number;
  costPerRegBlended: number;
  organicRegs: number;
  organicSharePct: number;
}

export interface CollegeStat {
  college: string;
  registrations: number;
  referrals: number;
  visits: number;
  conversionPct: number;
  primaryChannel: string;
  trendPct: number | null;
  lastTwoDays: number;
  prevTwoDays: number;
}

export interface LeaderboardRow {
  rank: number;
  studentId: string;
  maskedName: string;
  college: string;
  referrals: number;
  clicks: number;
  conversionPct: number;
}

export interface FunnelStage {
  key: string;
  label: string;
  value: number;
  prevValue: number | null;
  convPct: number | null;
  stage: "acquisition" | "loop";
  hint?: string;
}

export interface CampaignSummary {
  demo: { label: string; generatedAt: string };
  campaign: CampaignInfo;
  kpis: Kpis;
  daily: DailyPoint[];
  channels: ChannelStat[];
  budget: BudgetStat;
  colleges: CollegeStat[];
  leaderboard: LeaderboardRow[];
  funnel: FunnelStage[];
  branches: { branch: string; count: number }[];
}

/* ---------------- Insights ---------------- */

export type InsightSeverity = "positive" | "neutral" | "warning";

export interface GrowthInsight {
  id: string;
  title: string;
  body: string;
  severity: InsightSeverity;
  metric: string;
}

export interface Recommendation {
  type: "double-down" | "test" | "watch";
  title: string;
  body: string;
  metricLabel: string;
  metricValue: string;
}

export interface InsightsPayload {
  label: string;
  generatedAt: string;
  insights: GrowthInsight[];
  recommendations: Recommendation[];
}

/* ---------------- Growth profile ---------------- */

export interface GrowthProfile {
  student: {
    name: string;
    firstName: string;
    college: string;
    branch: string;
    year: string;
    referralCode: string;
    createdAt: string;
    channel: string;
  };
  stats: {
    registrations: number;
    clicks: number;
    shares: number;
    conversionPct: number | null;
    leaderboardRank: number | null;
    totalReferrers: number;
    collegeRegistrations: number;
  };
  funnel: { shared: number; clicked: number; registered: number };
  timeline: { type: string; label: string; detail: string; at: string }[];
}

/* ---------------- Registrations table ---------------- */

export interface RegistrationsResponse {
  students: (StudentDTO & { day: number })[];
  total: number;
}

export const maskName = (name: string, index: number): string => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const first = letters[index % 26];
  const second = index >= 26 ? letters[Math.floor(index / 26) - 1] : "";
  return `Student ${first}${second}`;
};
