import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { buildEditInstruction } from '@/lib/mockup-prompt';

export const runtime = 'nodejs';
export const maxDuration = 60;

const BodySchema = z.object({
  business_name: z.string().min(1).max(80),
  business_type: z.enum(['cafe', 'shop', 'salon', 'pharmacy', 'office', 'other']),
  signage_slug: z.enum(['lightbox', 'channel_letters', 'flat_panel', 'illuminated', 'neon', 'banner']),
  city_slug: z.enum(['almaty', 'astana', 'shymkent', 'karaganda', 'aktobe']),
  illuminated: z.boolean(),
  style_prefs: z.string().max(300).optional(),
  /** Data URL of the user's facade photo. */
  facade_data_url: z.string().regex(/^data:image\/(jpeg|jpg|png|webp);base64,/),
});

const MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
const SIZE = (process.env.OPENAI_IMAGE_SIZE || '1024x1024') as
  | '1024x1024'
  | '1024x1536'
  | '1536x1024'
  | 'auto';
// "medium" finishes in ~15-25s on gpt-image-1 — fits comfortably inside the
// 60s Vercel Hobby-plan function timeout. Bump to "high" if you're on Pro
// (and bump maxDuration too).
const QUALITY = (process.env.OPENAI_IMAGE_QUALITY || 'medium') as
  | 'low'
  | 'medium'
  | 'high'
  | 'auto';

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI mockup is not configured on this deployment.' },
      { status: 503 },
    );
  }

  let parsed: z.infer<typeof BodySchema>;
  try {
    parsed = BodySchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json(
      { error: 'Invalid request body.', detail: e instanceof Error ? e.message : 'unknown' },
      { status: 400 },
    );
  }

  const prompt = buildEditInstruction(parsed);

  // Decode the data URL into a Blob for multipart upload.
  const match = parsed.facade_data_url.match(/^data:(image\/[a-z]+);base64,(.+)$/);
  if (!match) {
    return NextResponse.json({ error: 'Invalid facade image data URL.' }, { status: 400 });
  }
  const mime = match[1];
  const buf = Buffer.from(match[2], 'base64');
  const ext = mime.split('/')[1] === 'jpeg' ? 'jpg' : mime.split('/')[1];

  const form = new FormData();
  form.append('model', MODEL);
  form.append('prompt', prompt);
  form.append('size', SIZE);
  form.append('quality', QUALITY);
  form.append('n', '1');
  form.append('image', new Blob([buf], { type: mime }), `facade.${ext}`);

  let res: Response;
  try {
    res = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
  } catch (e) {
    return NextResponse.json({ error: 'Upstream AI request failed.' }, { status: 502 });
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    return NextResponse.json(
      { error: `OpenAI error (${res.status}).`, detail: text.slice(0, 600) },
      { status: 502 },
    );
  }

  const json = (await res.json()) as { data?: Array<{ b64_json?: string }> };
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) {
    return NextResponse.json({ error: 'OpenAI response missing image.' }, { status: 502 });
  }

  return NextResponse.json({
    dataUrl: `data:image/png;base64,${b64}`,
    prompt,
    model: MODEL,
  });
}
