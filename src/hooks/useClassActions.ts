"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { isApiError } from "@/lib/api/client";
import {
  claimFreeClassPackage,
  classProgramKeys,
  isAlreadyClaimedError,
  myClassKeys,
  reserveClassSession,
  type ClassOccurrence,
  type ClassPackage,
} from "@/lib/api/classPrograms";
import { formatClassDate, formatClassTime, isOccurrenceElapsed } from "@/lib/classFormat";

function loginHref() {
  const next =
    typeof window !== "undefined"
      ? window.location.pathname + window.location.search
      : "/eventos";
  return `/login?next=${encodeURIComponent(next)}`;
}

function messageOf(err: unknown, fallback: string) {
  return isApiError(err) ? err.message : fallback;
}

/**
 * Picking a package and booking a session for one program. A paid package
 * goes to its checkout page; a free one is claimed here, since Paygate
 * refuses zero amounts. A guest is sent to log in and back.
 */
export function useClassActions({
  programId,
  signedIn,
  onSessionsGranted,
}: {
  programId: string;
  signedIn: boolean;
  /** Called once the buyer holds sessions, to bring the schedule into view. */
  onSessionsGranted: () => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const refreshBalance = () => {
    void queryClient.invalidateQueries({ queryKey: myClassKeys.passes });
    void queryClient.invalidateQueries({ queryKey: classProgramKeys.program(programId) });
  };

  const claim = useMutation({
    mutationFn: claimFreeClassPackage,
    onSuccess: refreshBalance,
  });

  const reserve = useMutation({
    mutationFn: reserveClassSession,
    onSettled: () => {
      refreshBalance();
      void queryClient.invalidateQueries({ queryKey: myClassKeys.reservations });
    },
  });

  async function choosePackage(item: ClassPackage) {
    if (!signedIn) {
      router.push(loginHref());
      return;
    }
    if (Number(item.price) > 0) {
      router.push(
        `/clases/${encodeURIComponent(programId)}/comprar/${encodeURIComponent(item.id)}`,
      );
      return;
    }
    // Already held: nothing to claim, go straight to booking.
    if (item.claimed) {
      onSessionsGranted();
      return;
    }
    try {
      await claim.mutateAsync(item.id);
      toast.success("Sesiones agregadas. Elige el día y la hora de tu clase.");
      onSessionsGranted();
    } catch (err) {
      // Same case as above, reached when the flag was stale.
      if (isAlreadyClaimedError(err)) {
        refreshBalance();
        onSessionsGranted();
        return;
      }
      toast.error(messageOf(err, "No se pudo agregar el paquete. Intenta de nuevo."));
    }
  }

  async function reserveOccurrence(occurrence: ClassOccurrence): Promise<boolean> {
    if (!signedIn) {
      router.push(loginHref());
      return false;
    }
    if (isOccurrenceElapsed(occurrence)) {
      toast.error("Este horario ya pasó.");
      return false;
    }
    try {
      await reserve.mutateAsync({
        programId,
        date: occurrence.date,
        startTime: occurrence.startTime,
      });
      toast.success(
        `Clase reservada: ${formatClassDate(occurrence.date)}, ${formatClassTime(occurrence.startTime)}. Tu QR está en Mis tickets.`,
      );
      return true;
    } catch (err) {
      toast.error(messageOf(err, "No se pudo reservar. Intenta de nuevo."));
      return false;
    }
  }

  return {
    choosePackage,
    reserveOccurrence,
    /** Package being claimed right now. */
    claimingPackageId: claim.isPending ? (claim.variables ?? null) : null,
    /** `date|startTime` of the slot being booked right now. */
    reservingKey:
      reserve.isPending && reserve.variables
        ? `${reserve.variables.date}|${reserve.variables.startTime}`
        : null,
  };
}
