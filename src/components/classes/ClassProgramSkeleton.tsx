import { Skeleton } from "@/components/ui/States";

export function ClassProgramSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="aspect-video w-full rounded-[28px]" />
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-28" />
      <Skeleton className="h-40" />
    </div>
  );
}
