import { Skeleton } from "@/components/ui/States";

/** Shape of the reserve page while the event loads; also the route's loading state. */
export function ReserveSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-24" />
      <Skeleton className="h-40" />
    </div>
  );
}
