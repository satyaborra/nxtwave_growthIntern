"use client";

import type {
  CampaignSummary,
  GrowthProfile,
  InsightsPayload,
  RegistrationInput,
  RegistrationsResponse,
  StudentDTO,
} from "@/lib/types";

/**
 * Thin client for the Growth Engine API. Every call goes through this
 * service so the transport can be swapped (e.g. for a real backend)
 * without touching UI code.
 */

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (body as { error?: string }).error ?? `Request failed (${res.status})`;
    const err = new Error(message) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return body as T;
}

export const api = {
  register: (input: RegistrationInput) =>
    request<{ student: StudentDTO }>("/api/register", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  campaign: () => request<CampaignSummary>("/api/campaign"),

  insights: () => request<InsightsPayload>("/api/insights"),

  students: (params: URLSearchParams) =>
    request<RegistrationsResponse>(`/api/students?${params.toString()}`),

  growthProfile: (code: string) =>
    request<GrowthProfile>(`/api/student?code=${encodeURIComponent(code)}`),

  resetDemo: () => request<{ ok: true }>("/api/demo/reset", { method: "POST" }),
};
