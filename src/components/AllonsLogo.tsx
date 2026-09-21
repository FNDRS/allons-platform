import Image from "next/image";

interface Props {
  className?: string;
  /**
   * "light"  → white wordmark for dark bars (default)
   * "orange" → brand orange wordmark
   * "dark"   → same orange file, kept for the waitlist hero
   */
  variant?: "dark" | "light" | "orange";
}

export function AllonsLogo({ className, variant = "light" }: Props) {
  const src = variant === "light" ? "/allons-logo-white.png" : "/allons-logo.png";
  return (
    <Image
      src={src}
      alt="Allons"
      width={420}
      height={150}
      priority
      className={className}
    />
  );
}
