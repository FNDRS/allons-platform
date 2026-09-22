/**
 * El número de identidad que Clinpays exige para abrir su formulario de pago.
 * Misma regla que la API: letras, dígitos, espacios y guiones, de 5 a 30
 * caracteres, empezando y terminando en letra o dígito. Un DNI hondureño son
 * 13 dígitos; pasaportes y carnets de residencia llevan letras.
 */
export const GOVERNMENT_ID_REQUIRED_CODE = "government_id_required";

const GOVERNMENT_ID_MAX_LENGTH = 30;
const GOVERNMENT_ID_RE = /^[A-Za-z0-9][A-Za-z0-9 -]{3,28}[A-Za-z0-9]$/;

/**
 * Lo que se puede teclear. Un DNI de solo dígitos se muestra 0801-1999-12345.
 * Un pasaporte o carnet conserva letras y espacios.
 */
export function formatGovernmentId(raw: string): string {
  const cleaned = raw.replace(/[^A-Za-z0-9 -]/g, "").toUpperCase();
  const compact = cleaned.replace(/[ -]/g, "");
  if (/^\d*$/.test(compact)) {
    const digits = compact.slice(0, 13);
    return [digits.slice(0, 4), digits.slice(4, 8), digits.slice(8)]
      .filter(Boolean)
      .join("-");
  }
  return cleaned.slice(0, GOVERNMENT_ID_MAX_LENGTH);
}

export function isValidGovernmentId(value: string): boolean {
  const trimmed = value.trim();
  if (!GOVERNMENT_ID_RE.test(trimmed)) return false;
  const compact = trimmed.replace(/[ -]/g, "");
  // Un DNI es numérico y son 13 dígitos. Con letras, el largo lo marca Clinpays.
  if (/^\d+$/.test(compact)) return compact.length === 13;
  return true;
}
