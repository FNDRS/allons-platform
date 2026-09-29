import { AppShell } from "@/components/app/AppShell";
import { ReserveSkeleton } from "@/components/reserve/ReserveSkeleton";

export default function ReserveLoading() {
  return (
    <AppShell width="narrow">
      <ReserveSkeleton />
    </AppShell>
  );
}
