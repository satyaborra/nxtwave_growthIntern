"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight, BrainCircuit, Check, ChevronRight, Clock, FlaskConical, GraduationCap,
  Handshake, LineChart, Megaphone, Mic, MonitorPlay, Rocket, Send, Share2, Sparkles,
  Target, UserPlus, Users, Wand2, Zap, Lightbulb, Scale, PlayCircle, Cpu, WandSparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { navigate } from "@/lib/router";
import { SiteNav, SiteFooter } from "@/components/growth-engine/shared/site-chrome";
import {
  CountUp, DemoBadge, FadeIn, ProgressRing, SectionHeading, SimulatedLabel,
} from "@/components/growth-engine/shared/primitives";

export function LandingView() {
  const { data } = useQuery({ queryKey: ["campaign"], queryFn: api.campaign });

  return (
    <div id="top" className="theme-dark min-h-screen bg-[#060918] text-foreground">
      <div className="flex min-h-screen flex-col">
        <SiteNav variant="hero" />
        <div className="flex-1">
          <Hero />
          <LiveCampaignTeaser
            registrations={data?.kpis.registrations}
            progressPct={data?.kpis.progressPct}
            colleges={data?.kpis.collegesReached}
            refShare={data?.kpis.referralSharePct}
          />
          <WhatYoullBuild />
          <HowItWorks />
          <WhyThisWorkshop />
          <WhyIBuiltThis />
          <HumanJudgmentSection />
          <FinalCta />
        </div>
        <SiteFooter />
      </div>
    </div>
  );
}

/* ---------------------------------- Hero --------------------------------- */
function Hero() {
  const chips = [
    { icon: FlaskConical, label: "Hands-on AI project" },
    { icon: Wand2, label: "Beginner-friendly" },
    { icon: GraduationCap, label: "For engineering students" },
    { icon: MonitorPlay, label: "Live online workshop" },
  ];
  const steps = [
    { n: 1, tone: "bg-blue-500 shadow-blue-500/40", title: "Register", sub: "Reserve your free seat", action: () => navigate("/register") },
    { n: 2, tone: "bg-violet-500 shadow-violet-500/40", title: "Build", sub: "Create a real AI project", action: () => document.getElementById("what-youll-build")?.scrollIntoView({ behavior: "smooth" }) },
    { n: 3, tone: "bg-emerald-500 shadow-emerald-500/40", title: "Share", sub: "Invite friends and grow together", action: () => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" }) },
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="aurora absolute inset-0" aria-hidden />
      <div className="grid-pattern absolute inset-0" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 sm:pt-16 lg:pb-20">
        <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr]">
          {/* Copy */}
          <div>
            <FadeIn className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-200">
                <Zap className="h-3 w-3" aria-hidden /> Free online workshop
              </span>
              <DemoBadge />
            </FadeIn>

            <FadeIn delay={0.05}>
              <h1 className="mt-6 text-[38px] font-bold leading-[1.08] tracking-tight text-white sm:text-[52px] xl:text-[62px]">
                Build Your First
                <br />
                <span className="text-gradient-hero sm:whitespace-nowrap">AI Project in 60 Minutes</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.1}>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-400 sm:text-lg">
                Stop watching AI tutorials.{" "}
                <span className="font-medium text-slate-200">Build something real.</span>
              </p>
            </FadeIn>

            <FadeIn delay={0.14}>
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2.5">
                {chips.map((chip) => (
                  <li key={chip.label} className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/15 ring-1 ring-blue-400/25" aria-hidden>
                      <chip.icon className="h-3.5 w-3.5 text-blue-300" />
                    </span>
                    {chip.label}
                  </li>
                ))}
              </ul>
            </FadeIn>

            <FadeIn delay={0.18} className="mt-9 flex flex-wrap items-center gap-3.5">
              <Button
                size="lg"
                onClick={() => navigate("/register")}
                className="group h-12 gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-7 text-base font-semibold shadow-xl shadow-blue-600/30 transition-all hover:shadow-blue-500/40 hover:brightness-110"
              >
                Reserve My Free Seat
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                className="h-12 gap-2 rounded-xl border-white/15 bg-white/5 px-6 text-base text-slate-200 backdrop-blur hover:bg-white/10 hover:text-white"
              >
                <PlayCircle className="h-4 w-4" aria-hidden />
                How It Works
              </Button>
            </FadeIn>
          </div>

          {/* Laptop mockup */}
          <FadeIn delay={0.15} className="relative">
            <LaptopMockup />
          </FadeIn>
        </div>

        {/* Step cards */}
        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {steps.map((s, i) => (
            <FadeIn key={s.n} delay={0.05 * i}>
              <button
                onClick={s.action}
                className="group flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left backdrop-blur transition-all hover:border-blue-400/30 hover:bg-white/[0.07]"
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white shadow-lg ${s.tone}`}
                  aria-hidden
                >
                  {s.n}
                </span>
                <span>
                  <span className="flex items-center gap-1.5 text-base font-semibold text-white">
                    {s.title}
                    <ChevronRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-300" aria-hidden />
                  </span>
                  <span className="mt-0.5 block text-sm text-slate-400">{s.sub}</span>
                </span>
              </button>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Laptop mockup ------------------------------ */
function LaptopMockup() {
  const steps = [
    { icon: WandSparkles, label: "Prompt", note: "Describe your idea", state: "done" },
    { icon: Sparkles, label: "Generate", note: "AI drafts the plan", state: "done" },
    { icon: Cpu, label: "Build", note: "Assemble the project", state: "active" },
    { icon: PlayCircle, label: "Run", note: "See it work live", state: "todo" },
  ] as const;

  return (
    <div className="relative mx-auto w-full max-w-[540px]">
      {/* glow */}
      <div
        className="absolute -inset-12 rounded-full opacity-70 blur-2xl"
        style={{
          background:
            "radial-gradient(closest-side, oklch(0.62 0.2 262 / 22%), transparent 70%), radial-gradient(closest-side at 70% 65%, oklch(0.6 0.2 296 / 16%), transparent 72%)",
        }}
        aria-hidden
      />
      {/* orbit ring */}
      <div className="animate-spin-slow absolute -inset-7 rounded-full border border-dashed border-blue-400/20 sm:-inset-9" aria-hidden />

      {/* floating chip — top right (hidden on xs so the laptop stays clean) */}
      <div className="glass animate-float absolute -right-2 -top-9 z-10 hidden rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-200 shadow-xl sm:-right-7 sm:block">
        <span className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/20" aria-hidden>
            <Sparkles className="h-3.5 w-3.5 text-blue-300" />
          </span>
          From idea to AI project
          <span className="font-semibold text-white">in 60 minutes</span>
        </span>
      </div>

      {/* laptop */}
      <div className="relative">
        <div className="rounded-t-2xl border border-white/10 bg-[#0c1230] p-2 pb-0 shadow-2xl shadow-blue-950/70 sm:p-2.5 sm:pb-0">
          <div className="overflow-hidden rounded-t-xl bg-[#080d24] ring-1 ring-white/10">
            {/* screen header */}
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
              <span className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-indigo-600" aria-hidden>
                  <Zap className="h-3 w-3 text-white" />
                </span>
                <span className="text-xs font-semibold text-white">NxtWave AI</span>
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-400/25">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" aria-hidden />
                LIVE BUILD
              </span>
            </div>

            {/* chat body */}
            <div className="space-y-3 px-4 py-4 text-left">
              <div className="flex justify-end">
                <p className="max-w-[80%] rounded-2xl rounded-br-sm bg-blue-600 px-3.5 py-2 text-xs text-white shadow-lg shadow-blue-900/40">
                  Build my first AI project 🚀
                </p>
              </div>

              <div className="rounded-2xl rounded-bl-sm bg-white/[0.05] p-3 ring-1 ring-white/10">
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Building your first AI project…
                </p>
                <ul className="space-y-2">
                  {steps.map((s) => (
                    <li key={s.label} className="flex items-center gap-2.5">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-md ${
                          s.state === "done"
                            ? "bg-emerald-400/15 text-emerald-300"
                            : s.state === "active"
                              ? "bg-blue-500/25 text-blue-200 ring-1 ring-blue-400/40"
                              : "bg-white/5 text-slate-500"
                        }`}
                        aria-hidden
                      >
                        {s.state === "done" ? <Check className="h-3.5 w-3.5" /> : <s.icon className="h-3.5 w-3.5" />}
                      </span>
                      <span className={`text-xs font-medium ${s.state === "todo" ? "text-slate-500" : "text-slate-200"}`}>
                        {s.label}
                      </span>
                      <span className="text-[11px] text-slate-500">· {s.note}</span>
                      {s.state === "active" ? (
                        <span className="ml-auto flex gap-1" aria-hidden>
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400 [animation-delay:150ms]" />
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400 [animation-delay:300ms]" />
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
                {/* progress */}
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[64%] rounded-full bg-gradient-to-r from-blue-500 to-violet-500" />
                </div>
              </div>
            </div>

            {/* input bar */}
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between rounded-xl bg-white/[0.06] px-3.5 py-2.5 ring-1 ring-white/10">
                <span className="text-xs text-slate-500">Ask AI to build anything…</span>
                <span className="flex items-center gap-2 text-slate-500" aria-hidden>
                  <Mic className="h-3.5 w-3.5" />
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                    <Send className="h-3 w-3 text-white" />
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* base */}
        <div className="relative mx-auto h-3 w-[calc(100%+56px)] -translate-x-7 rounded-b-2xl rounded-t-[3px] bg-gradient-to-b from-slate-500/80 via-slate-700 to-slate-800 ring-1 ring-white/10 sm:h-4">
          <span className="absolute left-1/2 top-0 h-1.5 w-24 -translate-x-1/2 rounded-b-lg bg-black/40" aria-hidden />
        </div>
      </div>

      {/* floating chip — bottom left */}
      <div className="glass animate-float-late absolute -bottom-5 left-2 z-10 max-w-[88%] rounded-xl px-3.5 py-2.5 shadow-xl sm:-left-7 sm:max-w-none">
        <span className="flex items-center gap-2 text-xs font-medium text-slate-200">
          <span className="text-base" aria-hidden>🤖</span>
          Your AI build buddy — no experience needed
        </span>
      </div>
    </div>
  );
}

/* --------------------------- Live campaign teaser ------------------------- */
function LiveCampaignTeaser({
  registrations,
  progressPct,
  colleges,
  refShare,
}: {
  registrations?: number;
  progressPct?: number;
  colleges?: number;
  refShare?: number;
}) {
  return (
    <section aria-labelledby="live-campaign" className="border-y border-white/5 bg-white/[0.02]">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[auto_1fr] lg:py-14">
        <div className="flex justify-center">
          <ProgressRing
            value={progressPct ?? 0}
            label={registrations !== undefined ? <CountUp value={registrations} /> : <span className="inline-block h-8 w-16 animate-pulse rounded bg-muted" />}
            sublabel={`of 500 seats · ${(progressPct ?? 0).toFixed(1)}%`}
          />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">Demo campaign · live engine</p>
          <h2 id="live-campaign" className="mt-2 text-2xl font-semibold tracking-tight text-white">
            One growth loop, measured end-to-end
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
            This page is the front door of a full growth system. Behind it, every registration gets
            a referral code, every share is attributed, and a command-center dashboard tracks
            progress toward <span className="text-white">500 final-year engineering students</span> in
            7 days on a ₹2,000 budget. {colleges !== undefined ? <><CountUp value={colleges} /> colleges</> : "Colleges"} and{" "}
            {refShare !== undefined ? <><CountUp value={refShare} decimals={1} suffix="%" /> referral share</> : "referral share"} already modeled.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Button variant="outline" size="sm" className="gap-2 border-white/15 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white" onClick={() => navigate("/admin")}>
              <LineChart className="h-4 w-4" aria-hidden />
              Open Growth Command Center
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-slate-300 hover:bg-white/5 hover:text-white" onClick={() => navigate("/growth")}>
              <UserPlus className="h-4 w-4" aria-hidden />
              See a student growth profile
            </Button>
          </div>
          <SimulatedLabel className="mt-4" />
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- What you'll build -------------------------- */
function WhatYoullBuild() {
  const items = [
    {
      icon: <Lightbulb className="h-5 w-5" />,
      title: "An AI project idea",
      body: "Pick a simple, real problem worth solving and scope it down to something you can finish in the session.",
      accent: "text-amber-300 bg-amber-400/10",
    },
    {
      icon: <FlaskConical className="h-5 w-5" />,
      title: "A working prototype",
      body: "Build it live, step by step — no slides-only theory. You leave with something that runs, not just notes.",
      accent: "text-blue-300 bg-blue-400/10",
    },
    {
      icon: <BrainCircuit className="h-5 w-5" />,
      title: "The basic AI workflow",
      body: "Understand the pattern behind the project: input → AI step → output — the same shape as most real AI products.",
      accent: "text-violet-300 bg-violet-400/10",
    },
    {
      icon: <ArrowRight className="h-5 w-5" />,
      title: "Next steps to continue",
      body: "Know what you would build next, so the project doesn't end when the session does.",
      accent: "text-emerald-300 bg-emerald-400/10",
    },
  ];
  return (
    <section id="what-youll-build" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 lg:py-20">
      <SectionHeading
        eyebrow="What you'll build"
        title="60 minutes. One real AI project."
        description="Not a demo you watch — a project you build. Here is exactly what the session covers, nothing more, nothing less."
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <FadeIn key={item.title} delay={i * 0.06}>
            <div className="card-hover h-full rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <span className={`inline-flex rounded-lg p-2.5 ${item.accent}`} aria-hidden>{item.icon}</span>
              <h3 className="mt-4 text-sm font-semibold text-white">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{item.body}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------- How it works ---------------------------- */
function HowItWorks() {
  const steps = [
    {
      icon: <Rocket className="h-5 w-5" />,
      step: "Step 1",
      title: "Register free",
      body: "Reserve your seat in under a minute. You instantly get a personal referral code so your friends can join with you.",
      accent: "text-blue-300 bg-blue-400/10",
    },
    {
      icon: <FlaskConical className="h-5 w-5" />,
      step: "Step 2",
      title: "Build in the session",
      body: "Follow along and build your first AI project in 60 minutes — beginner-friendly, hands-on, no prior AI experience needed.",
      accent: "text-violet-300 bg-violet-400/10",
    },
    {
      icon: <Share2 className="h-5 w-5" />,
      step: "Step 3",
      title: "Share with your circle",
      body: "Pass your referral link to friends and your college groups. It helps us measure how students discover the workshop — and helps your friends not miss out.",
      accent: "text-emerald-300 bg-emerald-400/10",
    },
  ];
  return (
    <section id="how-it-works" className="scroll-mt-20 border-y border-white/5 bg-white/[0.02]">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <SectionHeading
          eyebrow="How it works"
          title="Register → Build → Share"
          description="Three steps. The loop is the point: every student who joins makes it easier for the next one to hear about it."
        />
        <div className="relative mt-10 grid gap-6 md:grid-cols-3">
          <div className="absolute left-0 right-0 top-7 hidden border-t border-dashed border-white/10 md:block" aria-hidden />
          {steps.map((s, i) => (
            <FadeIn key={s.title} delay={i * 0.08} className="relative">
              <div className="h-full rounded-xl border border-white/10 bg-white/[0.04] p-6">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex rounded-lg p-2.5 ${s.accent}`} aria-hidden>{s.icon}</span>
                  <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {s.step}
                  </span>
                </div>
                <h3 className="mt-4 font-semibold text-white">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{s.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Why this workshop ------------------------- */
function WhyThisWorkshop() {
  const cards = [
    {
      icon: <FlaskConical className="h-5 w-5 text-blue-300" />,
      title: "Build",
      body: "Create a practical AI project — something you can open, run and show.",
    },
    {
      icon: <BrainCircuit className="h-5 w-5 text-violet-300" />,
      title: "Learn",
      body: "Understand the workflow behind it, so the second project is yours to design.",
    },
    {
      icon: <ArrowRight className="h-5 w-5 text-emerald-300" />,
      title: "Continue",
      body: "Leave with a foundation you can extend on your own, at your own pace.",
    },
  ];
  return (
    <section id="why-this-workshop" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 lg:py-20">
      <SectionHeading
        eyebrow="Why attend?"
        title="Because watching another AI tutorial isn't the same as building."
        description="Most students don't need another video. They need one focused hour, a clear starting point, and a finished first project."
      />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {cards.map((c, i) => (
          <FadeIn key={c.title} delay={i * 0.06}>
            <div className="card-hover h-full rounded-xl border border-white/10 bg-white/[0.04] p-6">
              <span className="inline-flex rounded-lg bg-white/5 p-2.5" aria-hidden>{c.icon}</span>
              <h3 className="mt-4 font-semibold text-white">{c.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{c.body}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------- Why I built this ------------------------ */
function WhyIBuiltThis() {
  return (
    <section id="why-i-built-this" className="border-y border-white/5 bg-white/[0.02]">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <SectionHeading eyebrow="Why this asset?" title="Why I built this" />
        <FadeIn>
          <blockquote className="mt-6 max-w-4xl rounded-xl border-l-2 border-blue-400/60 bg-white/[0.03] p-6 text-base leading-relaxed text-slate-300 sm:text-lg">
            Instead of building another static landing page, I built a growth engine that connects
            acquisition, referrals, attribution and measurement. The goal is to demonstrate not just
            how students could register, but how the campaign could be{" "}
            <span className="font-medium text-white">measured and optimized</span> toward the
            500-registration target.
          </blockquote>
        </FadeIn>
        <div className="mt-6 grid gap-3 text-sm text-slate-400 sm:grid-cols-3">
          <p className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <span className="font-medium text-white">Not a claim.</span> The registration numbers
            on the dashboard are simulated demo data — the target of 500 is the assignment brief,
            not a result.
          </p>
          <p className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <span className="font-medium text-white">A system, not a page.</span> Landing page,
            referral codes, WhatsApp sharing, attribution and analytics work as one loop.
          </p>
          <p className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <span className="font-medium text-white">Decision-ready.</span> Channels, colleges,
            budget and pacing are broken out so strategy can be adjusted mid-campaign.
          </p>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Human Judgment × AI -------------------------- */
function HumanJudgmentSection() {
  const decisions = [
    {
      icon: <Megaphone className="h-5 w-5 text-amber-300" />,
      aiSaid: "Focus heavily on paid advertising to hit 500 registrations fast.",
      iDecided:
        "Prioritize college communities, WhatsApp distribution and referrals — the target audience is concentrated there and the budget is only ₹2,000. Paid stays a small, measured experiment.",
    },
    {
      icon: <Target className="h-5 w-5 text-blue-300" />,
      aiSaid: "Build a landing page for the workshop.",
      iDecided:
        "Build a referral and growth tracker instead — the assignment asks for a working asset that supports acquisition, and measurement is what makes a campaign improvable.",
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
      <SectionHeading
        eyebrow="Human judgment × AI"
        title="Where I overruled the AI — and why"
        description="AI accelerated the build; the strategy calls stayed human. Example decision log from working on this challenge."
      />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {decisions.map((d, i) => (
          <FadeIn key={i} delay={i * 0.08}>
            <div className="h-full rounded-xl border border-white/10 bg-white/[0.04] p-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Wand2 className="h-3.5 w-3.5" aria-hidden /> AI suggested
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{d.aiSaid}</p>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-300">
                <Handshake className="h-3.5 w-3.5" aria-hidden /> My decision
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">{d.iDecided}</p>
            </div>
          </FadeIn>
        ))}
      </div>
      <p className="mt-4 text-[11px] italic text-slate-500">
        Example decision log — illustrative of how AI suggestions were weighed during this challenge.
      </p>
    </section>
  );
}

/* --------------------------------- Final CTA ------------------------------ */
function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-white/5">
      <div className="aurora absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <FadeIn>
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Your first AI project is <span className="text-gradient-hero">60 minutes</span> away
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-slate-400 sm:text-base">
            Reserve a free seat, tell a friend, and come build. That&apos;s the whole loop.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={() => navigate("/register")}
              className="h-12 gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-7 text-base font-semibold shadow-xl shadow-blue-600/30 hover:brightness-110"
            >
              <Rocket className="h-4 w-4" aria-hidden />
              Reserve My Free Seat
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 gap-2 rounded-xl border-white/15 bg-white/5 text-base text-slate-200 hover:bg-white/10 hover:text-white"
              onClick={() => navigate("/admin")}
            >
              <LineChart className="h-4 w-4" aria-hidden />
              View the Growth Dashboard
            </Button>
          </div>
          <SimulatedLabel className="mt-6 justify-center text-center" />
        </FadeIn>
      </div>
    </section>
  );
}
