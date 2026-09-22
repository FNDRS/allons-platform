export function InstagramMark({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <rect
        x="4.25"
        y="4.25"
        width="15.5"
        height="15.5"
        rx="4.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="12" cy="12" r="3.4" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="16.6" cy="7.5" r="0.8" fill="currentColor" />
    </svg>
  );
}
