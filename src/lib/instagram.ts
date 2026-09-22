/** Turns @handle, a bare handle, or a full URL into a link and a short label. */
export function instagramLink(
  raw: string | null | undefined,
): { href: string; label: string } | null {
  const value = raw?.trim();
  if (!value) return null;

  const href = /^https?:\/\//i.test(value)
    ? value
    : `https://www.instagram.com/${value
        .replace(/^@/, "")
        .replace(/^(www\.)?instagram\.com\//i, "")
        .replace(/\/$/, "")}`;

  const handle = href.match(/instagram\.com\/([^/?#]+)/i)?.[1];
  return { href, label: handle ? `@${handle}` : value.replace(/^@/, "") };
}
