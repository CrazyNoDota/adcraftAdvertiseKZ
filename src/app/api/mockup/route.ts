import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { buildPrompt } from '@/lib/mockup-prompt';

export const runtime = 'nodejs';
// Flux can take 8-15s; allow up to 60s on Vercel.
export const maxDuration = 60;

const BodySchema = z.object({
  business_name: z.string().min(1).max(80),
  business_type: z.enum(['cafe', 'shop', 'salon', 'pharmacy', 'office', 'other']),
  signage_slug: z.enum(['lightbox', 'channel_letters', 'flat_panel', 'illuminated', 'neon', 'banner']),
  city_slug: z.enum(['almaty', 'astana', 'shymkent', 'karaganda', 'aktobe']),
  illuminated: z.boolean(),
  style_prefs: z.string().max(300).optional(),
  seed: z.number().int().optional(),
});

export async function POST(req: NextRequest) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !apiToken) {
    return NextResponse.json(
      { error: 'AI mockup is not configured on this deployment.' },
      { status: 503 },
    );
  }

  let parsed: z.infer<typeof BodySchema>;
  try {
    parsed = BodySchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const prompt = buildPrompt(parsed);
  const seed = parsed.seed ?? Math.floor(Math.random() * 1_000_000);

  const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`;

  let cfRes: Response;
  try {
    cfRes = await fetch(cfUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, seed, steps: 4 }),
    });
  } catch (e) {
    return NextResponse.json({ error: 'Upstream AI request failed.' }, { status: 502 });
  }

  if (!cfRes.ok) {
    const text = await cfRes.text().catch(() => '');
    return NextResponse.json(
      { error: `Cloudflare AI error (${cfRes.status}).`, detail: text.slice(0, 400) },
      { status: 502 },
    );
  }

  const payload = (await cfRes.json()) as {
    result?: { image?: string };
    success?: boolean;
    errors?: unknown;
  };
  const base64 = payload.result?.image;
  if (!base64) {
    return NextResponse.json(
      { error: 'Cloudflare response missing image.', detail: JSON.stringify(payload.errors)?.slice(0, 400) },
      { status: 502 },
    );
  }

  return NextResponse.json({
    dataUrl: `data:image/jpeg;base64,${base64}`,
    prompt,
    seed,
    model: '@cf/black-forest-labs/flux-1-schnell',
  });
}
