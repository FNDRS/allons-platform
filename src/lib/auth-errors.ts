/** Supabase's one-time code errors, in plain words. */
export function friendlyOtpError(message: string): string {
  const lower = message.toLowerCase();
  // "For security purposes, you can only request this after N seconds."
  if (lower.includes("security purposes"))
    return "Acabas de pedir un código. Espera unos segundos y vuelve a intentarlo.";
  if (lower.includes("rate limit")) return "Demasiados intentos. Espera un momento.";
  if (lower.includes("expired") || lower.includes("invalid"))
    return "El código no es válido o ya venció. Pide uno nuevo.";
  return message || "Algo salió mal. Intenta de nuevo.";
}
