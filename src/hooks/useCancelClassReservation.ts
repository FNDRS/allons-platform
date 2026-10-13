"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/useConfirm";
import { isApiError } from "@/lib/api/client";
import {
  cancelClassReservation,
  classProgramKeys,
  getClassProgram,
  myClassKeys,
  type MyClassReservation,
} from "@/lib/api/classPrograms";
import { describeClassCancellation } from "@/lib/classCancellationCopy";
import { classSessionStart } from "@/lib/classFormat";

/**
 * Cancelling one class reservation. The program's policy decides what the
 * confirmation promises about the credit; after cancelling, the buyer is told
 * what the API actually did with it.
 */
export function useCancelClassReservation(
  reservation: MyClassReservation | null,
  onCancelled: () => void,
) {
  const queryClient = useQueryClient();
  const { confirm, dialog } = useConfirm();
  const programId = reservation?.programId ?? "";

  const program = useQuery({
    queryKey: classProgramKeys.detail(programId, null),
    queryFn: () => getClassProgram(programId, false),
    enabled: Boolean(programId),
    staleTime: 5 * 60_000,
  });

  const mutation = useMutation({
    mutationFn: (id: string) => cancelClassReservation(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: myClassKeys.reservations });
      void queryClient.invalidateQueries({ queryKey: myClassKeys.passes });
      void queryClient.invalidateQueries({ queryKey: classProgramKeys.program(programId) });
    },
  });

  async function cancel() {
    if (!reservation) return;
    const copy = describeClassCancellation({
      policy: program.data?.cancellationPolicy ?? null,
      windowHours: program.data?.cancellationWindowHours ?? null,
      startsAt: classSessionStart(reservation.date, reservation.startTime),
      refundableCredit: reservation.refundableCredit,
    });
    const ok = await confirm(copy.title, copy.body, copy.confirmLabel);
    if (!ok) return;
    try {
      const result = await mutation.mutateAsync(reservation.id);
      toast.success(
        result.refunded
          ? "Reserva cancelada. La sesión volvió a tu paquete."
          : "Reserva cancelada.",
      );
      onCancelled();
    } catch (err) {
      toast.error(
        isApiError(err) ? err.message : "No se pudo cancelar la reserva. Intenta de nuevo.",
      );
    }
  }

  return { cancel, cancelling: mutation.isPending, dialog };
}
