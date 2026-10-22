import { useId } from 'react';

/**
 * The mark is a flat square of ink with an open book cut into it.
 *
 * There is no gradient: the square is one flat accent colour and the glyph is
 * the ink that sits on top of it. Both come from the token layer, so the mark
 * follows the theme without a second set of colours.
 */
export default function Logo({ size = 36, className = '' }) {
  const titleId = useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-labelledby={titleId}
      className={className}
    >
      <title id={titleId}>Scribe</title>
      <rect width="48" height="48" rx="14" fill="var(--rp-accent)" />
      <path
        d="M24 11c-3.6-2.2-8-2.6-12-1.6v22.4c4-1 8.4-.6 12 1.6 3.6-2.2 8-2.6 12-1.6V9.4c-4-1-8.4-.6-12 1.6Z"
        fill="none"
        stroke="var(--rp-accent-ink)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M24 11v22.4" stroke="var(--rp-accent-ink)" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M17.5 18.5c1.2-.5 2.6-.6 4-.3M17.5 23.5c1.2-.5 2.6-.6 4-.3M26.5 18.2c1.4-.3 2.8-.2 4 .3M26.5 23.2c1.4-.3 2.8-.2 4 .3"
        stroke="var(--rp-accent-ink)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
}
