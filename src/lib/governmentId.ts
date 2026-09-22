/**
 * El número de identidad que Clinpays exige para abrir su formulario de pago.
 * Misma regla que la API: letras, dígitos, espacios y guiones, de 5 a 30
 * caracteres, empezando y terminando en letra o dígito. Un DNI hondureño son
 * 13 dígitos; pasaportes y carnets de residencia llevan letras.
 */
export const GOVERNMENT_ID_REQUIRED_CODE = "government_id_required";

const GOVERNMENT_ID_MAX_LENGTH = 30;
const GOVERNMENT_ID_RE = /^[A-Za-z0-9][A-Za-z0-9 -]{3,28}[A-Za-z0-9]$/;

/** Lo que se puede teclear: quita lo que Clinpays rechazaría y acota el largo. */
export function formatGovernmentId(raw: string): string {
  return raw
    .replace(/[^A-Za-z0-9 -]/g, "")
    .toUpperCase()
    .slice(0, GOVERNMENT_ID_MAX_LENGTH);
}

export function isValidGovernmentId(value: string): boolean {
  return GOVERNMENT_ID_RE.test(value.trim());
}
