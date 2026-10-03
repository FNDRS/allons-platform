/**
 * "NEW" marker for a freshly shipped section: a bright, slowly flowing
 * gradient with a soft glow. The flow stops for people who ask for reduced
 * motion (see `.new-badge` in globals.css).
 */
export function NewBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`new-badge relative inline-flex h-5 shrink-0 items-center rounded-full px-2 text-[10px] font-extrabold uppercase leading-none tracking-[0.12em] text-white ring-1 ring-white/25 ${className}`}
    >
      NEW
    </span>
  );
}
