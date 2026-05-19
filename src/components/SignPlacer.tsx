'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  canvasCompositeOnPhoto,
  type MockupSpec,
  type SignPlacement,
} from '@/lib/mockup';

/**
 * Interactive overlay: drag the sign band to position it, drag the bottom-
 * right handle to resize. The base image is the user's facade photo; the
 * sign is rendered as an absolutely-positioned <div> on top, so we get
 * instant feedback without a re-render of the underlying canvas on every
 * pixel of drag. When the user is done we bake everything into one image
 * via `canvasCompositeOnPhoto`.
 */
export function SignPlacer({
  facadeDataUrl,
  spec,
  onChange,
  initial,
}: {
  facadeDataUrl: string;
  spec: MockupSpec;
  /** Called with the final composite PNG/JPEG data URL whenever drag ends. */
  onChange?: (dataUrl: string, place: SignPlacement) => void;
  initial?: Partial<SignPlacement>;
}) {
  const [place, setPlace] = useState<SignPlacement>({
    xPct: initial?.xPct ?? 0.5,
    yPct: initial?.yPct ?? 0.22,
    widthPct: initial?.widthPct ?? 0.7,
    heightPct: initial?.heightPct ?? 0.13,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const drag = useRef<
    | null
    | {
        mode: 'move' | 'resize';
        startX: number;
        startY: number;
        startPlace: SignPlacement;
      }
  >(null);

  // Bake the composite and forward it whenever the placement settles.
  useEffect(() => {
    let cancelled = false;
    const t = window.setTimeout(async () => {
      const dataUrl = await canvasCompositeOnPhoto(facadeDataUrl, spec, place);
      if (!cancelled) onChange?.(dataUrl, place);
    }, 150);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [facadeDataUrl, spec, place, onChange]);

  function onPointerDown(mode: 'move' | 'resize') {
    return (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as Element).setPointerCapture?.(e.pointerId);
      drag.current = {
        mode,
        startX: e.clientX,
        startY: e.clientY,
        startPlace: place,
      };
    };
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    const el = containerRef.current;
    if (!d || !el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - d.startX) / rect.width;
    const dy = (e.clientY - d.startY) / rect.height;
    if (d.mode === 'move') {
      const half = { w: d.startPlace.widthPct / 2, h: d.startPlace.heightPct / 2 };
      setPlace({
        ...d.startPlace,
        xPct: clamp(d.startPlace.xPct + dx, half.w, 1 - half.w),
        yPct: clamp(d.startPlace.yPct + dy, half.h, 1 - half.h),
      });
    } else {
      setPlace({
        ...d.startPlace,
        widthPct: clamp(d.startPlace.widthPct + dx * 2, 0.15, 0.95),
        heightPct: clamp(d.startPlace.heightPct + dy * 2, 0.05, 0.4),
      });
    }
  }

  function onPointerUp() {
    drag.current = null;
  }

  const previewStyle = useMemo(() => previewSignStyle(spec.signage_slug), [spec.signage_slug]);
  const name = (spec.business_name || 'Ваш бренд').trim();

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none overflow-hidden rounded-xl bg-slate-900"
      style={{ aspectRatio: 'auto' }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <img
        src={facadeDataUrl}
        alt=""
        className="block w-full"
        draggable={false}
      />
      <div
        className="absolute flex items-center justify-center cursor-move"
        style={{
          left: `${(place.xPct - place.widthPct / 2) * 100}%`,
          top: `${(place.yPct - place.heightPct / 2) * 100}%`,
          width: `${place.widthPct * 100}%`,
          height: `${place.heightPct * 100}%`,
          background: previewStyle.bg,
          color: previewStyle.color,
          borderRadius: 10,
          boxShadow: previewStyle.shadow,
          textShadow: previewStyle.textShadow,
          fontWeight: 800,
          fontFamily: '"Segoe UI", system-ui, sans-serif',
          fontSize: 'clamp(14px, 4vw, 36px)',
          letterSpacing: '0.01em',
          outline: '1.5px dashed rgba(255,255,255,0.6)',
          outlineOffset: 2,
        }}
        onPointerDown={onPointerDown('move')}
      >
        <span className="truncate px-3" style={{ pointerEvents: 'none' }}>{name}</span>
        <span
          role="presentation"
          className="absolute -bottom-2 -right-2 grid h-6 w-6 cursor-se-resize place-items-center rounded-full bg-white text-[10px] font-bold text-slate-700 shadow ring-1 ring-slate-300"
          onPointerDown={onPointerDown('resize')}
        >
          ⤡
        </span>
      </div>
    </div>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function previewSignStyle(slug: MockupSpec['signage_slug']) {
  switch (slug) {
    case 'lightbox':
      return {
        bg: 'rgba(255,255,255,0.96)',
        color: '#0b2447',
        shadow: '0 12px 30px rgba(0,0,0,0.4)',
        textShadow: 'none',
      };
    case 'channel_letters':
      return {
        bg: 'rgba(11,18,32,0.88)',
        color: '#ffffff',
        shadow: '0 12px 30px rgba(0,0,0,0.5)',
        textShadow: '0 0 18px rgba(255,255,255,0.7)',
      };
    case 'flat_panel':
      return {
        bg: '#0b2447',
        color: '#ffffff',
        shadow: '0 10px 24px rgba(0,0,0,0.35)',
        textShadow: 'none',
      };
    case 'illuminated':
      return {
        bg: '#111827',
        color: '#fde68a',
        shadow: '0 0 60px rgba(253,224,71,0.55)',
        textShadow: '0 0 18px rgba(253,224,71,0.95)',
      };
    case 'neon':
      return {
        bg: 'rgba(10,10,30,0.85)',
        color: '#f0abfc',
        shadow: '0 0 60px rgba(236,72,153,0.6)',
        textShadow: '0 0 14px rgba(236,72,153,1)',
      };
    case 'banner':
      return {
        bg: '#dc2626',
        color: '#ffffff',
        shadow: '0 10px 24px rgba(0,0,0,0.35)',
        textShadow: 'none',
      };
  }
}
