"use client";

import { useState, useSyncExternalStore } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Zap } from "lucide-react";
import { useHashRoute } from "@/lib/router";
import { LandingView } from "@/components/growth-engine/landing/landing-view";
import { RegisterView } from "@/components/growth-engine/register/register-view";
import { SuccessView } from "@/components/growth-engine/register/success-view";
import { GrowthView } from "@/components/growth-engine/growth/growth-view";
import { AdminView } from "@/components/growth-engine/admin/admin-view";
import { NotFoundView } from "@/components/growth-engine/shared/not-found";

const emptySubscribe = () => () => {};
/** true only after client hydration (server snapshot is false). */
const useHydrated = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

/**
 * Single-page product shell. The sandbox gateway exposes only the `/` route,
 * so product views are hash-routed here (/#/register?ref=CODE, /#/growth,
 * /#/admin). Each view is an isolated component; swapping to real App Router
 * routes later only requires moving these files.
 */
export default function Page() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 15_000, retry: 1, refetchOnWindowFocus: false },
        },
      })
  );
  const route = useHashRoute();
  // Hash routes only exist in the browser — render a stable shell on the
  // server and mount the real view after hydration to avoid mismatches.
  const mounted = useHydrated();

  return (
    <QueryClientProvider client={queryClient}>
      <main className="flex min-h-screen flex-col">
        {mounted ? renderRoute(route.path) : <SplashShell />}
      </main>
    </QueryClientProvider>
  );
}

function SplashShell() {
  return (
    <div className="flex flex-1 items-center justify-center" aria-hidden>
      <div className="flex items-center gap-3 text-muted-foreground">
        <span className="flex h-10 w-10 animate-pulse items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
          <Zap className="h-5 w-5 text-blue-400" />
        </span>
        <span className="text-sm font-medium">Loading Growth Engine…</span>
      </div>
    </div>
  );
}

function renderRoute(path: string) {
  if (path.startsWith("/admin")) return <AdminView path={path} />;
  switch (path) {
    case "/":
      return <LandingView />;
    case "/register":
      return <RegisterView />;
    case "/success":
      return <SuccessView />;
    case "/growth":
      return <GrowthView />;
    default:
      return <NotFoundView path={path} />;
  }
}
