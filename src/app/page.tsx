import type { Metadata } from "next";
import { Suspense } from "react";
import { Countdown } from "@/components/Countdown";
import { HeroStickyLayer } from "@/components/HeroStickyLayer";
import { Motes } from "@/components/Motes";
import { SocialProof } from "@/components/SocialProof";
import { WaitlistForm } from "@/components/WaitlistForm";

export const metadata: Metadata = {
  title: "Lista de espera Allons Honduras",
  description:
    "Únete a la lista de espera de Allons. Descubre, gestiona y entra a eventos en Honduras con una experiencia simple y elegante.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Allons La próxima forma de vivir eventos",
    description:
      "Regístrate en la lista de espera de Allons para acceder antes al lanzamiento en Honduras.",
    url: "https://allonsapp.com",
    images: [
      {
        url: "https://allonsapp.com/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Allons Lista de espera",
      },
    ],
  },
  twitter: {
    title: "Allons Lista de espera",
    description:
      "Acceso anticipado a la nueva experiencia de eventos en Honduras.",
    images: ["https://allonsapp.com/opengraph-image"],
  },
};

export default function HomePage() {
  return (
    <>
      <HeroStickyLayer />
      <div className="ambient" aria-hidden />
      <Motes />
      <div className="vignette" aria-hidden />
      <div className="grain" aria-hidden />

      <div className="relative z-10 flex flex-col pt-16 sm:pt-20">
        <main id="contenido" tabIndex={-1} className="mx-auto flex w-full max-w-6xl flex-col items-center px-5 pb-0 pt-10 text-center sm:px-8 sm:pb-0 sm:pt-14">
          <h1 className="fade-up delay-2 mt-7 max-w-5xl bg-gradient-to-b from-white via-white/95 to-white/60 bg-clip-text text-[40px] font-semibold leading-[0.95] tracking-[-0.075em] text-transparent sm:text-[72px] lg:text-[96px]">
            La próxima forma de vivir eventos.
          </h1>

          <p className="fade-up delay-3 mt-6 max-w-2xl text-base leading-7 tracking-tight text-white/56 sm:text-lg">
            Allons está preparando una experiencia más simple, elegante y
            exclusiva para descubrir, gestionar y entrar a eventos en Honduras.
          </p>
          <section id="lista" className="fade-up delay-5 mt-9 w-full max-w-sm">
            <div className="rounded-[28px] bg-transparent p-3 shadow-[inset_0_0_1px_rgba(255,255,255,0.06)]">
              <Suspense
                fallback={
                  <div className="h-14 w-full rounded-full bg-[#1b1b1b]" />
                }
              >
                <WaitlistForm variant="dark" expanded />
              </Suspense>
            </div>
          </section>

          <SocialProof />

          <div id="lanzamiento">
            <Countdown />
          </div>
          <section id="footer-section" className="w-full mt-12 mb-1 px-6">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <SocialLink
                  href="https://www.instagram.com/allons.hn/"
                  label="Instagram"
                >
                  <InstagramIcon />
                </SocialLink>
                <SocialLink
                  href="https://www.tiktok.com/@allons.hn?_r=1&_t=ZS-97bZpRR00Up"
                  label="TikTok"
                >
                  <TikTokIcon />
                </SocialLink>
                <SocialLink
                  href="https://www.linkedin.com/company/allons-app"
                  label="LinkedIn"
                >
                  <LinkedInIcon />
                </SocialLink>
              </div>
              <div className="text-[13px] tracking-tight text-white/56">
                © Allons 2026 · Desarrollado por{" "}
                <a
                  href="https://thefndrs.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/90 underline decoration-white/45 underline-offset-2 transition-all duration-300 ease-out hover:text-white hover:decoration-white/80 hover:[text-shadow:0_0_14px_rgba(255,255,255,0.9),0_0_30px_rgba(255,255,255,0.55)]"
                >
                  FNDRS
                </a>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex size-9 items-center justify-center rounded-full text-white/70 transition-colors hover:text-white"
    >
      {children}
    </a>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 3v10.4a3.6 3.6 0 1 1-3.6-3.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 3c.7 2.6 2.5 4.3 5 4.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7.2 9.5V20M12 20v-5.6c0-3.1 5-3.4 5 0V20M7.2 5.2v.1M4 20h16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
