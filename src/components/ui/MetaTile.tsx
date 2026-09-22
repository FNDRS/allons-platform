import type { ReactNode } from "react";

/** Label + value row with a glass icon tile. Used on event and ticket detail. */
export function MetaTile({
  icon,
  label,
  href,
  children,
}: {
  icon: ReactNode;
  label: string;
  href?: string | null;
  children: ReactNode;
}) {
  const inner = (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-[13px] bg-white/[0.045] text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-white/[0.08]">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/38">
          {label}
        </span>
        <span className="mt-0.5 block break-words text-[15px] font-medium tracking-tight text-white/88">
          {children}
        </span>
      </span>
    </>
  );
  const className = "flex items-center gap-3.5 rounded-[16px] px-1 py-1.5";
  if (href) {
    return (
      <li>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className={`${className} transition hover:bg-white/[0.03]`}
        >
          {inner}
        </a>
      </li>
    );
  }
  return <li className={className}>{inner}</li>;
}

export function CalendarMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" aria-hidden>
      <rect
        x="4.25"
        y="6.25"
        width="15.5"
        height="13.5"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M8 4.5v3.5M16 4.5v3.5M4.5 11h15"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PinMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" aria-hidden>
      <path
        d="M12 21s6.5-5.2 6.5-10.2A6.5 6.5 0 0 0 5.5 10.8C5.5 15.8 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10.6" r="2.1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function BikeMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" aria-hidden>
      <circle cx="7" cy="16" r="3.25" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="17" cy="16" r="3.25" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M7 16 11 8h4l2 8M11 8 8.5 12.5H14"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function KitMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" aria-hidden>
      <path
        d="M8 7.5 12 5l4 2.5M4.5 9.5 12 13.5l7.5-4M12 13.5V20"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 9.5v6.2c0 .6.3 1.1.8 1.4L12 21l6.7-3.9c.5-.3.8-.8.8-1.4V9.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

