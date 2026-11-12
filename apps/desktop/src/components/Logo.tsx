export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="58" height="58" rx="15" fill="#FDE047" stroke="#111111" strokeWidth="5" />
      <path
        d="M18 27v-3.5A5.5 5.5 0 0 1 23.5 18H27"
        stroke="#111111"
        strokeWidth="4.6"
        strokeLinecap="round"
      />
      <path
        d="M37 18h3.5A5.5 5.5 0 0 1 46 23.5V27"
        stroke="#111111"
        strokeWidth="4.6"
        strokeLinecap="round"
      />
      <path
        d="M46 37v3.5a5.5 5.5 0 0 1-5.5 5.5H37"
        stroke="#111111"
        strokeWidth="4.6"
        strokeLinecap="round"
      />
      <path
        d="M27 46h-3.5A5.5 5.5 0 0 1 18 40.5V37"
        stroke="#111111"
        strokeWidth="4.6"
        strokeLinecap="round"
      />
      <circle cx="32" cy="32" r="8.5" fill="#111111" />
      <circle cx="32" cy="32" r="2.8" fill="#FDE047" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-display text-xl tracking-tight text-foreground ${className}`}
    >
      scrynx
    </span>
  );
}
