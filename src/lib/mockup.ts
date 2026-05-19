'use client';

import type { Order } from './types';

export type MockupSpec = Pick<
  Order,
  | 'business_name'
  | 'business_type'
  | 'city_slug'
  | 'signage_slug'
  | 'illuminated'
  | 'style_prefs'
>;

export type MockupResult = {
  /** Primary mockup. If AI worked → the AI scene with the business name
   *  overlaid. If AI failed → a canvas composite over the user's photo. */
  primaryDataUrl: string;
  /** Always a canvas composite over the user's actual facade photo, so the
   *  customer can see "what their building would look like" regardless of
   *  whether AI worked. */
  facadeCompositeDataUrl: string;
  source: 'ai' | 'canvas';
};

export async function generateMockup(
  facadeDataUrl: string,
  spec: MockupSpec,
): Promise<MockupResult> {
  // Always compute the facade composite — it's instant, free, accurate to the
  // user's actual building.
  const facadeComposite = await canvasCompositeOnPhoto(facadeDataUrl, spec);

  // Try Flux for a styled "stylistic reference" scene.
  let aiSceneDataUrl: string | null = null;
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
      if (json.dataUrl) aiSceneDataUrl = json.dataUrl;
    }
  } catch {
    /* fall through */
  }

  if (aiSceneDataUrl) {
    // Flux was instructed to leave the signage blank. Now overlay the real
    // business name so the text is always correct and Cyrillic-safe.
    const aiWithName = await overlayBusinessName(aiSceneDataUrl, spec);
    return {
      primaryDataUrl: aiWithName,
      facadeCompositeDataUrl: facadeComposite,
      source: 'ai',
    };
  }

  return {
    primaryDataUrl: facadeComposite,
    facadeCompositeDataUrl: facadeComposite,
    source: 'canvas',
  };
}

// ============================================================================
// Canvas helpers
// ============================================================================

/** Overlay the business-name signage onto the user's actual facade photo. */
async function canvasCompositeOnPhoto(
  facadeDataUrl: string,
  spec: MockupSpec,
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
  ctx.drawImage(img, 0, 0, w, h);

  // Slight darkening at top so the sign reads against any sky
  const grad = ctx.createLinearGradient(0, 0, 0, h * 0.45);
  grad.addColorStop(0, 'rgba(0,0,0,0.18)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h * 0.45);

  drawSign(ctx, w, h, spec, 'photo');

  ctx.font = `500 ${Math.round(h * 0.018)}px system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.textAlign = 'right';
  ctx.fillText('AdvertMarket KZ · композит', w - 12, h - 10);

  return canvas.toDataURL('image/jpeg', 0.9);
}

/** Overlay the business name onto an already-rendered AI scene. */
async function overlayBusinessName(aiDataUrl: string, spec: MockupSpec): Promise<string> {
  const img = await loadImage(aiDataUrl);
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, w, h);

  drawSign(ctx, w, h, spec, 'ai');

  ctx.font = `500 ${Math.round(h * 0.018)}px system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.textAlign = 'right';
  ctx.fillText('AdvertMarket KZ · AI mockup', w - 12, h - 10);
  return canvas.toDataURL('image/jpeg', 0.9);
}

type Style = {
  panel: string;
  textColor: string;
  border?: string;
  glow?: string;
  font: string;
};

const STYLES: Record<MockupSpec['signage_slug'], Style> = {
  lightbox: {
    panel: 'rgba(255,255,255,0.96)',
    textColor: '#0b2447',
    border: '#0b2447',
    glow: 'rgba(255,235,170,0.85)',
    font: '700 {size}px "Segoe UI", system-ui, sans-serif',
  },
  channel_letters: {
    panel: 'rgba(11,18,32,0.85)',
    textColor: '#ffffff',
    border: 'rgba(255,255,255,0.15)',
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
  spec: MockupSpec,
  mode: 'photo' | 'ai',
) {
  const style = STYLES[spec.signage_slug];
  const name = (spec.business_name || 'Ваш бренд').trim();

  // For AI scenes we want the band to sit roughly where Flux was asked to
  // leave a blank sign (upper third). For real facade photos we keep our
  // long-standing position.
  const bandY = Math.round(h * (mode === 'ai' ? 0.18 : 0.16));
  const bandH = Math.round(h * (mode === 'ai' ? 0.12 : 0.13));
  const bandW = Math.round(w * (mode === 'ai' ? 0.62 : 0.7));
  const bandX = Math.round((w - bandW) / 2);

  // Auto-fit font size to the actual text width
  const padX = bandW * 0.08;
  let fontSize = Math.round(bandH * 0.62);
  ctx.font = style.font.replace('{size}', String(fontSize));
  while (ctx.measureText(name).width > bandW - padX * 2 && fontSize > 12) {
    fontSize -= 2;
    ctx.font = style.font.replace('{size}', String(fontSize));
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

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

  if (style.glow) {
    ctx.save();
    ctx.shadowColor = style.glow;
    ctx.shadowBlur = Math.round(bandH * 0.6);
    ctx.fillStyle = style.textColor;
    ctx.fillText(name, bandX + bandW / 2, bandY + bandH / 2);
    ctx.restore();
  }

  ctx.fillStyle = style.textColor;
  ctx.fillText(name, bandX + bandW / 2, bandY + bandH / 2);
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

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// ============================================================================
// File helpers (used by the upload step)
// ============================================================================

export async function compressToDataUrl(file: File, maxDim = 1600): Promise<string> {
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
