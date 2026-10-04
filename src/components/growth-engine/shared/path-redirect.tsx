"use client";

import { useEffect } from "react";

/**
 * Real-path → hash-route bridge.
 *
 * The app is a single-page shell served from `/`, so product views live
 * behind hash routes (/#/register?ref=CODE). Evaluators and shared links,
 * however, use natural paths like /register?ref=CODE — this component
 * forwards any real path (and its query string / sub-path) to the matching
 * hash route, client-side, preserving everything after the base segment.
 */
export function HashPathRedirect({ base }: { base: string }) {
  useEffect(() => {
    const { pathname, search } = window.location;
    const rest = pathname
      .replace(new RegExp(`^${base}(?=/|$)`), "")
      .replace(/\/+$/, "");
    window.location.replace(`/#${base}${rest}${search}`);
  }, [base]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060918] text-slate-300">
      <div className="text-center">
        <p className="text-sm">Taking you there…</p>
        <noscript>
          <p className="mt-2 text-xs text-slate-500">
            JavaScript is disabled — open <code>/{base.replace(/^\//, "")}</code> directly.
          </p>
        </noscript>
      </div>
    </div>
  );
}
