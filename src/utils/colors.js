/**
 * Subject hues — the only data colours in the app.
 *
 * Each hue is a token pair (`--rp-subject-N`) that resolves to a light-theme
 * and a dark-theme value, so a subject keeps the same identity in both
 * themes while staying readable on either canvas. `colorVar` is for inline
 * styles; the `bg` / `border` / `text` classes are literal so Tailwind can
 * see them.
 */
const SUBJECT_COLORS = [
  { label: 'Vijolična', bg: 'bg-rp-subject-1/12', border: 'border-rp-subject-1/30', text: 'text-rp-subject-1', dot: 'bg-rp-subject-1', colorVar: 'var(--rp-subject-1)' },
  { label: 'Roza', bg: 'bg-rp-subject-2/12', border: 'border-rp-subject-2/30', text: 'text-rp-subject-2', dot: 'bg-rp-subject-2', colorVar: 'var(--rp-subject-2)' },
  { label: 'Rdeča', bg: 'bg-rp-subject-3/12', border: 'border-rp-subject-3/30', text: 'text-rp-subject-3', dot: 'bg-rp-subject-3', colorVar: 'var(--rp-subject-3)' },
  { label: 'Zlata', bg: 'bg-rp-subject-4/12', border: 'border-rp-subject-4/30', text: 'text-rp-subject-4', dot: 'bg-rp-subject-4', colorVar: 'var(--rp-subject-4)' },
  { label: 'Zelena', bg: 'bg-rp-subject-5/12', border: 'border-rp-subject-5/30', text: 'text-rp-subject-5', dot: 'bg-rp-subject-5', colorVar: 'var(--rp-subject-5)' },
  { label: 'Modra', bg: 'bg-rp-subject-6/12', border: 'border-rp-subject-6/30', text: 'text-rp-subject-6', dot: 'bg-rp-subject-6', colorVar: 'var(--rp-subject-6)' },
  { label: 'Indigo', bg: 'bg-rp-subject-7/12', border: 'border-rp-subject-7/30', text: 'text-rp-subject-7', dot: 'bg-rp-subject-7', colorVar: 'var(--rp-subject-7)' },
  { label: 'Limona', bg: 'bg-rp-subject-8/12', border: 'border-rp-subject-8/30', text: 'text-rp-subject-8', dot: 'bg-rp-subject-8', colorVar: 'var(--rp-subject-8)' },
  { label: 'Oranžna', bg: 'bg-rp-subject-9/12', border: 'border-rp-subject-9/30', text: 'text-rp-subject-9', dot: 'bg-rp-subject-9', colorVar: 'var(--rp-subject-9)' },
  { label: 'Siva', bg: 'bg-rp-subject-10/12', border: 'border-rp-subject-10/30', text: 'text-rp-subject-10', dot: 'bg-rp-subject-10', colorVar: 'var(--rp-subject-10)' },
];

export const SUBJECT_COLOR_COUNT = SUBJECT_COLORS.length;

export function getSubjectColor(colorIndex) {
  return SUBJECT_COLORS[colorIndex] || SUBJECT_COLORS[0];
}

export default SUBJECT_COLORS;
