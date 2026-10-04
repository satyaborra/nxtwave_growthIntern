"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Lightweight hash router. The sandbox gateway only exposes the `/` route,
 * so all product views live behind hash paths: /#/register?ref=CODE etc.
 * The API/data layer is isolated so this can be swapped for real routes later.
 */
export interface HashRoute {
  path: string;
  params: URLSearchParams;
}

function parseHash(): HashRoute {
  const raw = typeof window === "undefined" ? "" : window.location.hash.replace(/^#/, "");
  const [pathPart, queryPart] = raw.split("?");
  const path = pathPart && pathPart.startsWith("/") ? pathPart : "/";
  return { path, params: new URLSearchParams(queryPart ?? "") };
}

export function useHashRoute(): HashRoute {
  const [route, setRoute] = useState<HashRoute>(() => parseHash());

  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash());
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return route;
}

export function navigate(to: string) {
  const target = to.startsWith("#") ? to : `#${to.startsWith("/") ? to : `/${to}`}`;
  if (window.location.hash === target) {
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  } else {
    window.location.hash = target;
  }
}

export function useNavigate() {
  return useCallback((to: string) => navigate(to), []);
}

/** Absolute URL for a hash path, used for shareable referral links.
 *  Accepts "/#/register?ref=X", "#/register?ref=X" or "/register?ref=X"
 *  and always produces "<origin>/#/register?ref=X" (single hash). */
export function absoluteUrl(hashPath: string): string {
  if (typeof window === "undefined") return hashPath;
  const { origin } = window.location;
  const normalized = `/${hashPath.replace(/^[#/]+/, "")}`; // → "/register?ref=X"
  return `${origin}/#${normalized}`;
}
