import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { EventOgBanner } from "@/components/events/EventOgBanner";
import { formatEventWhen, getPublicEvent } from "@/lib/allons-api";

export const alt = "Evento en Allons";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FONT_500 =
  "https://cdn.jsdelivr.net/fontsource/fonts/urbanist@5.2.5/latin-500-normal.ttf";
const FONT_600 =
  "https://cdn.jsdelivr.net/fontsource/fonts/urbanist@5.2.5/latin-600-normal.ttf";

type Props = { params: Promise<{ id: string }> };

async function loadFont(url: string) {
  const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
  if (!res.ok) throw new Error("font");
  return res.arrayBuffer();
}

function calendarParts(startsAt: string | null) {
  if (!startsAt) return { month: null, day: null, time: null };
  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime())) return { month: null, day: null, time: null };
  const month = date
    .toLocaleDateString("es-HN", {
      timeZone: "America/Tegucigalpa",
      month: "short",
    })
    .replace(".", "")
    .toUpperCase();
  const day = date.toLocaleDateString("es-HN", {
    timeZone: "America/Tegucigalpa",
    day: "numeric",
  });
  const time = date.toLocaleTimeString("es-HN", {
    timeZone: "America/Tegucigalpa",
    hour: "numeric",
    minute: "2-digit",
  });
  return { month, day, time };
}

export default async function Image({ params }: Props) {
  const { id } = await params;
  const [event, logo, font500, font600] = await Promise.all([
    getPublicEvent(id),
    readFile(join(process.cwd(), "public/allons-logo.png")),
    loadFont(FONT_500),
    loadFont(FONT_600).catch(() => null),
  ]);
  const calendar = calendarParts(event?.startsAt ?? null);
  const fonts: {
    name: string;
    data: ArrayBuffer;
    weight: 500 | 600;
    style: "normal";
  }[] = [
    { name: "Urbanist", data: font500, weight: 500, style: "normal" },
  ];
  if (font600) {
    fonts.push({
      name: "Urbanist",
      data: font600,
      weight: 600,
      style: "normal",
    });
  }

  return new ImageResponse(
    (
      <EventOgBanner
        title={event?.title ?? "Evento en Allons"}
        when={formatEventWhen(event?.startsAt ?? null)}
        city={event?.city ?? null}
        provider={event?.providerName ?? null}
        logoSrc={`data:image/png;base64,${logo.toString("base64")}`}
        month={calendar.month}
        day={calendar.day}
        time={calendar.time}
      />
    ),
    {
      ...size,
      fonts,
    },
  );
}
