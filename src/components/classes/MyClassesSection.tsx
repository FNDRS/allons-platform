"use client";

import { useState } from "react";
import { useMyClasses } from "@/hooks/useMyClasses";
import type { MyClassReservation } from "@/lib/api/classPrograms";
import { SectionTitle } from "@/components/ui/Card";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { ClassPassCard } from "./ClassPassCard";
import { ClassReservationCard } from "./ClassReservationCard";
import { ClassReservationModal } from "./ClassReservationModal";

/**
 * The buyer's classes in Mis tickets: booked sessions with their QR, and the
 * passes that still have sessions to book. Hidden when there are none.
 */
export function MyClassesSection({ enabled }: { enabled: boolean }) {
  const { passes, reservations, loading, error, refetch } = useMyClasses(enabled);
  const [openId, setOpenId] = useState<string | null>(null);
  const open: MyClassReservation | null =
    reservations.find((item) => item.id === openId) ?? null;

  if (!enabled || loading) {
    return enabled ? <Skeleton className="mb-10 h-24 w-full rounded-[22px]" /> : null;
  }
  if (error) {
    return (
      <div className="mb-10">
        <ErrorState message={error.message} onRetry={refetch} />
      </div>
    );
  }
  if (passes.length === 0 && reservations.length === 0) return null;

  return (
    <div className="mb-10 flex flex-col gap-10">
      {reservations.length > 0 ? (
        <section>
          <SectionTitle>Próximas clases</SectionTitle>
          <div className="flex flex-col gap-2.5">
            {reservations.map((reservation) => (
              <ClassReservationCard
                key={reservation.id}
                reservation={reservation}
                onOpen={() => setOpenId(reservation.id)}
              />
            ))}
          </div>
        </section>
      ) : null}
      {passes.length > 0 ? (
        <section>
          <SectionTitle>Tus paquetes de clases</SectionTitle>
          <div className="flex flex-col gap-2.5">
            {passes.map((pass) => (
              <ClassPassCard key={pass.id} pass={pass} />
            ))}
          </div>
        </section>
      ) : null}
      <ClassReservationModal reservation={open} onClose={() => setOpenId(null)} />
    </div>
  );
}
