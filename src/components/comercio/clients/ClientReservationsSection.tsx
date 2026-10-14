import { Card, SectionTitle } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/Pill";
import type { ClassClientReservation } from "@/lib/api/classClients";
import { formatClassDate, formatClassTime, isOccurrenceElapsed } from "@/lib/classFormat";

type Outcome = { label: string; tone: "solid" | "gray" | "mute" };

function outcomeOf(reservation: ClassClientReservation): Outcome {
  if (reservation.status === "cancelled") return { label: "Cancelada", tone: "mute" };
  if (reservation.checkedInAt) return { label: "Asistió", tone: "gray" };
  if (!isOccurrenceElapsed(reservation)) return { label: "Próxima", tone: "solid" };
  return { label: "No asistió", tone: "mute" };
}

/** The client's bookings, newest first: upcoming, attended and cancelled. */
export function ClientReservationsSection({ reservations }: { reservations: ClassClientReservation[] }) {
  return (
    <section>
      <SectionTitle>{`Reservas · ${reservations.length}`}</SectionTitle>
      {reservations.length === 0 ? (
        <p className="text-[13px] text-white/50">No ha reservado clases.</p>
      ) : (
        <Card padding="none" className="divide-y divide-border">
          {reservations.map((reservation) => {
            const outcome = outcomeOf(reservation);
            return (
              <div key={reservation.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold">{reservation.programTitle}</p>
                  <p className="text-[13px] tabular-nums text-white/55">
                    {[
                      `${formatClassDate(reservation.date)} · ${formatClassTime(reservation.startTime)}`,
                      reservation.instructorName,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <StatusPill tone={outcome.tone}>{outcome.label}</StatusPill>
              </div>
            );
          })}
        </Card>
      )}
    </section>
  );
}
