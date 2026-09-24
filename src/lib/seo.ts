export const SITE_URL = "https://allonsapp.com";

/**
 * JSON for a `<script type="application/ld+json">`. Event titles and
 * descriptions are written by organizers, so a `</script>` inside one would
 * close the tag and run whatever follows. Escaping `<`, `>` and `&` as
 * unicode keeps the JSON identical for parsers and inert for the HTML one.
 */
export function jsonLd(data: unknown): { __html: string } {
  return {
    __html: JSON.stringify(data)
      .replace(/</g, "\\u003c")
      .replace(/>/g, "\\u003e")
      .replace(/&/g, "\\u0026")
      .replace(/\u2028/g, "\\u2028")
      .replace(/\u2029/g, "\\u2029"),
  };
}

/** Plain text of at most `max` characters, cut on a word. */
export function clip(text: string, max = 160): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 80 ? cut.lastIndexOf(" ") : cut.length)}…`;
}

/** Search terms every page shares: the brand and the country. */
export const HONDURAS_KEYWORDS = [
  "Allons",
  "eventos en Honduras",
  "eventos Honduras",
  "boletos Honduras",
  "entradas Honduras",
  "comprar boletos en línea Honduras",
  "venta de entradas Honduras",
  "ticketing Honduras",
  "conciertos Honduras",
  "fiestas Honduras",
  "qué hacer en Honduras",
  "eventos Tegucigalpa",
  "eventos San Pedro Sula",
  "eventos La Ceiba",
  "eventos Roatán",
  "eventos Comayagua",
  "eventos Choluteca",
  "clases y talleres Honduras",
  "spinning Tegucigalpa",
  "boletos con QR",
];
