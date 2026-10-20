/** Supabase's one-time code errors, in plain words. */
export function friendlyOtpError(message: string): string {
  const lower = message.toLowerCase();
  // "For security purposes, you can only request this after N seconds."
  if (lower.includes("security purposes"))
    return "Acabas de pedir un código. Espera unos segundos y vuelve a intentarlo.";
  if (lower.includes("rate limit")) return "Demasiados intentos. Espera un momento.";
  // "Email address "x" is invalid" / "Unable to validate email address": the
  // address, not a code, is what needs fixing.
  if (lower.includes("email") && (lower.includes("invalid") || lower.includes("validate")))
    return "Revisa el correo: no parece válido.";
  if (lower.includes("expired") || lower.includes("invalid"))
    return "El código no es válido o ya venció. Pide uno nuevo.";
  return message || "Algo salió mal. Intenta de nuevo.";
}
