import Link from "next/link";
import { ALLOW_LEAVE_ATTR } from "@/hooks/useLeaveGuard";

/** The policies a buyer accepts by paying, by route. */
export const CONSENT_LINKS = [
  { href: "/terminos", label: "Términos y Condiciones" },
  { href: "/reembolsos", label: "Política de Reembolsos" },
  { href: "/privacidad", label: "Política de Privacidad" },
] as const;

export type ConsentHref = (typeof CONSENT_LINKS)[number]["href"];

export function consentLabelFor(href: string | null): string | null {
  const match = CONSENT_LINKS.find((link) => href === link.href || href?.startsWith(`${link.href}?`));
  return match?.label ?? null;
}

/**
 * Informed consent right where the buyer commits: the terms, the refund
 * policy and the privacy notice. One copy for both checkouts.
 *
 * `newTab` keeps the checkout open behind the policy where nothing guards
 * it (the class checkout). The event checkout opens them in the same tab
 * instead: its leave guard asks first, and the hold and the draft survive
 * the round trip.
 */
export function ConsentNote({
  verb,
  sharesAttendees = false,
  newTab = false,
}: {
  /** "pagar" or "confirmar". */
  verb: string;
  /** The organizer receives the attendees' answers. */
  sharesAttendees?: boolean;
  newTab?: boolean;
}) {
  const linkProps = newTab
    ? { target: "_blank" as const, [ALLOW_LEAVE_ATTR]: "" }
    : {};
  const [terms, refunds, privacy] = CONSENT_LINKS;
  const linkClass = "underline underline-offset-2 hover:text-white";
  return (
    <p className="text-center text-[12px] leading-relaxed text-white/45">
      Al {verb} aceptas los{" "}
      <Link href={terms.href} className={linkClass} {...linkProps}>
        {terms.label}
      </Link>
      , la{" "}
      <Link href={refunds.href} className={linkClass} {...linkProps}>
        {refunds.label}
      </Link>{" "}
      y la{" "}
      <Link href={privacy.href} className={linkClass} {...linkProps}>
        {privacy.label}
      </Link>{" "}
      de Allons{sharesAttendees ? ", y compartes con el organizador los datos de los asistentes" : ""}.
    </p>
  );
}
