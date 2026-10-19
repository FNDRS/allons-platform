"use client";

import { useEffect, useRef, useState } from "react";
import { CameraOff } from "lucide-react";

/** How often a frame is read. Fast enough to feel instant, light on a phone. */
const FRAME_MS = 200;
/** The same code held in front of the lens is read once, not every frame. */
const REPEAT_MS = 3000;

type Detect = (video: HTMLVideoElement) => Promise<string | null>;

type BarcodeDetectorLike = {
  detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]>;
};
type BarcodeDetectorCtor = new (options: { formats: string[] }) => BarcodeDetectorLike;

/**
 * Chrome on Android and macOS decode QR natively. Everything else (Safari,
 * Firefox, Chrome on Windows) falls back to jsQR, loaded only when needed.
 */
async function createDetector(): Promise<Detect> {
  const Native = (globalThis as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
  if (Native) {
    try {
      const detector = new Native({ formats: ["qr_code"] });
      return async (video) => (await detector.detect(video))[0]?.rawValue ?? null;
    } catch {
      // Some builds expose the class but not the QR format.
    }
  }
  const { default: jsQR } = await import("jsqr");
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  return async (video) => {
    if (!context || !video.videoWidth) return null;
    // Half resolution is plenty for a QR and four times cheaper to scan.
    canvas.width = Math.round(video.videoWidth / 2);
    canvas.height = Math.round(video.videoHeight / 2);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frame = context.getImageData(0, 0, canvas.width, canvas.height);
    return jsQR(frame.data, frame.width, frame.height, { inversionAttempts: "dontInvert" })?.data ?? null;
  };
}

function cameraMessage(error: unknown): string {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "Permite el acceso a la cámara en tu navegador para escanear.";
  }
  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return "Este dispositivo no tiene cámara disponible.";
  }
  if (name === "NotReadableError") {
    return "Otra app está usando la cámara. Ciérrala e intenta de nuevo.";
  }
  return "No pudimos abrir la cámara. Usa el código manual.";
}

/** True where the browser can open a camera at all (https or localhost). */
export function canUseCamera(): boolean {
  return (
    typeof navigator !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof window !== "undefined" &&
    window.isSecureContext
  );
}

/**
 * Live viewfinder that reports each QR it reads. `paused` stops reading
 * (the camera stays on) while a result is on screen, so one ticket is not
 * sent twice.
 */
export function CameraScanner({
  paused,
  onDetect,
}: {
  paused: boolean;
  onDetect: (raw: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pausedRef = useRef(paused);
  const onDetectRef = useRef(onDetect);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    pausedRef.current = paused;
    onDetectRef.current = onDetect;
  });

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;
    let last = { value: "", at: 0 };

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) return;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        const detect = await createDetector();
        if (cancelled) return;
        setStarting(false);

        const tick = async () => {
          if (cancelled) return;
          if (!pausedRef.current && video.readyState >= 2) {
            try {
              const value = await detect(video);
              const now = Date.now();
              if (value && (value !== last.value || now - last.at > REPEAT_MS)) {
                last = { value, at: now };
                onDetectRef.current(value);
              }
            } catch {
              // A dropped frame is not worth surfacing; the next one reads.
            }
          }
          timer = setTimeout(tick, FRAME_MS);
        };
        void tick();
      } catch (err) {
        if (!cancelled) {
          setError(cameraMessage(err));
          setStarting(false);
        }
      }
    }

    void start();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  if (error) {
    return (
      <div className="flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-[18px] border border-dashed border-border-strong px-6 text-center sm:aspect-video">
        <CameraOff className="size-6 text-dim" aria-hidden />
        <p className="max-w-xs text-sm text-muted">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-[18px] border border-border bg-black sm:aspect-video">
      <video
        ref={videoRef}
        muted
        playsInline
        aria-label="Vista de la cámara"
        className="size-full object-cover"
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute left-1/2 top-1/2 size-[62%] max-h-[260px] max-w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-[22px] border-2 transition-colors ${
          paused ? "border-white/25" : "border-accent"
        }`}
      />
      {starting ? (
        <p className="absolute inset-x-0 bottom-4 text-center text-[13px] font-semibold text-white/70">
          Abriendo cámara...
        </p>
      ) : (
        <p className="absolute inset-x-0 bottom-4 text-center text-[13px] font-semibold text-white/70">
          {paused ? "Revisa el resultado" : "Apunta al QR del ticket"}
        </p>
      )}
    </div>
  );
}
