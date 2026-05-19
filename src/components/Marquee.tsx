'use client';

import type { ReactNode } from 'react';

/**
 * Pure-CSS infinite marquee. Children are duplicated so the loop is seamless.
 */
export function Marquee({ children, speed = 35 }: { children: ReactNode; speed?: number }) {
  return (
    <div className="group relative overflow-hidden">
      <div
        className="flex w-max gap-12 animate-[marquee_linear_infinite] group-hover:[animation-play-state:paused]"
        style={{ animationDuration: `${speed}s` }}
      >
        <div className="flex shrink-0 items-center gap-12">{children}</div>
        <div className="flex shrink-0 items-center gap-12" aria-hidden="true">{children}</div>
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent" />
    </div>
  );
}
