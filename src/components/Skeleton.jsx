export default function Skeleton({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2.5 ${className}`} role="status" aria-label="Nalaganje vsebine">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="skel h-16 w-full"
          style={{ opacity: 1 - i * 0.18 }}
          aria-hidden="true"
        />
      ))}
      <span className="sr-only">Vsebina se nalaga</span>
    </div>
  );
}
