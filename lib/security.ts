import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

function clientKey(request: NextRequest, scope: string): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = request.headers.get("x-real-ip") || forwarded || "unknown";
  return `${scope}:${createHash("sha256").update(address).digest("hex")}`;
}

export function enforceRateLimit(
  request: NextRequest,
  scope: string,
  limit = 60,
  windowMs = 60_000,
): NextResponse | null {
  const now = Date.now();
  const key = clientKey(request, scope);
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    if (buckets.size >= MAX_BUCKETS) {
      for (const [candidate, bucket] of buckets) {
        if (bucket.resetAt <= now || buckets.size >= MAX_BUCKETS) buckets.delete(candidate);
        if (buckets.size < MAX_BUCKETS) break;
      }
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  current.count += 1;
  if (current.count <= limit) return null;

  return NextResponse.json(
    { success: false, error: "Too many requests" },
    {
      status: 429,
      headers: { "Retry-After": String(Math.max(1, Math.ceil((current.resetAt - now) / 1000))) },
    },
  );
}

export function mayForceRefresh(request: NextRequest): boolean {
  const configured = process.env.CACHE_REFRESH_TOKEN;
  const provided = request.headers.get("x-cache-refresh-token");
  if (!configured || !provided) return false;

  const expected = Buffer.from(configured);
  const actual = Buffer.from(provided);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function boundedInteger(value: string | null, fallback: number, min: number, max: number): number {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
}

export function boundedText(value: string | null, maxLength = 200): string | null {
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= maxLength ? trimmed : null;
}
