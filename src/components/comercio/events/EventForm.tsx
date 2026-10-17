"use client";

import { SectionTitle } from "@/components/ui/Card";
import { useEventForm } from "@/hooks/useEventForm";
import type { ProviderEventDetail } from "@/lib/api/provider";
import { EventBasicsFields } from "./EventBasicsFields";
import { EventCoverField } from "./EventCoverField";
import { EventDonationFields } from "./EventDonationFields";
import { EventFormActions } from "./EventFormActions";
import { EventKitPickupField } from "./EventKitPickupField";
import { EventLocationFields } from "./EventLocationFields";
import { EventPolicyFields } from "./EventPolicyFields";
import { EventQuestionsFields } from "./EventQuestionsFields";
import { EventScheduleFields } from "./EventScheduleFields";
import { EventTicketEditorModal } from "./EventTicketEditorModal";
import { EventTicketsBuilder } from "./EventTicketsBuilder";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      {children}
    </section>
  );
}

/**
 * The form itself. `useEventForm` seeds its state from `event` on mount, so
 * the editor resolves the event first and only then mounts this.
 */
export function EventForm({ event }: { event: ProviderEventDetail | null }) {
  const f = useEventForm(event);

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Section title="El evento">
        <EventBasicsFields {...f} />
      </Section>
      <EventCoverField
        url={f.coverImageUrl}
        onChange={f.setCoverImageUrl}
        onBusyChange={f.setCoverBusy}
      />
      <Section title="Cuándo">
        <EventScheduleFields {...f} />
      </Section>
      <Section title="Dónde y cómo llegar">
        <EventLocationFields {...f} />
      </Section>
      <EventTicketsBuilder
        tickets={f.tickets.tickets}
        eventStartsAt={f.eventStartsAt}
        onAdd={f.tickets.openNew}
        onEdit={f.tickets.openExisting}
        onRemove={f.tickets.remove}
      />
      <Section title="Reglas y detalles">
        <div className="flex flex-col gap-4">
          <EventPolicyFields {...f} />
          <EventKitPickupField {...f} />
        </div>
      </Section>
      <Section title="Formulario de registro">
        <EventQuestionsFields q={f.questions} />
      </Section>
      <Section title="Donaciones directas">
        <EventDonationFields d={f.donation} />
      </Section>
      <EventFormActions
        isLive={f.isLive}
        canSaveDraft={f.canSaveDraft}
        canSubmit={f.canSubmit}
        missingForDraft={f.missingForDraft}
        missingForReview={f.missingForReview}
        savingTarget={f.savingTarget}
        cancelHref={f.cancelHref}
        onSave={f.save}
      />

      <EventTicketEditorModal
        draft={f.tickets.editorDraft}
        eventStartsAt={f.eventStartsAt}
        error={f.tickets.editorError}
        onChange={f.tickets.updateEditor}
        onCancel={f.tickets.closeEditor}
        onConfirm={f.tickets.commitEditor}
      />
    </div>
  );
}
