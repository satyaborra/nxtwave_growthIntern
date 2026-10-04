"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/* ---------------- CountUp ---------------- */
export function CountUp({
  value,
  decimals = 0,
  suffix = "",
  prefix = "",
  duration = 900,
  className,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-24px" });
  const [display, setDisplay] = useState(0);
  const previous = useRef(0);

  useEffect(() => {
    if (!inView) return;
    const from = previous.current;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (value - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else previous.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  const formatted = display.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

/* ---------------- ProgressRing ---------------- */
export function ProgressRing({
  value,
  size = 168,
  stroke = 12,
  label,
  sublabel,
  accent = "hsl(217 91% 60%)",
}: {
  value: number; // 0-100
  size?: number;
  stroke?: number;
  label?: ReactNode;
  sublabel?: ReactNode;
  accent?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, value));
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(clamped), 80);
    return () => clearTimeout(t);
  }, [clamped]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="oklch(0.26 0.032 261 / 8%)" strokeWidth={stroke}
          className="hidden dark:block"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="oklch(1 0 0 / 8%)" strokeWidth={stroke}
          className="dark:hidden"
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={accent}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (animated / 100) * circumference }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(0 0 8px ${accent}55)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="text-2xl font-semibold tracking-tight">{label}</div>
        {sublabel ? <div className="mt-0.5 text-xs text-muted-foreground">{sublabel}</div> : null}
      </div>
    </div>
  );
}

/* ---------------- TrendBadge ---------------- */
export function TrendBadge({ value, suffix = "%" }: { value: number | null; suffix?: string }) {
  if (value === null || Number.isNaN(value)) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" /> flat
      </span>
    );
  }
  const up = value > 0.5;
  const down = value < -0.5;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        up && "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-400",
        down && "bg-red-100 text-red-700 dark:bg-red-500/12 dark:text-red-400",
        !up && !down && "bg-muted text-muted-foreground"
      )}
    >
      {up ? <ArrowUpRight className="h-3 w-3" /> : down ? <ArrowDownRight className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
      {Math.abs(value).toFixed(1)}
      {suffix}
    </span>
  );
}

/* ---------------- DemoBadge (theme-adaptive via dark: variants) ---------------- */
export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-amber-500/35 bg-amber-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-700",
        "dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300",
        className
      )}
      title="All campaign numbers in this product are simulated for the growth challenge"
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-60 dark:bg-amber-400" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
      </span>
      Demo Mode
    </span>
  );
}

/* ---------------- SectionHeading ---------------- */
export function SectionHeading({
  eyebrow,
  title,
  description,
  right,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="space-y-1.5">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">{eyebrow}</p>
        ) : null}
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
        {description ? <p className="max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {right}
    </div>
  );
}

/* ---------------- EmptyState ---------------- */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 px-6 py-12 text-center">
      {icon ? <div className="mb-3 rounded-full bg-muted p-3 text-muted-foreground">{icon}</div> : null}
      <p className="text-sm font-medium">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

/* ---------------- StatCard (showcase style: pastel icon disc + big value) --------------- */
export type StatTone = "blue" | "emerald" | "violet" | "cyan" | "amber" | "pink" | "rose" | "indigo";

const TONE_CLASSES: Record<StatTone, string> = {
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
  emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  violet: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
  cyan: "bg-cyan-100 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  pink: "bg-pink-100 text-pink-600 dark:bg-pink-500/15 dark:text-pink-400",
  rose: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400",
  indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
};

export function StatCard({
  label,
  value,
  sub,
  icon,
  tone = "blue",
  accentClass,
  loading,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
  tone?: StatTone;
  /** @deprecated pass tone instead */
  accentClass?: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-5 shadow-soft">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 h-8 w-32" />
        <Skeleton className="mt-2 h-3 w-20" />
      </div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="card-hover rounded-xl border bg-card p-5 shadow-soft"
    >
      <div className="flex items-center gap-2.5">
        {icon ? (
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
              accentClass ?? TONE_CLASSES[tone]
            )}
            aria-hidden
          >
            {icon}
          </span>
        ) : null}
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <div className="mt-3 text-[26px] font-semibold leading-none tracking-tight tabular-nums sm:text-[28px]">{value}</div>
      {sub ? <div className="mt-1.5 text-xs text-muted-foreground">{sub}</div> : null}
    </motion.div>
  );
}

/* ---------------- SimulatedLabel ---------------- */
export function SimulatedLabel({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <p className={cn("text-[11px] italic text-muted-foreground", className)}>
      {children ?? "Simulated campaign data — not actual results."}
    </p>
  );
}

/* ---------------- FadeIn wrapper ---------------- */
export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
