'use client';

import { useState } from 'react';
import clsx from 'clsx';

type Props = {
  src: string;
  alt: string;
  className?: string;
  /** What to render when the file isn't there yet. */
  fallback?: React.ReactNode;
  /** Tone for the default gradient fallback. */
  tone?: 'brand' | 'warm' | 'cool' | 'mono';
};

const TONES: Record<NonNullable<Props['tone']>, string> = {
  brand: 'from-brand-100 via-white to-purple-100',
  warm: 'from-amber-100 via-orange-50 to-rose-100',
  cool: 'from-sky-100 via-slate-50 to-emerald-100',
  mono: 'from-slate-100 via-white to-slate-200',
};

/**
 * Renders an <img>; if the file is missing (404 / decode error), shows a
 * gradient placeholder instead. Lets us ship the layout before the assets
 * land in `/public/images/`.
 */
export function SafeImage({ src, alt, className, fallback, tone = 'brand' }: Props) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div
        className={clsx(
          'flex items-center justify-center bg-gradient-to-br text-slate-400',
          TONES[tone],
          className,
        )}
        role="img"
        aria-label={alt}
      >
        {fallback ?? <PlaceholderMark />}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setErrored(true)}
      loading="lazy"
      decoding="async"
    />
  );
}

function PlaceholderMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 opacity-70" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="m21 16-5-5-9 9" />
    </svg>
  );
}
