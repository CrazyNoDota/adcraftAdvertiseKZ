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
  /** AI-edited photo (user's facade with the sign on it) when AI works,
   *  otherwise a canvas composite with text overlaid at a default position. */
  primaryDataUrl: string;
  /** Always provided: the canvas composite. Useful as a "draggable" base if
   *  the user wants to fine-tune the placement. */
  facadeCompositeDataUrl: string;
  source: 'ai' | 'canvas';
};

export async function generateMockup(
  facadeDataUrl: string,
  spec: MockupSpec,
): Promise<MockupResult> {
  // Always compute a canvas composite — instant + reliable fallback.
  const facadeComposite = await canvasCompositeOnPhoto(facadeDataUrl, spec, {
    xPct: 0.5,
    yPct: 0.22,
    widthPct: 0.7,
    heightPct: 0.13,
  });

  // Try AI image edit.
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
        facade_data_url: facadeDataUrl,
      }),
    });
    if (res.ok) {
      const json = (await res.json()) as { dataUrl?: string };
      if (json.dataUrl) {
        return {
          primaryDataUrl: json.dataUrl,
          facadeCompositeDataUrl: facadeComposite,
          source: 'ai',
        };
      }
    }
  } catch {
    /* fall through */
  }

  return {
    primaryDataUrl: facadeComposite,
    facadeCompositeDataUrl: facadeComposite,
    source: 'canvas',
  };
}

// ============================================================================
// Canvas composite (used for the always-instant preview and as fallback)
// ============================================================================

export type SignPlacement = {
  /** All normalized to image dimensions (0..1) so resizing the photo keeps
   *  the sign at the same relative spot. */
  xPct: number; // sign center x
  yPct: number; // sign center y
  widthPct: number;
  heightPct: number;
};

export async function canvasCompositeOnPhoto(
  facadeDataUrl: string,
  spec: MockupSpec,
  place: SignPlacement,
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

  drawSign(ctx, w, h, spec, place);

  ctx.font = `500 ${Math.round(h * 0.018)}px system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.textAlign = 'right';
  ctx.fillText('AdvertMarket KZ', w - 12, h - 10);

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
  place: SignPlacement,
) {
  const style = STYLES[spec.signage_slug];
  const name = (spec.business_name || 'Ваш бренд').trim();

  const bandW = Math.round(w * place.widthPct);
  const bandH = Math.round(h * place.heightPct);
  const bandX = Math.round(w * place.xPct - bandW / 2);
  const bandY = Math.round(h * place.yPct - bandH / 2);

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
// File helpers
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
