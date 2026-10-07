/**
 * Categorías del evento, iguales a las de allons-admin (`lib/eventCategories.ts`)
 * y la app mobile. La API resuelve el nombre a una fila de `interests`, así que
 * el texto tiene que coincidir letra por letra.
 */
export const INTEREST_OPTIONS = [
  "Cine y proyecciones",
  "Festivales culturales",
  "Exhibiciones de Arte",
  "Música",
  "Ciencia y tecnología",
  "Comic-Cons",
  "Conciertos",
  "Fitness y entrenamiento",
  "Partidos y torneos",
  "Conferencias",
  "Hackathons",
  "Catas de vino o cerveza",
  "Festivales gastronómicos",
  "Raves",
  "Gaming y e-sports",
  "Ferias y convenciones",
  "Comidas",
  "Bares & drinks",
  "Teatro y artes escénicas",
  "Bienestar y wellness",
  "Clases y talleres",
  "Fiestas y nightlife",
] as const;

export const EVENT_OTHER_CATEGORY = "Otro";

export const EVENT_CATEGORIES: string[] = [
  ...INTEREST_OPTIONS,
  EVENT_OTHER_CATEGORY,
];
