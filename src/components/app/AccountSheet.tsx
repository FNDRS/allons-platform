"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { UserRound } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useAccountAvatar } from "@/hooks/useAccountAvatar";
import { ProfileAvatar } from "./ProfileAvatar";
import { useAuth } from "./AuthProvider";

const APP_STORE =
  "https://apps.apple.com/us/app/allons-eventos-honduras/id6780532182?uo=4";
const PLAY_STORE =
  "https://play.google.com/store/apps/details?id=com.fndrs.allons";

/** Glass circle top right: same photo as the app, initials if none. */
export function AccountButton({ onOpen }: { onOpen: () => void }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const avatar = useAccountAvatar();
  if (loading) {
    return <span className="size-11 rounded-full bg-surface-2" aria-hidden />;
  }
  if (!user) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(pathname)}`}
        aria-label="Iniciar sesión"
        className="flex h-11 items-center gap-2 rounded-full border border-border bg-surface-2 px-4 text-[14px] font-semibold text-white/85 transition hover:bg-white/[0.1] hover:text-white"
      >
        <UserRound className="size-4" aria-hidden />
        <span className="hidden sm:inline">Entrar</span>
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Tu cuenta"
      className="flex size-11 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-2 transition hover:bg-white/[0.1]"
    >
      <ProfileAvatar
        src={avatar.src}
        name={avatar.name}
        sizeClass="size-full"
        radiusClass="rounded-full"
      />
    </button>
  );
}

/** Account sheet: who is signed in, shortcuts, the app, sign out. */
export function AccountSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user, signOut } = useAuth();
  const avatar = useAccountAvatar();
  if (!user) return null;
  return (
    <Modal open={open} onClose={onClose} title="Tu cuenta">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3.5">
          <span className="shrink-0 overflow-hidden rounded-[14px] ring-1 ring-white/12">
            <ProfileAvatar
              src={avatar.src}
              name={avatar.name}
              sizeClass="size-12"
              radiusClass="rounded-[14px]"
            />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[17px] font-bold tracking-tight">
              {avatar.name}
            </p>
            <p className="truncate text-[13px] text-white/45">{user.email}</p>
          </div>
        </div>

        <ul className="flex flex-col gap-1">
          <SheetRow
            href="/tickets"
            onClick={onClose}
            icon={<TicketMark />}
            label="Tickets"
          >
            Mis entradas
          </SheetRow>
          <SheetRow icon={<PhoneMark />} label="App">
            <span className="flex items-center gap-3">
              <a
                href={APP_STORE}
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-white"
              >
                iOS
              </a>
              <a
                href={PLAY_STORE}
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-white"
              >
                Android
              </a>
            </span>
          </SheetRow>
          <SheetRow
            icon={<LogoutMark />}
            label="Sesión"
            onClick={() => {
              onClose();
              void signOut();
            }}
          >
            Cerrar sesión
          </SheetRow>
        </ul>
      </div>
    </Modal>
  );
}

function SheetRow({
  icon,
  label,
  href,
  onClick,
  children,
}: {
  icon: ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
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
        <span className="mt-0.5 block truncate text-[15px] font-medium tracking-tight text-white/88">
          {children}
        </span>
      </span>
    </>
  );
  const className =
    "flex w-full items-center gap-3.5 rounded-[16px] px-1 py-1.5 text-left transition hover:bg-white/[0.03]";
  if (href) {
    return (
      <li>
        <Link href={href} onClick={onClick} className={className}>
          {inner}
        </Link>
      </li>
    );
  }
  if (onClick) {
    return (
      <li>
        <button type="button" onClick={onClick} className={className}>
          {inner}
        </button>
      </li>
    );
  }
  return <li className={className}>{inner}</li>;
}

function TicketMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" aria-hidden>
      <path
        d="M4.5 8.2c0-1.2 1-2.2 2.2-2.2h10.6c1.2 0 2.2 1 2.2 2.2v2a2.2 2.2 0 0 1 0 4.4v2c0 1.2-1 2.2-2.2 2.2H6.7c-1.2 0-2.2-1-2.2-2.2v-2a2.2 2.2 0 0 1 0-4.4v-2Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 7.2v1.2M14.5 11.4v1.2M14.5 15.6v1.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PhoneMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" aria-hidden>
      <rect
        x="7.25"
        y="3.25"
        width="9.5"
        height="17.5"
        rx="2.6"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M10.5 17.8h3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LogoutMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" aria-hidden>
      <path
        d="M14.5 7.2V6.4A2.4 2.4 0 0 0 12.1 4H7.4A2.4 2.4 0 0 0 5 6.4v11.2A2.4 2.4 0 0 0 7.4 20h4.7a2.4 2.4 0 0 0 2.4-2.4v-.8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M10.5 12h9M16.8 9.2 19.5 12l-2.7 2.8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
