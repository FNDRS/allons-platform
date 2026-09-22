import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Allons. Todos tus eventos en un solo lugar.";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

async function loadFont(weight: "500" | "600" | "700") {
  const res = await fetch(
    `https://cdn.jsdelivr.net/fontsource/fonts/urbanist@5.2.5/latin-${weight}-normal.ttf`,
  );
  if (!res.ok) throw new Error(`Urbanist ${weight} fetch failed`);
  return res.arrayBuffer();
}

function QrMark() {
  return (
    <div
      style={{
        display: "flex",
        width: 148,
        height: 148,
        background: "#ffffff",
        borderRadius: 16,
        padding: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          position: "relative",
          width: 124,
          height: 124,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 36,
            height: 36,
            border: "8px solid #050505",
            borderRadius: 6,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: 36,
            height: 36,
            border: "8px solid #050505",
            borderRadius: 6,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: 36,
            height: 36,
            border: "8px solid #050505",
            borderRadius: 6,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 52,
            top: 52,
            width: 20,
            height: 20,
            background: "#F67010",
            borderRadius: 4,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 18,
            bottom: 18,
            width: 14,
            height: 14,
            background: "#050505",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 40,
            bottom: 40,
            width: 10,
            height: 10,
            background: "#050505",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 52,
            top: 18,
            width: 10,
            height: 10,
            background: "#050505",
          }}
        />
      </div>
    </div>
  );
}

export default async function Image() {
  const [logo, regular, semibold, bold] = await Promise.all([
    readFile(join(process.cwd(), "public/allons-logo.png")),
    loadFont("500"),
    loadFont("600"),
    loadFont("700"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#050505",
          color: "#ffffff",
          fontFamily: "Urbanist",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 8,
            background: "#F67010",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "52px 64px 48px 80px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <img
              src={`data:image/png;base64,${logo.toString("base64")}`}
              width={240}
              height={84}
              alt="Allons"
            />
            <div
              style={{
                display: "flex",
                fontSize: 20,
                fontWeight: 600,
                color: "rgba(255,255,255,0.38)",
              }}
            >
              Honduras
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 48,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 20,
                maxWidth: 680,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  fontSize: 64,
                  lineHeight: 1.04,
                  fontWeight: 700,
                  letterSpacing: "-0.04em",
                }}
              >
                <div style={{ display: "flex" }}>Todos tus eventos</div>
                <div style={{ display: "flex" }}>en un solo lugar.</div>
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 26,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.5)",
                  letterSpacing: "-0.02em",
                }}
              >
                Compra tu entrada, guarda tu QR y llega listo.
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: 280,
                borderRadius: 28,
                background: "#0d0d0d",
                border: "1px solid rgba(255,255,255,0.1)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  height: 6,
                  background: "#F67010",
                }}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "22px 22px 24px",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  TU ENTRADA
                </div>
                <QrMark />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      fontSize: 22,
                      fontWeight: 700,
                      letterSpacing: "-0.03em",
                    }}
                  >
                    Lista para escanear
                  </div>
                  <div
                    style={{
                      display: "flex",
                      fontSize: 16,
                      fontWeight: 500,
                      color: "rgba(255,255,255,0.42)",
                    }}
                  >
                    QR en app y web
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              paddingTop: 22,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                fontSize: 20,
                fontWeight: 600,
                color: "rgba(255,255,255,0.48)",
              }}
            >
              <span>Entradas</span>
              <span style={{ color: "#F67010" }}>·</span>
              <span>QR</span>
              <span style={{ color: "#F67010" }}>·</span>
              <span>Eventos</span>
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 20,
                fontWeight: 600,
                color: "rgba(255,255,255,0.36)",
              }}
            >
              allonsapp.com
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Urbanist", data: regular, weight: 500, style: "normal" },
        { name: "Urbanist", data: semibold, weight: 600, style: "normal" },
        { name: "Urbanist", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
