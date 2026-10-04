/** Formatting helpers (Indian numbering for ₹). */

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const inr1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

export const fmtNum = (n: number): string => inr.format(Math.round(n));
export const fmtPct = (n: number, digits = 1): string => `${n.toFixed(digits)}%`;
export const fmtINR = (n: number): string => `₹${inr.format(Math.round(n))}`;
export const fmtINR1 = (n: number): string => `₹${inr1.format(n)}`;

export const dayLabel = (day: number): string => `Day ${day}`;

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
