import SUBJECT_COLORS from '../utils/colors';

export default function Badge({ colorIndex = 0, children }) {
  const color = SUBJECT_COLORS[colorIndex] ?? SUBJECT_COLORS[0];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ background: color.bg, border: `1px solid ${color.border}`, color: color.text }}>
      {children}
    </span>
  );
}
