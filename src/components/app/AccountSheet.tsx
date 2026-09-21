"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Smartphone, Ticket, UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { displayNameOf, useAuth } from "./AuthProvider";

const APP_STORE = "https://apps.apple.com/us/app/allons-eventos-honduras/id6780532182?uo=4";
const PLAY_STORE = "https://play.google.com/store/apps/details?id=com.fndrs.allons";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Glass circle top right: initials when signed in, a person icon otherwise. */
export function AccountButton({ onOpen }: { onOpen: () => void }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
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
  const initials = initialsOf(displayNameOf(user)) || "A";
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Tu cuenta"
      className="flex size-11 items-center justify-center rounded-full border border-border bg-surface-2 text-[13px] font-bold tracking-wide text-white transition hover:bg-white/[0.1]"
    >
      {initials}
    </button>
  );
}

/** Account sheet: who is signed in, shortcuts, the app, sign out. */
export function AccountSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, signOut } = useAuth();
  if (!user) return null;
  return (
    <Modal open={open} onClose={onClose} title="Tu cuenta">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <span className="flex size-12 items-center justify-center rounded-full bg-accent-soft text-[15px] font-bold text-accent">
            {initialsOf(displayNameOf(user)) || "A"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[17px] font-bold tracking-tight">{displayNameOf(user)}</p>
            <p className="truncate text-sm text-muted">{user.email}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Link
            href="/tickets"
            onClick={onClose}
            className="flex items-center gap-3 rounded-[14px] border border-border bg-surface px-4 py-3.5 text-[15px] font-semibold transition hover:bg-surface-2"
          >
            <Ticket className="size-4 text-accent" aria-hidden /> Mis tickets
          </Link>
          <div className="flex items-center gap-3 rounded-[14px] border border-border bg-surface px-4 py-3.5 text-[15px]">
            <Smartphone className="size-4 text-accent" aria-hidden />
            <span className="flex-1 font-semibold">La app de Allons</span>
            <a href={APP_STORE} target="_blank" rel="noreferrer" className="text-[13px] font-semibold text-muted hover:text-white">
              iOS
            </a>
            <a href={PLAY_STORE} target="_blank" rel="noreferrer" className="text-[13px] font-semibold text-muted hover:text-white">
              Android
            </a>
          </div>
        </div>
        <Button
          variant="secondary"
          full
          onClick={() => {
            onClose();
            void signOut();
          }}
        >
          <LogOut className="size-4" aria-hidden /> Cerrar sesión
        </Button>
      </div>
    </Modal>
  );
}
