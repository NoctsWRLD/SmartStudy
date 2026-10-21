import { useId } from 'react';

/**
 * The mark is a square of aurora with an open book cut into it. The glyph is
 * always the deepest ink in the palette so it stays legible on every stop of
 * the gradient, in both themes.
 *
 * The gradient is a real SVG paint server rather than a CSS gradient in
 * `fill` — Chrome does not accept a gradient function as an SVG fill.
 */
export default function Logo({ size = 36, className = '' }) {
  const gradientId = useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="SmartStudy logotip"
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--rp-aurora-1)" />
          <stop offset="52%" stopColor="var(--rp-aurora-2)" />
          <stop offset="100%" stopColor="var(--rp-aurora-3)" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill={`url(#${gradientId})`} />
      <path
        d="M24 11c-3.6-2.2-8-2.6-12-1.6v22.4c4-1 8.4-.6 12 1.6 3.6-2.2 8-2.6 12-1.6V9.4c-4-1-8.4-.6-12 1.6Z"
        fill="none"
        stroke="#0a0d1f"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M24 11v22.4" stroke="#0a0d1f" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M17.5 18.5c1.2-.5 2.6-.6 4-.3M17.5 23.5c1.2-.5 2.6-.6 4-.3M26.5 18.2c1.4-.3 2.8-.2 4 .3M26.5 23.2c1.4-.3 2.8-.2 4 .3"
        stroke="#0a0d1f"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
}
