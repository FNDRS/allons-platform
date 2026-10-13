"use client";

import type { MyClassReservation } from "@/lib/api/classPrograms";
import { useCancelClassReservation } from "@/hooks/useCancelClassReservation";
import { formatClassDate, formatClassTime } from "@/lib/classFormat";
import { TicketCode } from "@/components/tickets/TicketCode";
import { TicketQr } from "@/components/tickets/TicketQr";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

/** The booking's QR and code for check-in, and cancelling it. */
export function ClassReservationModal({
  reservation,
  onClose,
}: {
  reservation: MyClassReservation | null;
  onClose: () => void;
}) {
  const { cancel, cancelling, dialog } = useCancelClassReservation(reservation, onClose);

  return (
    <>
      <Modal open={Boolean(reservation)} onClose={onClose} title={reservation?.programTitle ?? "Tu clase"}>
        {reservation ? (
          <div className="flex flex-col gap-5">
            <p className="text-[14px] text-white/60">
              {formatClassDate(reservation.date)}, {formatClassTime(reservation.startTime)}
              {reservation.instructorName ? ` · Coach ${reservation.instructorName}` : ""}
              <br />
              {[reservation.providerName, reservation.locationName, reservation.city]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {reservation.checkedInAt ? (
              <p className="rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-[14px] text-white/70">
                Ya registraste tu entrada a esta clase.
              </p>
            ) : reservation.qrPayload ? (
              <TicketQr payload={reservation.qrPayload} />
            ) : null}
            {reservation.code && !reservation.checkedInAt ? (
              <TicketCode code={reservation.code} />
            ) : null}
            {!reservation.checkedInAt ? (
              <Button variant="danger" full loading={cancelling} onClick={() => void cancel()}>
                Cancelar reserva
              </Button>
            ) : null}
          </div>
        ) : null}
      </Modal>
      {dialog}
    </>
  );
}
