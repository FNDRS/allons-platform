import { ComercioShell } from "@/components/comercio/ComercioShell";
import { Skeleton } from "@/components/ui/States";

/** Route-level loading state so the shell paints at once on navigation. */
export default function ComercioEventLoading() {
  return (
    <ComercioShell>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-28" />
        <Skeleton className="h-64" />
      </div>
    </ComercioShell>
  );
}
