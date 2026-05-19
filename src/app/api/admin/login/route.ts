import { NextRequest, NextResponse } from 'next/server';
import { makeAdminCookie, ADMIN_COOKIE } from '@/lib/ratelimit';

export const runtime = 'nodejs';

// Slow-comparison defense — we sleep a random short interval before responding
// so password attempts can't be timed.
async function jitterDelay() {
  const ms = 200 + Math.floor(Math.random() * 300);
  await new Promise((r) => setTimeout(r, ms));
}

export async function POST(req: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json({ error: 'admin login not configured' }, { status: 503 });
  }
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  await jitterDelay();
  const provided = (body.password || '').toString();
  // Length-equalizing compare
  let mismatch = provided.length !== expected.length ? 1 : 0;
  const len = Math.max(provided.length, expected.length);
  for (let i = 0; i < len; i++) {
    mismatch |= (provided.charCodeAt(i) || 0) ^ (expected.charCodeAt(i) || 0);
  }
  if (mismatch) {
    return NextResponse.json({ error: 'invalid password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, makeAdminCookie(), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });
  return res;
}
