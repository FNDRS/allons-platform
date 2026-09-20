/* eslint-disable @next/next/no-img-element */

/** Cover image or a themed gradient. Never brown: neutrals + the accent. */
export function EventCover({
  src,
  alt,
  themeColor,
  className = "",
}: {
  src: string | null | undefined;
  alt: string;
  themeColor?: string | null;
  className?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }
  const tint = safeColor(themeColor) ?? "#f67010";
  return (
    <div
      aria-hidden
      className={`h-full w-full ${className}`}
      style={{
        background: `radial-gradient(120% 90% at 20% 10%, ${tint}55 0%, transparent 60%), radial-gradient(90% 90% at 90% 90%, ${tint}33 0%, transparent 55%), #121214`,
      }}
    />
  );
}

function safeColor(value: string | null | undefined): string | null {
  if (!value) return null;
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) ? value : null;
}
