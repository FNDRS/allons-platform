"use client";

import { Lock, Minus, Plus } from "lucide-react";
import { useConfirm } from "@/hooks/useConfirm";
import { useComercioCampaignPanel } from "@/hooks/useComercioCampaignPanel";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { SwitchRow } from "@/components/ui/SwitchRow";
import { ComercioPageHeader } from "@/components/comercio/ComercioPageHeader";
import { CampaignEventsList } from "./CampaignEventsList";
import { formatCampaignRange } from "./campaignFormat";

/** A campaign from a comercio's side: what it shares, joining, its events. */
export function CampaignJoinView({ id }: { id: string }) {
  const c = useComercioCampaignPanel(id);
  const { confirm, dialog } = useConfirm();
  const campaign = c.campaign;

  if (!campaign || !c.stage) {
    if (c.query.isLoading) return <Skeleton className="h-[320px] w-full rounded-[28px]" />;
    return <ErrorState message={c.query.error?.message} onRetry={() => void c.query.refetch()} />;
  }

  const hub = campaign.hub.name;
  const canEditSharing = c.stage === "can-request" || c.stage === "invited" || c.stage === "member";
  const leave = async () => {
    const requested = c.stage === "requested";
    const ok = await confirm(
      requested ? "Retirar solicitud" : "Salir de la campaña",
      requested
        ? "El hub ya no verá tu solicitud."
        : "Tus eventos salen de la campaña y dejan de pedir sus preguntas. Lo que ya pasó queda en el reporte del hub.",
      requested ? "Retirar" : "Salir",
    );
    if (ok) c.leave.mutate();
  };

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      {dialog}
      <ComercioPageHeader
        title={campaign.name}
        subtitle={`Organiza ${hub} · ${formatCampaignRange(campaign.startsAt, campaign.endsAt)}`}
      />
      {campaign.description ? (
        <p className="whitespace-pre-line text-[15px] leading-7 text-white/70">{campaign.description}</p>
      ) : null}

      <Card className="flex flex-col gap-3">
        <p className="font-semibold">Datos que compartes con {hub}</p>
        <p className="text-[13px] leading-6 text-white/55">
          Se agregan al formulario de cada evento que sumes. {hub} ve la asistencia y las respuestas
          de quien acepte compartirlas; nunca tus ventas ni tus pagos.
        </p>
        {campaign.questions.length === 0 ? (
          <p className="text-[13px] text-white/55">Esta campaña no pide preguntas: solo comparte asistencia.</p>
        ) : (
          campaign.questions.map((q) =>
            q.requiredForComercio ? (
              <div key={q.id} className="flex items-center justify-between gap-4 rounded-[14px] border border-border bg-surface px-4 py-3">
                <span className="min-w-0">
                  <span className="block text-[14px] font-semibold">{q.label}</span>
                  <span className="block text-[12px] text-dim">
                    Obligatoria para unirte{q.requiredForAttendee ? " · el asistente debe responderla" : ""}
                  </span>
                </span>
                <Lock className="size-4 shrink-0 text-dim" aria-label="Obligatoria" />
              </div>
            ) : (
              <SwitchRow
                key={q.id}
                label={q.label}
                hint={`Opcional${q.requiredForAttendee ? " · el asistente debe responderla" : ""}`}
                checked={c.picked.includes(q.id)}
                disabled={c.busy || !canEditSharing}
                onChange={() => c.toggleOptional(q.id)}
              />
            ),
          )
        )}
      </Card>

      <div className="flex flex-wrap gap-2">
        {c.stage === "can-request" ? (
          <Button size="lg" loading={c.busy} onClick={() => c.request.mutate()}>
            Solicitar unirme
          </Button>
        ) : null}
        {c.stage === "invited" ? (
          <>
            <Button loading={c.busy} onClick={() => c.answer.mutate(true)}>
              Aceptar invitación
            </Button>
            <Button variant="secondary" disabled={c.busy} onClick={() => c.answer.mutate(false)}>
              Rechazar
            </Button>
          </>
        ) : null}
        {c.stage === "invite-closed" ? (
          <>
            <p className="w-full text-[13px] text-white/55">Te invitaron, pero esta campaña ya cerró.</p>
            <Button variant="ghost" disabled={c.busy} onClick={() => c.answer.mutate(false)}>
              Rechazar invitación
            </Button>
          </>
        ) : null}
        {c.stage === "requested" ? (
          <>
            <p className="w-full text-[13px] text-white/55">Tu solicitud espera la respuesta del hub.</p>
            <Button variant="ghost" disabled={c.busy} onClick={leave}>
              Retirar solicitud
            </Button>
          </>
        ) : null}
        {c.stage === "member" ? (
          <>
            {c.sharingChanged ? (
              <Button loading={c.saveSharing.isPending} onClick={() => c.saveSharing.mutate()}>
                Guardar preguntas
              </Button>
            ) : null}
            <Button variant="ghost" disabled={c.busy} onClick={leave}>
              Salir de la campaña
            </Button>
          </>
        ) : null}
        {c.stage === "closed" ? (
          <p className="text-[13px] text-white/55">Esta campaña ya no recibe comercios.</p>
        ) : null}
      </div>

      {c.stage === "member" ? (
        <>
          <section>
            <SectionTitle>Tus eventos en la campaña</SectionTitle>
            {campaign.events.length === 0 ? (
              <p className="text-[13px] text-white/50">Todavía no sumas ningún evento.</p>
            ) : (
              <CampaignEventsList
                events={campaign.events}
                action={(e) => (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={c.busyEventId === e.id}
                    onClick={async () => {
                      const ok = await confirm(
                        "Quitar evento",
                        `"${e.title}" sale de la campaña y deja de pedir sus preguntas. Lo que ya pasó queda en el reporte del hub.`,
                        "Quitar",
                      );
                      if (ok) c.removeEvent.mutate(e.id);
                    }}
                  >
                    <Minus className="size-4" aria-hidden />
                    Quitar
                  </Button>
                )}
              />
            )}
          </section>
          <section>
            <SectionTitle>Puedes sumar</SectionTitle>
            {campaign.availableEvents.length === 0 ? (
              <p className="text-[13px] text-white/50">No tienes otros eventos dentro de las fechas de la campaña.</p>
            ) : (
              <CampaignEventsList
                events={campaign.availableEvents}
                action={(e) => (
                  <Button size="sm" variant="secondary" loading={c.busyEventId === e.id} disabled={Boolean(c.busyEventId)} onClick={() => c.addEvent.mutate(e.id)}>
                    <Plus className="size-4" aria-hidden />
                    Sumar
                  </Button>
                )}
              />
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
