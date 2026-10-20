/** Supabase's one-time code errors, in plain words. */
export function friendlyOtpError(message: string): string {
  const lower = message.toLowerCase();
  // "For security purposes, you can only request this after N seconds."
  if (lower.includes("security purposes"))
    return "Acabas de pedir un código. Espera unos segundos y vuelve a intentarlo.";
  if (lower.includes("rate limit")) return "Demasiados intentos. Espera un momento.";
  const stale = lower.includes("expired") || lower.includes("invalid");
  // "Email link is invalid or has expired" is about the code, not the address.
  if (stale && (lower.includes("link") || lower.includes("token")))
    return "El código no es válido o ya venció. Pide uno nuevo.";
  // "Email address "x" is invalid" / "Unable to validate email address": the
  // address is what needs fixing.
  if (lower.includes("email address") && (stale || lower.includes("validate")))
    return "Revisa el correo: no parece válido.";
  if (stale)
    return "El código no es válido o ya venció. Pide uno nuevo.";
  return message || "Algo salió mal. Intenta de nuevo.";
}
