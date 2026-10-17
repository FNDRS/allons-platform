import { Globe, Link2, Mail, MapPin } from "lucide-react";
import type { ComercioProfile } from "@/lib/api/comercios";
import { instagramLink } from "@/lib/instagram";
import { InstagramMark } from "@/components/shared/InstagramMark";
import { Card, SectionTitle } from "@/components/ui/Card";
import { MetaTile } from "@/components/ui/MetaTile";

/** Description plus the ways to reach the comercio. Hidden when both are empty. */
export function ComercioAbout({ profile }: { profile: ComercioProfile }) {
  const description = profile.description?.trim() || null;
  const instagram = instagramLink(profile.instagramUrl);
  // The API only stores http(s) URLs; the check keeps an odd row off the page.
  const bioLinks = (profile.bioLinks ?? []).filter((link) =>
    /^https?:\/\//i.test(link.url),
  );
  const hasContact = Boolean(
    profile.websiteUrl ||
      instagram ||
      bioLinks.length ||
      profile.email ||
      profile.city,
  );
  if (!description && !hasContact) return null;

  return (
    <section>
      <SectionTitle>Sobre el comercio</SectionTitle>
      <Card className="flex flex-col gap-5">
        {description ? (
          <p className="whitespace-pre-line break-words text-[15px] leading-7 text-white/80 [overflow-wrap:anywhere]">
            {description}
          </p>
        ) : null}
        {hasContact ? (
          <ul className={`flex flex-col gap-1 ${description ? "border-t border-white/[0.08] pt-4" : ""}`}>
            {profile.city ? (
              <MetaTile icon={<MapPin className="size-4" aria-hidden />} label="Ciudad">
                {profile.city}
              </MetaTile>
            ) : null}
            {profile.websiteUrl ? (
              <MetaTile
                icon={<Globe className="size-4" aria-hidden />}
                label="Sitio web"
                href={profile.websiteUrl}
              >
                {displayUrl(profile.websiteUrl)}
              </MetaTile>
            ) : null}
            {instagram ? (
              <MetaTile
                icon={<InstagramMark />}
                label="Instagram"
                href={instagram.href}
              >
                {instagram.label}
              </MetaTile>
            ) : null}
            {bioLinks.map((link, index) => (
              <MetaTile
                key={`${index}-${link.url}`}
                icon={<Link2 className="size-4" aria-hidden />}
                label={link.label}
                href={link.url}
              >
                {displayUrl(link.url)}
              </MetaTile>
            ))}
            {profile.email ? (
              <MetaTile
                icon={<Mail className="size-4" aria-hidden />}
                label="Correo"
                href={`mailto:${profile.email}`}
              >
                {profile.email}
              </MetaTile>
            ) : null}
          </ul>
        ) : null}
      </Card>
    </section>
  );
}

function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}
