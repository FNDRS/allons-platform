import Image from "next/image";

interface Props {
  className?: string;
  /**
   * "light"  → white wordmark for dark bars (default)
   * "orange" → brand orange wordmark
   * "dark"   → same orange file, kept for the waitlist hero
   * "black"  → black wordmark for the white stairs cover
   */
  variant?: "dark" | "light" | "orange" | "black";
}

export function AllonsLogo({ className, variant = "light" }: Props) {
  const src =
    variant === "light" || variant === "black"
      ? "/allons-logo-white.png"
      : "/allons-logo.png";
  return (
    <Image
      src={src}
      alt="Allons"
      width={420}
      height={150}
      priority
      className={variant === "black" ? `brightness-0 ${className ?? ""}` : className}
    />
  );
}
