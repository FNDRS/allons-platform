"use client";

import Link from "next/link";
import { useState } from "react";
import { Pencil } from "lucide-react";
import { useCampaignEventAttendees } from "@/hooks/useCampaignEventAttendees";
import { useConfirm } from "@/hooks/useConfirm";
import { useHubCampaignPanel } from "@/hooks/useHubCampaignPanel";
import { Button, buttonClass } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { StatusPill } from "@/components/ui/Pill";
import { Segmented } from "@/components/ui/Segmented";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { ComercioPageHeader } from "@/components/comercio/ComercioPageHeader";
import { CampaignComercioDetail } from "./CampaignComercioDetail";
import { CampaignEventDetail } from "./CampaignEventDetail";
import { CampaignEventsList } from "./CampaignEventsList";
import { CampaignMembersPanel } from "./CampaignMembersPanel";
import { CampaignReportPanel } from "./CampaignReportPanel";
import { CAMPAIGN_STATUS_LABEL, formatCampaignRange } from "./campaignFormat";

type Tab = "summary" | "members" | "events";
const TABS: { value: Tab; label: string }[] = [
  { value: "summary", label: "Resumen" },
  { value: "members", label: "Comercios" },
  { value: "events", label: "Eventos" },
];

/** One campaign for its hub: report, comercios and events. */
export function HubCampaignView({ id }: { id: string }) {
  const c = useHubCampaignPanel(id);
  const { confirm, dialog } = useConfirm();
  const [tab, setTab] = useState<Tab>("summary");
  const campaign = c.campaign.data;
  const [openEventId, setOpenEventId] = useState<string | null>(null);
  const [openComercioId, setOpenComercioId] = useState<string | null>(null);
  const attendees = useCampaignEventAttendees(id, openEventId);

  if (!campaign) {
    if (c.campaign.isLoading) return <Skeleton className="h-[320px] w-full rounded-[28px]" />;
    return <ErrorState message={c.campaign.error?.message} onRetry={() => void c.campaign.refetch()} />;
  }

  const report = c.report.data;
  const members = c.members.data;
  const events = c.events.data;
  const openEvent = report?.byEvent.find((e) => e.eventId === openEventId) ?? null;
  const openComercio = report?.byComercio.find((x) => x.providerId === openComercioId) ?? null;
  const openEventDetail = (eventId: string) => {
    setOpenComercioId(null);
    setOpenEventId(eventId);
  };

  const busyMember = c.answer.isPending
    ? c.answer.variables?.memberId
    : c.removeMember.isPending
      ? c.removeMember.variables
      : undefined;

  return (
    <div className="flex flex-col gap-6">
      {dialog}
      <Modal open={Boolean(openEvent)} onClose={() => setOpenEventId(null)} title={openEvent?.title ?? "Evento"}>
        {openEvent ? (
          <CampaignEventDetail
            event={openEvent}
            list={attendees.data}
            loading={attendees.isLoading}
            error={attendees.error as Error | null}
            onRetry={() => void attendees.refetch()}
          />
        ) : null}
      </Modal>
      <Modal open={Boolean(openComercio)} onClose={() => setOpenComercioId(null)} title={openComercio?.name ?? "Comercio"}>
        {openComercio && report ? (
          <CampaignComercioDetail
            comercio={openComercio}
            events={report.byEvent.filter((e) => e.providerName === openComercio.name)}
            onOpenEvent={openEventDetail}
          />
        ) : null}
      </Modal>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <ComercioPageHeader title={campaign.name} subtitle={formatCampaignRange(campaign.startsAt, campaign.endsAt)} />
        <div className="flex items-center gap-2">
          <StatusPill tone="mute">{CAMPAIGN_STATUS_LABEL[campaign.status]}</StatusPill>
          <Link href={`/comercio/campanas/${encodeURIComponent(id)}/editar`} className={buttonClass({ variant: "secondary", size: "sm" })}>
            <Pencil className="size-4" aria-hidden />
            Editar
          </Link>
        </div>
      </div>

      <Segmented label="Sección" tone="gray" value={tab} options={TABS} onChange={setTab} />

      {tab === "summary" ? (
        report ? (
          <CampaignReportPanel
            report={report}
            exporting={c.exportReport.isPending ? (c.exportReport.variables ?? null) : null}
            onExport={(format) => c.exportReport.mutate(format)}
            onOpenEvent={openEventDetail}
            onOpenComercio={setOpenComercioId}
          />
        ) : c.report.isLoading ? (
          <Skeleton className="h-[240px] w-full rounded-[28px]" />
        ) : (
          <ErrorState message={c.report.error?.message} onRetry={() => void c.report.refetch()} />
        )
      ) : null}

      {tab === "members" ? (
        members ? (
          <CampaignMembersPanel
            members={members}
            inviting={c.invite.isPending}
onInvite={(handle) => c.invite.mutateAsync(handle)}
            busyMemberId={busyMember}
onAnswer={(memberId, approve) => c.answer.mutate({ memberId, approve })}
            onRemove={async (m) => {
              const ok = await confirm(
                "Quitar comercio",
                `${m.provider.name} sale de la campaña con todos sus eventos. Lo que ya pasó queda en el reporte.`,
                "Quitar",
              );
              if (ok) c.removeMember.mutate(m.id);
            }}
          />
        ) : c.members.isLoading ? (
          <Skeleton className="h-[200px] w-full rounded-[28px]" />
        ) : (
          <ErrorState message={c.members.error?.message} onRetry={() => void c.members.refetch()} />
        )
      ) : null}

      {tab === "events" ? (
        events ? (
          events.length === 0 ? (
            <EmptyState
              title="Sin eventos todavía"
              body="Cada comercio elige cuáles de sus eventos, dentro de las fechas de la campaña, entran."
            />
          ) : (
            <CampaignEventsList
              events={events}
              onSelect={(e) => openEventDetail(e.id)}
              action={(e) => (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={c.removeEvent.isPending && c.removeEvent.variables === e.id}
                  onClick={async () => {
                    const ok = await confirm(
                      "Quitar evento",
                      `"${e.title}" sale de la campaña. Lo que ya pasó queda en el reporte.`,
                      "Quitar",
                    );
                    if (ok) c.removeEvent.mutate(e.id);
                  }}
                >
                  Quitar
                </Button>
              )}
            />
          )
        ) : c.events.isLoading ? (
          <Skeleton className="h-[200px] w-full rounded-[28px]" />
        ) : (
          <ErrorState message={c.events.error?.message} onRetry={() => void c.events.refetch()} />
        )
      ) : null}

      <div className="pt-6">
        <Button
          variant="danger"
          loading={c.remove.isPending}
          onClick={async () => {
            const ok = await confirm(
              "Eliminar campaña",
              "Se borran la campaña, sus comercios y su reporte. Los eventos y sus boletos no se tocan.",
              "Eliminar",
            );
            if (ok) c.remove.mutate();
          }}
        >
          Eliminar campaña
        </Button>
      </div>
    </div>
  );
}
