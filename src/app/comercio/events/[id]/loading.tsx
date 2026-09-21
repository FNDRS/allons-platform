import { Skeleton } from "@/components/ui/States";

/** Route-level loading state: the shell comes from the layout and stays put. */
export default function ComercioEventLoading() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-28" />
      <Skeleton className="h-64" />
    </div>
  );
}
