"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/**
 * Last resort: an error thrown in the root layout replaces the whole document,
 * so this is the only boundary left that can report it.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="es-HN">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0b0c",
          color: "#fbfbfb",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <div style={{ maxWidth: 420, padding: 24, textAlign: "center" }}>
          <h1 style={{ margin: "0 0 12px", fontSize: 20, fontWeight: 700 }}>
            Algo salió mal
          </h1>
          <p
            style={{
              margin: "0 0 20px",
              fontSize: 14,
              lineHeight: "22px",
              opacity: 0.7,
            }}
          >
            Ya lo reportamos. Recargá la página para intentar de nuevo.
          </p>
          <a
            href="/"
            style={{
              display: "inline-block",
              padding: "12px 24px",
              borderRadius: 12,
              background: "#F67010",
              color: "#fff",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            Volver al inicio
          </a>
        </div>
      </body>
    </html>
  );
}
