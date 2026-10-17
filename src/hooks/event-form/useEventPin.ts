"use client";

import { useState } from "react";
import {
  isInsideHonduras,
  isShortGoogleMapsLink,
  parseGoogleMapsLink,
  type MapCoordinates,
} from "@/lib/googleMapsLink";
import { HONDURAS_CITIES } from "@/lib/hondurasCities";

const fold = (value: string) =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/** A place name from the geocoder, spelled the way the API stores cities. */
function matchCity(names: Array<string | undefined>): string | null {
  for (const name of names) {
    if (!name) continue;
    const folded = fold(name);
    const hit = HONDURAS_CITIES.find((city) => fold(city) === folded);
    if (hit) return hit;
  }
  return null;
}

/**
 * Street and city for a pin, to fill in what the comercio left blank. Best
 * effort: when it fails the API still works the city out from the pin.
 */
async function reverseGeocode(
  pin: MapCoordinates,
): Promise<{ address: string; city: string | null } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${pin.latitude}&lon=${pin.longitude}&zoom=18&addressdetails=1`,
      { headers: { Accept: "application/json" } },
    );
    if (!response.ok) return null;
    const data = (await response.json()) as { address?: Record<string, string> };
    const parts = data.address ?? {};
    const street = [parts.road, parts.neighbourhood ?? parts.suburb]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join(", ");
    return {
      address: street,
      city: matchCity([parts.city, parts.town, parts.village, parts.municipality, parts.county]),
    };
  } catch {
    return null;
  }
}

async function resolveLink(raw: string): Promise<MapCoordinates | string> {
  const direct = parseGoogleMapsLink(raw);
  if (direct) return direct;
  if (!isShortGoogleMapsLink(raw)) {
    return "No encontramos coordenadas. Pega el link de Google Maps o las coordenadas, por ejemplo 14.0723, -87.1921.";
  }
  try {
    const response = await fetch("/api/maps/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: raw }),
    });
    const body = (await response.json()) as Partial<MapCoordinates> & { error?: string };
    if (response.ok && typeof body.latitude === "number" && typeof body.longitude === "number") {
      return { latitude: body.latitude, longitude: body.longitude };
    }
    return body.error ?? "No pudimos leer la ubicación de ese link.";
  } catch {
    return "No pudimos leer la ubicación de ese link. Intenta de nuevo.";
  }
}

/**
 * The event's map pin, set by pasting a Google Maps link or coordinates.
 * `onResolved` gets the geocoded street and city so the form can fill the
 * fields that are still empty.
 */
export function useEventPin(
  initial: MapCoordinates | null,
  onResolved: (place: { address: string; city: string | null }) => void,
) {
  const [pin, setPin] = useState<MapCoordinates | null>(initial);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);

  const apply = async () => {
    const raw = draft.trim();
    if (!raw) {
      setError("Pega el link de Google Maps o las coordenadas.");
      return;
    }
    setError(null);
    setResolving(true);
    try {
      const result = await resolveLink(raw);
      if (typeof result === "string") {
        setError(result);
        return;
      }
      if (!isInsideHonduras(result)) {
        setError("Ese punto está fuera de Honduras.");
        return;
      }
      setPin(result);
      setDraft("");
      const place = await reverseGeocode(result);
      if (place) onResolved(place);
    } finally {
      setResolving(false);
    }
  };

  const changed =
    pin?.latitude !== initial?.latitude || pin?.longitude !== initial?.longitude;

  return {
    pin,
    /** Whether the pin differs from the saved one, so the save sends it. */
    changed,
    draft,
    setDraft: (value: string) => {
      setDraft(value);
      setError(null);
    },
    error,
    resolving,
    apply: () => void apply(),
    clear: () => {
      setPin(null);
      setError(null);
    },
  };
}
