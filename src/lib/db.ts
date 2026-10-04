import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

/**
 * Runtime-safe SQLite resolution.
 *
 * Local (dev or standalone production): use the bundled, pre-seeded demo
 * database at db/custom.db so the app works right after clone — no seed step
 * required for evaluation.
 *
 * Serverless (Vercel): the deployment filesystem is read-only, so we
 * materialize a writable copy of the pristine seeded database in /tmp on
 * cold start. Every cold start re-copies the snapshot, which means the
 * simulated campaign self-resets — exactly the behaviour a demo/simulation
 * should have in production (see README → "Demo data on Vercel").
 */
function isWritable(dir: string): boolean {
  try {
    fs.accessSync(dir, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

function findBundledDatabase(): string | null {
  const candidates = [
    path.join(process.cwd(), "db", "custom.db"),
    path.join(process.cwd(), "..", "db", "custom.db"),
    path.join(process.cwd(), "..", "..", "db", "custom.db"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function resolveDatabaseUrl(): string {
  // Explicit configuration always wins (e.g. DATABASE_URL pointing at a
  // hosted Postgres/SQLite replica on Vercel).
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const bundled = findBundledDatabase();
  if (!bundled) {
    // Fall back to Prisma's own resolution (schema-relative) so local CLI
    // workflows keep working even without the bundled snapshot.
    return "file:../db/custom.db";
  }

  const dirWritable = isWritable(path.dirname(bundled));
  const serverless =
    process.env.VERCEL === "1" ||
    !!process.env.AWS_LAMBDA_FUNCTION_NAME ||
    !dirWritable;

  if (!serverless) {
    // Absolute file URL — normalized to forward slashes for Prisma.
    return `file:${bundled.split(path.sep).join("/")}`;
  }

  const target = path.join("/tmp", "nxtwave-growth-engine.db");
  try {
    fs.copyFileSync(bundled, target);
  } catch {
    // If the copy fails (e.g. a previous copy already exists and is fine),
    // fall through and try to use whatever is at the target.
  }
  return `file:${target.split(path.sep).join("/")}`;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: resolveDatabaseUrl() } },
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
