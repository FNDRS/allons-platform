import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Allons: eventos y boletos en Honduras",
    short_name: "Allons",
    description:
      "Descubre eventos en Honduras y compra tus boletos en línea con QR.",
    lang: "es-HN",
    start_url: "/eventos",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    categories: ["entertainment", "events", "lifestyle"],
    icons: [
      { src: "/favicon.png", sizes: "180x180", type: "image/png" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
