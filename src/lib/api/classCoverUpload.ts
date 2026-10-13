"use client";

import { getSupabaseBrowser } from "@/lib/supabase-browser";

/** Same bucket and folder the Allons app uploads event and class images to. */
const BUCKET = "event-images";
const FOLDER = "gallery";

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

/**
 * Uploads a class cover with the signed-in comercio's own session, exactly
 * like the app does, and returns its public URL. The storage client reports
 * no progress, so progress jumps to done once the upload lands.
 */
export async function uploadClassCover(
  file: File,
  onProgress: (fraction: number) => void,
): Promise<string> {
  // Anything the bucket does not list is labelled JPEG, as the app does.
  const known = file.type in EXTENSION_BY_TYPE;
  const extension = known ? EXTENSION_BY_TYPE[file.type] : "jpg";
  const unique = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const path = `${FOLDER}/img_${unique}.${extension}`;
  const storage = getSupabaseBrowser().storage.from(BUCKET);
  const { data, error } = await storage.upload(path, file, {
    contentType: known ? file.type : "image/jpeg",
    upsert: false,
  });
  if (error) throw new Error("No se pudo subir la imagen. Intenta de nuevo.");
  onProgress(1);
  return storage.getPublicUrl(data.path).data.publicUrl;
}
