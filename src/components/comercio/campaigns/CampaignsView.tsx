"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useCampaignsOverview } from "@/hooks/useCampaignsOverview";
import { useDemoMode } from "@/hooks/useDemoMode";
import { DEMO_COUNTS, DEMO_OPEN_CAMPAIGNS } from "@/lib/campaignDemo";
import type { ComercioCampaignListItem } from "@/lib/api/campaigns";
import { buttonClass } from "@/components/ui/Button";
import { SectionTitle } from "@/components/ui/Card";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { CampaignDemoBanner, CampaignDemoButton } from "./CampaignDemoControls";
import { CampaignListCard } from "./CampaignListCard";
import { CAMPAIGN_STATUS_LABEL, formatCampaignRange } from "./campaignFormat";

function membershipLabel(c: ComercioCampaignListItem) {
  const m = c.membership;
  if (m?.status === "accepted") return "Participas";
  if (m?.status === "pending") return m.initiatedBy === "hub" ? "Te invitaron" : "Solicitud enviada";
  return null;
}

function Loading() {
  return (
    <div className="flex flex-col gap-2.5">
      <Skeleton className="h-[74px] w-full rounded-[22px]" />
      <Skeleton className="h-[74px] w-full rounded-[22px]" />
    </div>
  );
}

/** Invites, the hub's own campaigns and the open ones this comercio can join. */
export function CampaignsView() {
  const o = useCampaignsOverview();
  const demo = useDemoMode();
  const joinHref = (id: string) => `/comercio/campanas/unirse/${encodeURIComponent(id)}`;

  return (
    <div className="flex flex-col gap-8">
      <div className="-mt-2 flex flex-col gap-3">
        <div className="flex justify-end">
          <CampaignDemoButton enabled={demo.enabled} onToggle={demo.toggle} />
        </div>
        {demo.enabled ? <CampaignDemoBanner onExit={demo.toggle} /> : null}
      </div>

      {o.access.isError && !o.access.data ? (
        <ErrorState
          message="No pudimos confirmar los permisos de tu comercio."
          onRetry={() => void o.access.refetch()}
        />
      ) : null}

      {o.invites.length > 0 ? (
        <section>
          <SectionTitle>Invitaciones</SectionTitle>
          <div className="flex flex-col gap-2.5">
            {o.invites.map((c) => (
              <CampaignListCard
                key={c.id}
                href={joinHref(c.id)}
                name={c.name}
                subtitle={`${c.hub.name} te invitó · ${formatCampaignRange(c.startsAt, c.endsAt)}`}
                pill="Te invitaron"
              />
            ))}
          </div>
        </section>
      ) : null}

      {o.isHub ? (
        <section>
          <SectionTitle
            action={
              <Link href="/comercio/campanas/nueva" className={buttonClass({ size: "sm" })}>
                <Plus className="size-4" aria-hidden />
                Nueva campaña
              </Link>
            }
          >
            Tus campañas
          </SectionTitle>
          {o.hub.isLoading ? (
            <Loading />
          ) : o.hub.error && !o.hub.data ? (
            <ErrorState message={o.hub.error.message} onRetry={() => void o.hub.refetch()} />
          ) : o.hubCampaigns.length === 0 ? (
            <EmptyState
              title="Sin campañas"
              body="Agrupa eventos de varios comercios bajo una campaña y mide su asistencia."
            />
          ) : (
            <div className="flex flex-col gap-2.5">
              {o.hubCampaigns.map((c) => (
                <CampaignListCard
                  key={c.id}
                  href={`/comercio/campanas/${encodeURIComponent(c.id)}`}
                  name={c.name}
                  subtitle={`${formatCampaignRange(c.startsAt, c.endsAt)} · ${
                    demo.enabled
                      ? `${DEMO_COUNTS.members} comercios · ${DEMO_COUNTS.events} eventos · ${DEMO_COUNTS.pending} pendiente`
                      : `${c.memberCount} comercios · ${c.eventCount} eventos${c.pendingCount ? ` · ${c.pendingCount} pendientes` : ""}`
                  }`}
                  pill={CAMPAIGN_STATUS_LABEL[c.status]}
                />
              ))}
            </div>
          )}
        </section>
      ) : null}

      <section>
        <SectionTitle>Campañas para tu comercio</SectionTitle>
        {demo.enabled ? (
          <div className="flex flex-col gap-2.5">
            {DEMO_OPEN_CAMPAIGNS.map((c) => (
              <CampaignListCard key={c.name} name={c.name} subtitle={c.subtitle} pill={c.pill} />
            ))}
          </div>
        ) : o.mine.isLoading ? (
          <Loading />
        ) : o.mine.error && !o.mine.data ? (
          <ErrorState message={o.mine.error.message} onRetry={() => void o.mine.refetch()} />
        ) : o.campaigns.length === 0 ? (
          <EmptyState
            title="No hay campañas abiertas"
            body="Cuando una organización abra una campaña, como un mes del emprendimiento, podrás pedir unirte con tus eventos."
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {o.campaigns.map((c) => (
              <CampaignListCard
                key={c.id}
                href={joinHref(c.id)}
                name={c.name}
                subtitle={`Organiza ${c.hub.name} · ${formatCampaignRange(c.startsAt, c.endsAt)}`}
                pill={membershipLabel(c)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
