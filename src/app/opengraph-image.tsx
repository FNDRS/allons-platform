import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import QRCode from "qrcode";

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
  const [logo, font, qr] = await Promise.all([
    readFile(join(process.cwd(), "public/allons-logo.png")),
    loadFont(),
    QRCode.toBuffer("https://allonsapp.com", {
      type: "png",
      width: 520,
      margin: 0,
      errorCorrectionLevel: "M",
      color: { dark: "#111111", light: "#ffffff" },
    }),
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
          background: "#050505",
          color: "#FAFAF7",
          fontFamily: "Urbanist",
          padding: "0 88px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: 40,
            top: 70,
            width: 460,
            height: 460,
            borderRadius: 460,
            background:
              "radial-gradient(circle, rgba(246,112,16,0.28) 0%, rgba(246,112,16,0) 68%)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 36,
            maxWidth: 640,
          }}
        >
          <img
            src={`data:image/png;base64,${logo.toString("base64")}`}
            width={248}
            height={88}
            alt="Allons"
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 58,
              lineHeight: 1.05,
              fontWeight: 500,
              letterSpacing: "-0.035em",
            }}
          >
            <div style={{ display: "flex" }}>Todos tus eventos</div>
            <div style={{ display: "flex" }}>en un solo lugar.</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            borderRadius: 40,
            background: "#111113",
            padding: 8,
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              borderRadius: 32,
              background: "#ffffff",
              padding: 22,
            }}
          >
            <img
              src={`data:image/png;base64,${qr.toString("base64")}`}
              width={248}
              height={248}
              alt=""
            />
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
