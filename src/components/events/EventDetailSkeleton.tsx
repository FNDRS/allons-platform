import { Skeleton } from "@/components/ui/States";

/** Shape of the event page while it loads; also the route's loading state. */
export function EventDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="aspect-[16/10] rounded-[28px]" />
      <Skeleton className="h-16" />
      <Skeleton className="h-24" />
    </div>
  );
}

/** The sections below the hero, while only the list data is in hand. */
export function EventDetailBodySkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-16" />
      <Skeleton className="h-24" />
    </div>
  );
}
