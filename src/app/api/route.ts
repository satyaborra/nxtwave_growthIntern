import { NextResponse } from "next/server";

/**
 * Health check — handy for post-deploy verification (PHASE 28-29 of the
 * pre-deployment checklist) and uptime monitors.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "nxtwave-ai-workshop-growth-engine",
    mode: "demo-simulation",
    endpoints: [
      "POST /api/register",
      "GET /api/campaign",
      "GET /api/insights",
      "GET /api/students",
      "GET /api/student?code=CODE",
      "POST /api/demo/reset",
    ],
  });
}
