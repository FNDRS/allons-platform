/**
 * Turns a comercio phone into a WhatsApp link.
 * Honduras numbers are stored as 8 digits; wa.me needs the 504 prefix.
 */
export function whatsappLink(
  raw: string | null | undefined,
): { href: string; label: string } | null {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (!digits) return null;
  const local =
    digits.startsWith("504") && digits.length === 11 ? digits.slice(3) : digits;
  if (local.length !== 8) return null;
  return {
    href: `https://wa.me/504${local}`,
    label: `${local.slice(0, 4)}-${local.slice(4)}`,
  };
}
