import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Cookie-based, signed rate limit. No database needed — the cookie *is* the
 * counter, validated by HMAC so the client can't extend their own allowance.
 *
 * Limitations (intentional for a demo, callers should know):
 *   - Clearing cookies / incognito = fresh allowance. IP is recorded so a
 *     refresh after a clear from the same IP can be detected, but we don't
 *     have a server-side store to actually enforce it across processes.
 *   - HMAC secret rotation invalidates every outstanding cookie (fine).
 */

const SECRET = process.env.RATELIMIT_SECRET || 'dev-only-secret-change-me';
const WINDOW_MS = 3 * 60 * 60 * 1000;
const LIMIT = 2;

export const RATELIMIT_COOKIE = 'mk_quota';
export const ADMIN_COOKIE = 'mk_admin';

type Quota = { ts: number[]; ip: string };

function b64urlEncode(s: string | Buffer): string {
  return Buffer.from(s).toString('base64url');
}
function b64urlDecode(s: string): string {
  return Buffer.from(s, 'base64url').toString('utf8');
}

function sign(payload: string): string {
  return createHmac('sha256', SECRET).update(payload).digest('base64url');
}

function verify(payload: string, sig: string): boolean {
  const expected = sign(payload);
  if (expected.length !== sig.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  } catch {
    return false;
  }
}

export function encodeQuota(q: Quota): string {
  const body = b64urlEncode(JSON.stringify(q));
  return `${body}.${sign(body)}`;
}

export function decodeQuota(cookie: string | undefined): Quota {
  if (!cookie) return { ts: [], ip: '' };
  const dot = cookie.lastIndexOf('.');
  if (dot < 1) return { ts: [], ip: '' };
  const body = cookie.slice(0, dot);
  const sig = cookie.slice(dot + 1);
  if (!verify(body, sig)) return { ts: [], ip: '' };
  try {
    const obj = JSON.parse(b64urlDecode(body));
    return {
      ts: Array.isArray(obj.ts) ? obj.ts.filter((n: unknown) => typeof n === 'number') : [],
      ip: typeof obj.ip === 'string' ? obj.ip : '',
    };
  } catch {
    return { ts: [], ip: '' };
  }
}

function prune(ts: number[], now = Date.now()): number[] {
  return ts.filter((t) => now - t < WINDOW_MS);
}

export type RateCheck =
  | { ok: true; remainingAfter: number; cookie: string }
  | { ok: false; retryAfterMs: number; resetAt: number };

/** Read-and-record in one shot. Call this AFTER you know the request is going
 *  through so a 5xx upstream doesn't burn a quota slot. */
export function consume(cookieValue: string | undefined, ip: string): RateCheck {
  const now = Date.now();
  const current = decodeQuota(cookieValue);
  // If the IP changed since the cookie was issued, we still respect the
  // timestamps — it's the same browser session, the user just hopped Wi-Fi.
  // Cookie clearing is the only way to reset the count without an admin.
  const pruned = prune(current.ts, now);
  if (pruned.length >= LIMIT) {
    const oldest = Math.min(...pruned);
    const resetAt = oldest + WINDOW_MS;
    return { ok: false, retryAfterMs: Math.max(0, resetAt - now), resetAt };
  }
  const next: Quota = { ts: [...pruned, now].slice(-5), ip };
  return { ok: true, remainingAfter: LIMIT - next.ts.length, cookie: encodeQuota(next) };
}

/** Inspect-only (no write). Useful for status endpoints. */
export function peek(cookieValue: string | undefined): {
  used: number;
  limit: number;
  resetAt: number | null;
} {
  const q = decodeQuota(cookieValue);
  const pruned = prune(q.ts);
  return {
    used: pruned.length,
    limit: LIMIT,
    resetAt: pruned.length ? Math.min(...pruned) + WINDOW_MS : null,
  };
}

// ----------------------------------------------------------------------------
// Admin token
// ----------------------------------------------------------------------------

const ADMIN_EXP_MS = 30 * 24 * 60 * 60 * 1000;

export function makeAdminCookie(): string {
  const body = b64urlEncode(JSON.stringify({ a: 1, exp: Date.now() + ADMIN_EXP_MS }));
  return `${body}.${sign(body)}`;
}

export function isAdmin(cookie: string | undefined): boolean {
  if (!cookie) return false;
  const dot = cookie.lastIndexOf('.');
  if (dot < 1) return false;
  const body = cookie.slice(0, dot);
  const sig = cookie.slice(dot + 1);
  if (!verify(body, sig)) return false;
  try {
    const obj = JSON.parse(b64urlDecode(body));
    return obj.a === 1 && typeof obj.exp === 'number' && obj.exp > Date.now();
  } catch {
    return false;
  }
}

// ----------------------------------------------------------------------------
// Misc helpers
// ----------------------------------------------------------------------------

export function clientIp(req: Request): string {
  const xf = req.headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0].trim();
  return req.headers.get('x-real-ip') || '0.0.0.0';
}
