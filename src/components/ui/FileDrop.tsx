"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ImageIcon, ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "./Button";

const EASE = [0.32, 0.72, 0, 1] as const;
const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const ACCEPT_EXT = /\.(jpe?g|png|webp|heic|heif)$/i;

export type DroppedFile = { url: string; name: string };

type Pending = { id: string; name: string; preview: string; progress: number };

/**
 * Zona para soltar imágenes, o elegirlas con el botón. Cada archivo se sube
 * en cuanto entra (con su barra de progreso) y sólo pasa a `files` cuando ya
 * tiene URL. El `<input type="file">` queda oculto: lo que se ve es el botón.
 */
export function FileDrop({
  id,
  files,
  onChange,
  upload,
  onBusyChange,
  max = 5,
  maxBytes = 10 * 1024 * 1024,
  invalid,
  describedBy,
  title = "Arrastra tus imágenes aquí",
  primaryLabel,
}: {
  id?: string;
  files: DroppedFile[];
  onChange: (files: DroppedFile[]) => void;
  upload: (file: File, onProgress: (fraction: number) => void) => Promise<string>;
  onBusyChange?: (busy: boolean) => void;
  max?: number;
  maxBytes?: number;
  invalid?: boolean;
  describedBy?: string;
  title?: string;
  /** Etiqueta sobre la primera imagen, cuando el orden importa. */
  primaryLabel?: string;
}) {
  const reduced = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Las subidas terminan en desorden: se acumulan contra la lista más nueva.
  const filesRef = useRef(files);
  filesRef.current = files;

  const busy = pending.length > 0;
  useEffect(() => onBusyChange?.(busy), [busy, onBusyChange]);

  const room = max - files.length - pending.length;

  function accept(list: FileList | null) {
    if (!list?.length) return;
    setError(null);
    const chosen = Array.from(list);
    const valid = chosen.filter(
      (file) => (ACCEPT.includes(file.type) || ACCEPT_EXT.test(file.name)) && file.size <= maxBytes,
    );
    if (valid.length < chosen.length) {
      setError(`Sólo JPG, PNG, WEBP o HEIC de hasta ${Math.round(maxBytes / 1024 / 1024)} MB.`);
    }
    if (valid.length > room) {
      setError(`Máximo ${max} imágenes.`);
    }
    for (const file of valid.slice(0, Math.max(room, 0))) void start(file);
  }

  async function start(file: File) {
    const item: Pending = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      preview: URL.createObjectURL(file),
      progress: 0,
    };
    setPending((current) => [...current, item]);
    try {
      const url = await upload(file, (fraction) =>
        setPending((current) =>
          current.map((entry) => (entry.id === item.id ? { ...entry, progress: fraction } : entry)),
        ),
      );
      filesRef.current = [...filesRef.current, { url, name: file.name }];
      onChange(filesRef.current);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo subir la imagen.");
    } finally {
      URL.revokeObjectURL(item.preview);
      setPending((current) => current.filter((entry) => entry.id !== item.id));
    }
  }

  return (
    <div>
      <div
        id={id}
        data-scroll-target={invalid ? "invalid" : undefined}
        aria-describedby={describedBy}
        onDragOver={(event) => {
          event.preventDefault();
          if (room > 0) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (room > 0) accept(event.dataTransfer.files);
        }}
        className={`relative overflow-hidden rounded-[18px] border border-dashed p-5 transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          dragging
            ? "border-accent bg-accent-soft"
            : invalid
              ? "border-red-400/50 bg-surface"
              : "border-border-strong bg-surface hover:border-white/25"
        }`}
      >
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-accent">
            <ImagePlus className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-white">{title}</p>
            <p className="mt-0.5 text-[12.5px] text-muted">
              JPG, PNG, WEBP o HEIC · hasta {Math.round(maxBytes / 1024 / 1024)} MB · {files.length}/{max}
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={room <= 0}
            onClick={() => inputRef.current?.click()}
          >
            Elegir archivos
          </Button>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={ACCEPT.join(",")}
            multiple
            onChange={(event) => {
              accept(event.target.files);
              event.target.value = "";
            }}
          />
        </div>

        {files.length > 0 || pending.length > 0 ? (
          <ul className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-5">
            <AnimatePresence initial={false}>
              {files.map((file, index) => (
                <motion.li
                  key={file.url}
                  layout={!reduced}
                  initial={reduced ? false : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.28, ease: EASE }}
                  className="group relative aspect-square overflow-hidden rounded-[14px] border border-border bg-[#0c0c0e]"
                >
                  <Thumb src={file.url} alt={file.name} />
                  {index === 0 && primaryLabel ? (
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                      {primaryLabel}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onChange(files.filter((item) => item.url !== file.url))}
                    aria-label={`Quitar ${file.name}`}
                    className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-black/70 text-white/85 backdrop-blur transition hover:bg-black hover:text-white"
                  >
                    <X className="size-3.5" aria-hidden />
                  </button>
                </motion.li>
              ))}
              {pending.map((item) => (
                <motion.li
                  key={item.id}
                  initial={reduced ? false : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.28, ease: EASE }}
                  className="relative aspect-square overflow-hidden rounded-[14px] border border-border bg-[#0c0c0e]"
                >
                  <Thumb src={item.preview} alt={item.name} dim />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="size-5 animate-spin text-white" aria-hidden />
                  </div>
                  <div className="absolute inset-x-2 bottom-2 h-1 overflow-hidden rounded-full bg-white/15">
                    <motion.div
                      className="h-full rounded-full bg-accent"
                      initial={false}
                      animate={{ width: `${Math.max(item.progress, 0.05) * 100}%` }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                  <span className="sr-only">Subiendo {item.name}</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="mt-1.5 text-[13px] text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** HEIC no se ve en casi ningún navegador: entonces queda el ícono. */
function Thumb({ src, alt, dim = false }: { src: string; alt: string; dim?: boolean }) {
  const [broken, setBroken] = useState(false);
  if (broken) {
    return (
      <div className="flex size-full items-center justify-center text-dim">
        <ImageIcon className="size-6" strokeWidth={1.5} aria-hidden />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setBroken(true)}
      className={`size-full object-cover ${dim ? "opacity-40" : ""}`}
    />
  );
}
