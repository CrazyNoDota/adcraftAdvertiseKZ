import { NextResponse } from 'next/server';
import { ADMIN_COOKIE } from '@/lib/ratelimit';

export const runtime = 'nodejs';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}
