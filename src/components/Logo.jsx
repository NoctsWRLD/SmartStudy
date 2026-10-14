export default function Logo({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="SmartStudy logotip"
    >
      <rect width="48" height="48" rx="14" fill="var(--rp-iris)" />
      <path
        d="M24 11c-3.6-2.2-8-2.6-12-1.6v22.4c4-1 8.4-.6 12 1.6 3.6-2.2 8-2.6 12-1.6V9.4c-4-1-8.4-.6-12 1.6Z"
        fill="none"
        stroke="#fff"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M24 11v22.4"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M17.5 18.5c1.2-.5 2.6-.6 4-.3M17.5 23.5c1.2-.5 2.6-.6 4-.3M26.5 18.2c1.4-.3 2.8-.2 4 .3M26.5 23.2c1.4-.3 2.8-.2 4 .3"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}
