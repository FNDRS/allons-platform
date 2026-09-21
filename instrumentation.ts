import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

/**
 * Server Components and route handlers throw far from any error boundary;
 * without this hook a failed render just shows the error page and nothing
 * reaches Sentry.
 */
export const onRequestError = Sentry.captureRequestError;
