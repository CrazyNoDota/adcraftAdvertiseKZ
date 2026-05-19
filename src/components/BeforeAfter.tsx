'use client';

import { useRef, useState } from 'react';
import { SafeImage } from './SafeImage';

/**
 * Drag-to-reveal before/after slider. Pure JS, no extra deps.
 */
export function BeforeAfter({
  before,
  after,
  label,
}: {
  before: string;
  after: string;
  label?: string;
}) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  function move(clientX: number) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, pct)));
  }

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 select-none touch-none"
      style={{ aspectRatio: '1 / 1' }}
      onPointerDown={(e) => {
        dragging.current = true;
        (e.target as Element).setPointerCapture?.(e.pointerId);
        move(e.clientX);
      }}
      onPointerMove={(e) => {
        if (!dragging.current) return;
        move(e.clientX);
      }}
      onPointerUp={() => (dragging.current = false)}
    >
      <SafeImage
        src={before}
        alt={label ? `${label} — до` : 'before'}
        className="absolute inset-0 h-full w-full object-cover"
        tone="mono"
      />
      <div
        className="absolute inset-0 h-full overflow-hidden"
        style={{ width: `${pos}%` }}
      >
        <SafeImage
          src={after}
          alt={label ? `${label} — после` : 'after'}
          className="h-full w-full object-cover"
          tone="brand"
        />
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 w-px bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.2)]"
        style={{ left: `${pos}%` }}
      />
      <div
        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-white shadow-lg ring-1 ring-slate-200 cursor-ew-resize"
        style={{ left: `${pos}%` }}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M9 6 3 12l6 6M15 6l6 6-6 6" />
        </svg>
      </div>
      <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-white">
        ДО
      </div>
      <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-semibold text-white">
        ПОСЛЕ
      </div>
      {label && (
        <div className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-slate-800 backdrop-blur">
          {label}
        </div>
      )}
    </div>
  );
}
