'use client';

import type { BusinessType, City, Order, SignageTypeSlug } from './types';

export type MockupResult = {
  dataUrl: string;
  source: 'ai' | 'canvas';
};

/**
 * Generate a signage mockup. Tries Cloudflare Workers AI (Flux-1-schnell) via
 * our `/api/mockup` route first; falls back to a 2D-canvas composite over the
 * customer's facade photo if the AI is unavailable / errors out.
 *
 * The AI branch returns a fully generated storefront *scene* (Flux is
 * text-to-image, not image-to-image). The canvas branch overlays text onto
 * the user's actual photo. Both produce a PNG/JPEG data URL.
 */
export async function generateMockup(
  facadeDataUrl: string,
  spec: Pick<
    Order,
    'business_name' | 'signage_slug' | 'illuminated' | 'style_prefs' | 'business_type' | 'city_slug'
  >,
): Promise<MockupResult> {
  // Try the real AI first.
  try {
    const res = await fetch('/api/mockup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_name: spec.business_name || 'Brand',
        business_type: spec.business_type,
        signage_slug: spec.signage_slug,
        city_slug: spec.city_slug,
        illuminated: !!spec.illuminated,
        style_prefs: spec.style_prefs ?? undefined,
      }),
    });
    if (res.ok) {
      const json = (await res.json()) as { dataUrl?: string };
      if (json.dataUrl) {
        return { dataUrl: json.dataUrl, source: 'ai' };
      }
    }
  } catch {
    // fall through to canvas
  }

  return {
    dataUrl: await canvasComposite(facadeDataUrl, spec),
    source: 'canvas',
  };
}

async function canvasComposite(
  facadeDataUrl: string,
  spec: Pick<Order, 'business_name' | 'signage_slug' | 'illuminated' | 'style_prefs'>,
): Promise<string> {
  const img = await loadImage(facadeDataUrl);
  const targetWidth = Math.min(1280, img.naturalWidth);
  const scale = targetWidth / img.naturalWidth;
  const w = targetWidth;
  const h = Math.round(img.naturalHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Photo
  ctx.drawImage(img, 0, 0, w, h);

  // Slight darkening at the top so the sign reads against any sky
  const grad = ctx.createLinearGradient(0, 0, 0, h * 0.45);
  grad.addColorStop(0, 'rgba(0,0,0,0.18)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h * 0.45);

  drawSign(ctx, w, h, spec);

  return canvas.toDataURL('image/png');
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

type Style = {
  panel: string;
  textColor: string;
  border?: string;
  glow?: string;
  font: string;
};

const STYLES: Record<SignageTypeSlug, Style> = {
  lightbox: {
    panel: 'rgba(255,255,255,0.95)',
    textColor: '#0b2447',
    border: '#0b2447',
    glow: 'rgba(255,235,170,0.85)',
    font: '700 {size}px "Segoe UI", system-ui, sans-serif',
  },
  channel_letters: {
    panel: 'transparent',
    textColor: '#ffffff',
    border: '#1e293b',
    glow: 'rgba(255,255,255,0.9)',
    font: '800 {size}px "Segoe UI", system-ui, sans-serif',
  },
  flat_panel: {
    panel: '#0b2447',
    textColor: '#ffffff',
    font: '700 {size}px "Segoe UI", system-ui, sans-serif',
  },
  illuminated: {
    panel: '#111827',
    textColor: '#fde68a',
    glow: 'rgba(253,224,71,0.9)',
    font: '800 {size}px "Segoe UI", system-ui, sans-serif',
  },
  neon: {
    panel: 'rgba(10,10,30,0.85)',
    textColor: '#f0abfc',
    glow: 'rgba(236,72,153,0.95)',
    font: '800 italic {size}px "Segoe UI", system-ui, sans-serif',
  },
  banner: {
    panel: '#dc2626',
    textColor: '#ffffff',
    font: '800 {size}px "Segoe UI", system-ui, sans-serif',
  },
};

function drawSign(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  spec: Pick<Order, 'business_name' | 'signage_slug' | 'illuminated' | 'style_prefs'>,
) {
  const style = STYLES[spec.signage_slug];
  const name = (spec.business_name || 'Ваш бренд').trim();

  // Banner position: upper third, centered, 70% width
  const bandY = Math.round(h * 0.16);
  const bandH = Math.round(h * 0.13);
  const bandW = Math.round(w * 0.7);
  const bandX = Math.round((w - bandW) / 2);

  // Fit font size to the band
  const fontSize = Math.round(bandH * 0.62);
  ctx.font = style.font.replace('{size}', String(fontSize));
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Drop shadow under the sign onto the wall
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;

  if (style.panel !== 'transparent') {
    roundRect(ctx, bandX, bandY, bandW, bandH, Math.min(20, bandH * 0.18));
    ctx.fillStyle = style.panel;
    ctx.fill();
    if (style.border) {
      ctx.lineWidth = Math.max(2, bandH * 0.05);
      ctx.strokeStyle = style.border;
      ctx.stroke();
    }
  }
  ctx.restore();

  // Optional glow for illuminated styles
  if ((spec.illuminated || style.glow) && style.glow) {
    ctx.save();
    ctx.shadowColor = style.glow;
    ctx.shadowBlur = Math.round(bandH * 0.6);
    ctx.fillStyle = style.textColor;
    ctx.fillText(name, bandX + bandW / 2, bandY + bandH / 2);
    ctx.restore();
  }

  ctx.fillStyle = style.textColor;
  ctx.fillText(name, bandX + bandW / 2, bandY + bandH / 2);

  // Tiny watermark
  ctx.font = `500 ${Math.round(h * 0.018)}px system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.textAlign = 'right';
  ctx.fillText('AdvertMarket KZ · AI mockup', w - 12, h - 10);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Compress an arbitrary uploaded image to a JPEG data URL for storage. */
export async function compressToDataUrl(
  file: File,
  maxDim = 1600,
): Promise<string> {
  const dataUrl = await fileToDataUrl(file);
  const img = await loadImage(dataUrl);
  const ratio = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * ratio);
  const h = Math.round(img.naturalHeight * ratio);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', 0.85);
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
