"use client";

import type { ComercioProfile } from "@/lib/api/comercios";
import { useComercioCatalogue } from "@/hooks/useComercioCatalogue";
import { ComercioAbout } from "./ComercioAbout";
import { ComercioAppCard } from "./ComercioAppCard";
import { ComercioClassProgramsSection } from "./ComercioClassProgramsSection";
import { ComercioEventsSection } from "./ComercioEventsSection";
import { ComercioHero } from "./ComercioHero";
import { ComercioReviews } from "./ComercioReviews";

/**
 * Public comercio page, as a customer sees it: identity on top, the
 * catalogue on the left, who they are and how to follow them on the right.
 */
export function ComercioProfileView({
  profile,
  appDeepLink,
  appStoreLink,
}: {
  profile: ComercioProfile;
  appDeepLink: string;
  appStoreLink: string;
}) {
  const catalogue = useComercioCatalogue(profile);

  return (
    <div className="flex flex-col gap-8">
      <ComercioHero profile={profile} appDeepLink={appDeepLink} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="flex flex-col gap-10">
          <ComercioEventsSection
            upcoming={catalogue.upcoming}
            past={catalogue.past}
            loading={catalogue.eventsLoading}
            error={catalogue.eventsError}
            onRetry={catalogue.refetchEvents}
          />
          <ComercioClassProgramsSection
            programs={catalogue.programs}
            loading={catalogue.programsLoading}
            appDeepLink={appDeepLink}
          />
          <div className="lg:hidden">
            <ComercioReviews profile={profile} />
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:sticky lg:top-24">
          <ComercioAbout profile={profile} />
          <div className="hidden lg:block">
            <ComercioReviews profile={profile} />
          </div>
          <ComercioAppCard
            name={profile.name}
            appDeepLink={appDeepLink}
            appStoreLink={appStoreLink}
          />
        </div>
      </div>
    </div>
  );
}
