"use client";

import { getSupabaseBrowser } from "@/lib/supabase-browser";

const DEFAULT_API_URL =
  process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:3000"
    : "https://api.allonsapp.com";

export function getApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_ALLONS_API_URL?.trim() || DEFAULT_API_URL
  ).replace(/\/+$/, "");
}

/**
 * True when the API being used is a local one. Its data lives in a local
 * Postgres, which no Supabase Realtime stream can see, so the comercio panel
 * falls back to polling instead of claiming to be live.
 */
export function usesLocalApi(): boolean {
  const base = getApiBaseUrl();
  return base.includes("localhost") || base.includes("127.0.0.1");
}

export class ApiError extends Error {
  status: number;
  code: string | null;

  constructor(message: string, status: number, code: string | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

type Options = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Attach the Supabase access token. Default true. */
  auth?: boolean;
};

const FRIENDLY_BY_STATUS: Record<number, string> = {
  401: "Inicia sesión para continuar.",
  403: "No tienes permiso para hacer esto.",
  404: "No encontramos lo que buscabas.",
  429: "Demasiadas solicitudes. Espera un momento e intenta de nuevo.",
};

function messageFromBody(body: unknown, status: number): {
  message: string;
  code: string | null;
} {
  if (body && typeof body === "object") {
    const raw = body as { message?: unknown; code?: unknown; error?: unknown };
    const code = typeof raw.code === "string" ? raw.code : null;
    if (Array.isArray(raw.message)) {
      return { message: raw.message.map(String).join(". "), code };
    }
    if (typeof raw.message === "string" && raw.message.trim()) {
      return { message: raw.message, code };
    }
    // Nest wraps `throw new XException({ code, message })` under `message`.
    if (raw.message && typeof raw.message === "object") {
      const inner = raw.message as { message?: unknown; code?: unknown };
      return {
        message:
          typeof inner.message === "string"
            ? inner.message
            : FRIENDLY_BY_STATUS[status] ?? "Algo salió mal.",
        code: typeof inner.code === "string" ? inner.code : code,
      };
    }
    return { message: FRIENDLY_BY_STATUS[status] ?? "Algo salió mal.", code };
  }
  return { message: FRIENDLY_BY_STATUS[status] ?? "Algo salió mal.", code: null };
}

async function getAccessToken(): Promise<string | null> {
  try {
    const { data } = await getSupabaseBrowser().auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

/**
 * Single door to allons-api from the browser. Bearer only: the API runs with
 * `credentials: false`, so cookies are never involved.
 */
export async function apiFetch<T>(
  path: string,
  { method = "GET", body, auth = true }: Options = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = await getAccessToken();
    if (!token) throw new ApiError("No hay sesión activa", 401, "no_session");
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      "No pudimos conectar con Allons. Revisa tu conexión.",
      0,
      "network",
    );
  }

  const text = await response.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }
  }

  if (!response.ok) {
    const { message, code } = messageFromBody(parsed, response.status);
    throw new ApiError(
      response.status >= 500
        ? "Allons tuvo un problema. Intenta de nuevo en un momento."
        : message,
      response.status,
      code,
    );
  }
  return parsed as T;
}
