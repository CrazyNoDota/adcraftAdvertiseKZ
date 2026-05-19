import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, RATELIMIT_COOKIE, isAdmin, peek } from '@/lib/ratelimit';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  const store = await cookies();
  const admin = isAdmin(store.get(ADMIN_COOKIE)?.value);
  const quota = peek(store.get(RATELIMIT_COOKIE)?.value);
  return NextResponse.json({ admin, quota });
}
