/**
 * One number, one label. Deliberately not a card — the value is the content,
 * the card is only the surface it sits on.
 */
export default function StatTile({ value, label, hint, tone = 'text-rp-text', className = '' }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className={`tnum text-3xl font-bold leading-none ${tone}`}>{value}</p>
      <p className="mt-1.5 text-small text-rp-muted">{label}</p>
      {hint && <p className="mt-0.5 text-[11px] leading-4 text-rp-muted">{hint}</p>}
    </div>
  );
}
