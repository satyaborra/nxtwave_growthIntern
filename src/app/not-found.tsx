import Link from "next/link";
import { Zap, SearchX, ArrowLeft } from "lucide-react";

/**
 * Branded 404 for real (non-hash) paths — e.g. /random-page.
 * The in-app hash router has its own view-level not-found state.
 */
export default function NotFound() {
  return (
    <div className="theme-dark flex min-h-screen flex-col bg-[#060918] text-white">
      <header className="flex items-center gap-3 border-b border-white/10 px-4 py-4 sm:px-8">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/30">
          <Zap className="h-4.5 w-4.5 text-white" aria-hidden />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold">NxtWave</p>
          <p className="text-[11px] text-slate-400">AI Workshop Growth Engine</p>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="max-w-md text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
            <SearchX className="h-8 w-8 text-slate-400" aria-hidden />
          </span>
          <p className="mt-6 font-mono text-xs uppercase tracking-widest text-slate-500">
            404 — Page Not Found
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            This page isn&apos;t part of the growth loop
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            The workshop, registration, growth profiles and the admin command
            center all live on the main page. Head back and continue the demo
            from there.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-transform hover:scale-[1.02]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to the workshop
            </Link>
            <Link
              href="/#/admin"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
            >
              Admin command center
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 px-4 py-4 text-center text-[11px] text-slate-500 sm:px-8">
        Growth Challenge demo — campaign data is simulated, not actual results.
      </footer>
    </div>
  );
}
