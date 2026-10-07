"use client";

import { ApiError, apiFetch } from "./client";

/** Lo que el comercio manda desde `/onboarding/<token>`. Mismo shape que la API. */
export type OnboardingSubmission = {
  company: {
    brandName: string;
    contactName: string;
    email: string;
    phone: string;
    whatsapp: string | null;
    instagram: string;
    websiteUrl: string | null;
    description: string | null;
    logoUrls: string[];
  };
  billing: {
    accountHolder: string;
    bankName: string;
    accountType: "ahorro" | "cheques";
    accountNumber: string;
    taxId: string | null;
  };
  event: {
    title: string;
    description: string;
    date: string;
    time: string;
    venue: string | null;
    address: string;
    mapsUrl: string | null;
    category: string;
    ticketPrice: number | null;
    capacity: number;
    croquisUrls: string[];
  };
};

export type OnboardingUploadKind = "logo" | "croquis";

type UploadTicket = { signedUrl: string; publicUrl: string; path: string };

function tokenPath(token: string) {
  return `/onboarding/${encodeURIComponent(token)}`;
}

export function submitOnboarding(token: string, body: OnboardingSubmission) {
  return apiFetch<{ ok: true }>(tokenPath(token), {
    method: "POST",
    body,
    auth: false,
  });
}

/**
 * Sube un archivo en dos pasos: la API firma una ruta en el bucket y el
 * navegador manda los bytes directo a Storage. Así la API nunca recibe el
 * archivo. XHR en vez de fetch porque es lo único que reporta progreso.
 */
export async function uploadOnboardingFile(
  token: string,
  kind: OnboardingUploadKind,
  file: File,
  onProgress: (fraction: number) => void,
): Promise<string> {
  const ticket = await apiFetch<UploadTicket>(`${tokenPath(token)}/uploads`, {
    method: "POST",
    body: {
      kind,
      filename: file.name,
      contentType: file.type,
      sizeBytes: file.size,
    },
    auth: false,
  });

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", ticket.signedUrl);
    xhr.setRequestHeader("content-type", file.type);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new ApiError("No se pudo subir el archivo.", xhr.status));
    xhr.onerror = () =>
      reject(new ApiError("No se pudo subir el archivo. Revisa tu conexión.", 0, "network"));
    xhr.send(file);
  });

  return ticket.publicUrl;
}
