import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Allons. Todos tus eventos en un solo lugar.";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

async function loadFont() {
  const res = await fetch(
    "https://cdn.jsdelivr.net/fontsource/fonts/urbanist@5.2.5/latin-500-normal.ttf",
  );
  if (!res.ok) throw new Error("Urbanist 500 fetch failed");
  return res.arrayBuffer();
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
          background: "#070707",
          backgroundImage:
            "radial-gradient(70% 90% at 16% 48%, #1A130E 0%, #0B0B0B 54%, #050505 100%)",
          color: "#FAFAF7",
          fontFamily: "Urbanist",
          padding: "0 140px",
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
          }}
        >
          <img
            src={`data:image/png;base64,${logo.toString("base64")}`}
            width={292}
            height={103}
            alt="Allons"
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 68,
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
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Urbanist", data: font, weight: 500, style: "normal" }],
    },
  );
}
