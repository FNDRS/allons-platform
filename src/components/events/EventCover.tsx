/* eslint-disable @next/next/no-img-element */

/** Cover image or a soft abstract wash. Never brown: neutrals + the accent. */
export function EventCover({
  src,
  alt,
  themeColor,
  className = "",
  fit = "cover",
}: {
  src: string | null | undefined;
  alt: string;
  themeColor?: string | null;
  className?: string;
  fit?: "cover" | "contain";
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`absolute inset-0 size-full object-center ${
          fit === "contain" ? "object-contain" : "object-cover"
        } ${className}`}
      />
    );
  }
  const tint = brightTint(safeColor(themeColor)) ?? "#f67010";
  return <AbstractCover tint={tint} className={className} />;
}

/**
 * Listing poster: a color field from the comercio theme, fading to black,
 * with film grain sitting on top so the grain picks up that color.
 */
export function EventPosterWash({
  themeColor,
  className = "",
}: {
  themeColor?: string | null;
  className?: string;
}) {
  const color = safeColor(themeColor) ?? "#00b4d8";
  return (
    <div className={`relative h-full w-full overflow-hidden bg-black ${className}`}>
      <span
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 130% at 8% -10%, color-mix(in srgb, ${color} 58%, white) 0%, ${color} 22%, ${hexAlpha(color, 0.42)} 48%, transparent 70%)`,
        }}
        aria-hidden
      />
      <span
        className="absolute inset-0 opacity-40 mix-blend-soft-light"
        style={{
          background: `radial-gradient(70% 80% at 18% 12%, ${color} 0%, transparent 58%)`,
        }}
        aria-hidden
      />
      <span className="poster-grain" aria-hidden />
    </div>
  );
}

function AbstractCover({
  tint,
  className,
}: {
  tint: string;
  className: string;
}) {
  return (
    <div
      aria-hidden
      className={`relative h-full w-full overflow-hidden bg-[#fff6f0] ${className}`}
    >
      <span
        className="absolute right-[-30%] top-[-20%] h-[110%] w-[86%] rotate-[22deg] rounded-[46%_38%_52%_42%]"
        style={{
          background: `linear-gradient(162deg, ${tint}33 0%, ${tint}88 40%, ${tint} 100%)`,
        }}
      />
      <span
        className="absolute left-[-10%] top-[-20%] h-[120%] w-[90%] rotate-[-18deg] rounded-[42%_48%_38%_55%]"
        style={{
          background: `linear-gradient(150deg, #ffffff 0%, #fff 28%, ${tint}40 68%, ${tint}70 100%)`,
        }}
      />
      <span
        className="absolute bottom-[-38%] left-[-34%] h-[98%] w-[96%] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 48% 36%, #ffffff 0%, #fff8f3 50%, transparent 70%)",
        }}
      />
    </div>
  );
}

/** Six-digit hex or null; a short `#abc` is expanded so alpha can be appended. */
export function safeColor(value: string | null | undefined): string | null {
  if (!value) return null;
  if (/^#[0-9a-f]{6}$/i.test(value)) return value;
  const short = value.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
  if (!short) return null;
  const [, r, g, b] = short;
  return `#${r}${r}${g}${g}${b}${b}`;
}

function hexAlpha(hex: string, alpha: number): string {
  const n = Math.round(Math.min(1, Math.max(0, alpha)) * 255);
  return `${hex}${n.toString(16).padStart(2, "0")}`;
}

/** Abstract covers need a light tint. Muddy browns fall back to the accent. */
function brightTint(hex: string | null): string | null {
  if (!hex) return null;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma < 0.35 ? "#f67010" : hex;
}
