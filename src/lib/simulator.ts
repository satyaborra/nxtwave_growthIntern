import { PAID_CPA_ESTIMATE } from "@/lib/campaign-config";

/**
 * Transparent, deterministic campaign simulator.
 *
 * Base rates come from the live demo dataset (Day 5 snapshot). Projections
 * use simple, readable formulas — displayed in the UI so the math is
 * auditable. This is a decision-support toy, not a real forecast.
 */

export interface SimulatorInputs {
  whatsappEffort: number; // % of current effort (0–200)
  clubsEffort: number; // % of current effort
  referralEffort: number; // % of current effort
  paidSpend: number; // ₹ remaining budget to deploy (0–1020)
}

export interface SimulatorResult {
  daysRemaining: number;
  currentRegistrations: number;
  organicProjections: { channel: string; base: number; multiplier: number; projected: number }[];
  referralProjected: number;
  paidProjected: number;
  paidCPA: number;
  totalProjected: number;
  targetGap: number; // negative = above target
  hitsTarget: boolean;
}

/** Latest-day base rates per channel (regs/day) from the Day-5 demo snapshot. */
export const BASE_RATES: Record<string, number> = {
  "WhatsApp Group": 11,
  "College Club": 20,
  Email: 6,
  LinkedIn: 5,
};

const REFERRAL_BASE_PER_DAY = 41; // Day-5 referral registrations

export function runSimulation(
  inputs: SimulatorInputs,
  currentRegistrations: number,
  daysRemaining: number
): SimulatorResult {
  const diminishing = (effortPct: number) => Math.pow(Math.max(0, effortPct) / 100, 0.6);

  const organicProjections = (
    [
      ["WhatsApp Group", BASE_RATES["WhatsApp Group"], inputs.whatsappEffort],
      ["College Club", BASE_RATES["College Club"], inputs.clubsEffort],
      ["Email", BASE_RATES["Email"], 100],
      ["LinkedIn (organic)", BASE_RATES["LinkedIn"], 100],
    ] as [string, number, number][]
  ).map(([channel, base, effort]) => ({
    channel,
    base,
    multiplier: effort === 100 ? 1 : Number(diminishing(effort).toFixed(2)),
    projected: Math.round(base * daysRemaining * diminishing(effort)),
  }));

  const organicTotal = organicProjections.reduce((s, o) => s + o.projected, 0);

  // referral loop compounds slightly when effort increases
  const referralMultiplier = Math.pow(Math.max(0, inputs.referralEffort) / 100, 0.7);
  const referralProjected = Math.round(REFERRAL_BASE_PER_DAY * daysRemaining * referralMultiplier);

  const paidProjected = Math.round(inputs.paidSpend / PAID_CPA_ESTIMATE);
  const paidCPA = paidProjected > 0 ? inputs.paidSpend / paidProjected : 0;

  const totalProjected = currentRegistrations + organicTotal + referralProjected + paidProjected;
  const targetGap = 500 - totalProjected;

  return {
    daysRemaining,
    currentRegistrations,
    organicProjections,
    referralProjected,
    paidProjected,
    paidCPA,
    totalProjected,
    targetGap,
    hitsTarget: targetGap <= 0,
  };
}
