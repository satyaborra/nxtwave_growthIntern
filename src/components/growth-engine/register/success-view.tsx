"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight, Check, Copy, Gift, Link2, LineChart, Share2, Loader2, MailOpen, PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/growth-engine/shared/site-chrome";
import { navigate } from "@/lib/router";
import { useGrowthStore } from "@/lib/store";
import { absoluteUrl } from "@/lib/router";
import { api } from "@/lib/api";
import { toast } from "sonner";

const CONFETTI_COLORS = ["#60a5fa", "#818cf8", "#34d399", "#fbbf24", "#f472b6", "#22d3ee"];

function Confetti() {
  const [pieces] = useState(() =>
    Array.from({ length: 26 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2.4,
      dur: 3 + Math.random() * 2.4,
      drift: (Math.random() - 0.5) * 160,
      spin: 360 + Math.random() * 540,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      rounded: Math.random() > 0.6,
    }))
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className={`confetti-piece ${p.rounded ? "rounded" : ""}`}
          style={
            {
              "--left": `${p.left}%`,
              "--delay": `${p.delay}s`,
              "--dur": `${p.dur}s`,
              "--drift": `${p.drift}px`,
              "--spin": `${p.spin}deg`,
              "--color": p.color,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function SuccessView() {
  const currentStudent = useGrowthStore((s) => s.currentStudent);
  const setFollowedCode = useGrowthStore((s) => s.setFollowedCode);
  const [copied, setCopied] = useState<"link" | "code" | null>(null);

  useEffect(() => {
    if (!currentStudent) navigate("/register");
  }, [currentStudent]);

  // show the referrer a live preview of the loop this registration created
  const { data: profile } = useQuery({
    queryKey: ["growth", currentStudent?.referralCode],
    queryFn: () => api.growthProfile(currentStudent!.referralCode),
    enabled: !!currentStudent,
  });

  if (!currentStudent) {
    return (
      <div className="theme-dark min-h-screen bg-[#060918]">
        <AppHeader dark />
        <div className="flex flex-1 items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  const referralLink = absoluteUrl(`/#/register?ref=${currentStudent.referralCode}`);
  const shareMessage = `I just registered for "Build Your First AI Project in 60 Minutes" — a free online workshop for engineering students. Reserve your seat with my link: ${referralLink}`;

  const copy = async (text: string, what: "link" | "code") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      toast.success(what === "link" ? "Referral link copied" : "Referral code copied");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("Couldn't access the clipboard — copy it manually.");
    }
  };

  return (
    <div className="theme-dark relative min-h-screen bg-[#060918]">
      <Confetti />
      <div className="relative z-10 flex min-h-screen flex-col">
        <AppHeader dark />
        <div className="relative mx-auto w-full max-w-xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-400/15 ring-1 ring-emerald-400/40 shadow-lg shadow-emerald-500/10"
          >
            <PartyPopper className="h-8 w-8 text-emerald-300" aria-hidden />
          </motion.div>

          <div className="mt-6 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">You&apos;re in! 🎉</h1>
            <p className="mt-3 text-sm text-slate-400 sm:text-base">
              Your seat has been registered
              {profile?.student ? (
                <span className="font-medium text-slate-200">, {profile.student.firstName}</span>
              ) : null}
              . Build-day details for this demo workshop are simulated — the growth loop below is real.
            </p>
          </div>

          {/* Referral code card */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Your Referral Code
            </p>
            <div className="mt-2.5 flex items-center justify-between gap-3 rounded-xl border border-blue-400/25 bg-gradient-to-r from-blue-500/15 to-indigo-500/15 px-4 py-3.5">
              <p className="font-mono text-2xl font-bold tracking-[0.22em] text-white sm:text-3xl">
                {currentStudent.referralCode}
              </p>
              <button
                onClick={() => copy(currentStudent.referralCode, "code")}
                className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Copy referral code"
              >
                {copied === "code" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Your referral link
            </p>
            <div className="mt-2 flex items-center justify-between gap-3 rounded-xl bg-white/[0.05] px-4 py-3 ring-1 ring-white/10">
              <p className="truncate font-mono text-xs text-slate-300">{referralLink}</p>
              <button
                onClick={() => copy(referralLink, "link")}
                className="shrink-0 rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Copy referral link"
              >
                {copied === "link" ? <Check className="h-4 w-4 text-emerald-400" /> : <Link2 className="h-4 w-4" />}
              </button>
            </div>

            <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
              <Button
                className="h-11 gap-2 rounded-xl bg-[#25D366] font-semibold text-[#052e16] shadow-lg shadow-emerald-900/30 hover:bg-[#1fb857]"
                onClick={() =>
                  window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, "_blank", "noopener")
                }
              >
                <Share2 className="h-4 w-4" aria-hidden />
                Share on WhatsApp
              </Button>
              <Button
                variant="outline"
                className="h-11 gap-2 rounded-xl border-white/15 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
                onClick={() => copy(referralLink, "link")}
              >
                {copied === "link" ? <Check className="h-4 w-4 text-emerald-400" /> : <Link2 className="h-4 w-4" />}
                Copy Link
              </Button>
              <Button
                variant="outline"
                className="h-11 gap-2 rounded-xl border-white/15 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
                onClick={() => copy(currentStudent.referralCode, "code")}
              >
                {copied === "code" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                Copy Code
              </Button>
            </div>
          </motion.div>

          {/* Invite your friends */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 ring-1 ring-amber-400/30" aria-hidden>
                <MailOpen className="h-5 w-5 text-amber-300" />
              </span>
              <h2 className="text-sm font-semibold text-white">Invite your friends</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Your referral link helps us measure how students discover the workshop. When a friend
              registers through it, they show up on{" "}
              <button
                className="font-medium text-blue-300 underline-offset-2 hover:underline"
                onClick={() => {
                  setFollowedCode(currentStudent.referralCode);
                  navigate("/growth");
                }}
              >
                your growth profile
              </button>{" "}
              — no rewards, just a visible growth loop for this challenge demo.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Button variant="ghost" className="gap-2 text-slate-300 hover:bg-white/5 hover:text-white" onClick={() => navigate("/")}>
              <Check className="h-4 w-4 text-emerald-400" aria-hidden />
              Back to workshop page
            </Button>
            <Button variant="ghost" className="gap-2 text-slate-400 hover:bg-white/5 hover:text-white" onClick={() => navigate("/admin")}>
              See the campaign command center
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
            <Button variant="ghost" className="gap-2 text-slate-400 hover:bg-white/5 hover:text-white" onClick={() => {
              setFollowedCode(currentStudent.referralCode);
              navigate("/growth");
            }}>
              <LineChart className="h-4 w-4" aria-hidden />
              My Growth Profile
            </Button>
          </motion.div>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-500">
            <Gift className="h-3 w-3" aria-hidden />
            Growth Challenge demo — registration data lives only in this simulation.
          </p>
        </div>
      </div>
    </div>
  );
}
