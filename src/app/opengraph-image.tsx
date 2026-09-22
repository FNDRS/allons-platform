import type { ReactNode } from "react";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Allons. Todos tus eventos en un solo lugar.";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const ink = "#F67010";

async function loadFont() {
  const res = await fetch(
    "https://cdn.jsdelivr.net/fontsource/fonts/urbanist@5.2.5/latin-500-normal.ttf",
  );
  if (!res.ok) throw new Error("Urbanist 500 fetch failed");
  return res.arrayBuffer();
}

function IconFrame({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        width: 52,
        height: 52,
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.12)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </div>
  );
}

function TicketIcon() {
  return (
    <div
      style={{
        display: "flex",
        width: 22,
        height: 16,
        borderRadius: 4,
        border: `1.5px solid ${ink}`,
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          width: 1.5,
          height: 16,
          background: ink,
          opacity: 0.7,
        }}
      />
    </div>
  );
}

function QrIcon() {
  return (
    <div
      style={{
        display: "flex",
        width: 18,
        height: 18,
        borderRadius: 3,
        border: `1.5px solid ${ink}`,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          width: 6,
          height: 6,
          borderRadius: 1,
          background: ink,
        }}
      />
    </div>
  );
}

function PinIcon() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          width: 12,
          height: 12,
          borderRadius: 12,
          border: `1.5px solid ${ink}`,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 4,
            height: 4,
            borderRadius: 4,
            background: ink,
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          width: 0,
          height: 0,
          borderLeft: "4px solid transparent",
          borderRight: "4px solid transparent",
          borderTop: `6px solid ${ink}`,
          marginTop: -1,
        }}
      />
    </div>
  );
}

function MetaRow({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <IconFrame>{icon}</IconFrame>
      <div
        style={{
          display: "flex",
          fontSize: 22,
          fontWeight: 500,
          letterSpacing: "-0.02em",
          color: "rgba(250,250,247,0.58)",
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default async function Image() {
  const [logo, grain, font] = await Promise.all([
    readFile(join(process.cwd(), "public/allons-logo.png")),
    readFile(join(process.cwd(), "src/app/opengraph-grain.png")),
    loadFont(),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#070707",
          backgroundImage:
            "radial-gradient(70% 90% at 16% 48%, #1A130E 0%, #0B0B0B 54%, #050505 100%)",
          color: "#FAFAF7",
          fontFamily: "Urbanist",
          padding: "0 96px",
          position: "relative",
        }}
      >
        <img
          src={`data:image/png;base64,${grain.toString("base64")}`}
          width={1200}
          height={630}
          alt=""
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 1200,
            height: 630,
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
            maxWidth: 720,
          }}
        >
          <img
            src={`data:image/png;base64,${logo.toString("base64")}`}
            width={268}
            height={95}
            alt="Allons"
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 58,
              lineHeight: 1.08,
              fontWeight: 500,
              letterSpacing: "-0.03em",
              color: "rgba(250,250,247,0.94)",
            }}
          >
            <div style={{ display: "flex" }}>Todos tus eventos</div>
            <div style={{ display: "flex" }}>en un solo lugar.</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
          }}
        >
          <MetaRow icon={<TicketIcon />} label="Entradas" />
          <MetaRow icon={<QrIcon />} label="Código QR" />
          <MetaRow icon={<PinIcon />} label="Honduras" />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Urbanist", data: font, weight: 500, style: "normal" }],
    },
  );
}
