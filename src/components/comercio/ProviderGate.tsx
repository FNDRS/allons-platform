"use client";

import Link from "next/link";
import { Store } from "lucide-react";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { Button } from "@/components/ui/Button";
import { ErrorState, Skeleton } from "@/components/ui/States";

/** Renders children only for comercio members; explains otherwise. */
export function ProviderGate({ children }: { children: React.ReactNode }) {
  const { loading, forbidden, error, refetch } = useProviderAccess();
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-28" />
        <Skeleton className="h-64" />
      </div>
    );
  }
  if (forbidden) {
    return (
      <div className="flex flex-col items-center rounded-[22px] border border-white/10 px-6 py-14 text-center">
        <Store className="size-8 text-white/35" aria-hidden />
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Tu cuenta no es de un comercio</h1>
        <p className="mt-2 max-w-sm text-sm text-white/55">
          Esta sección es para organizadores. Si vendes eventos con Allons, entra con la cuenta
          del comercio.
        </p>
        <Link href="/events" className="mt-6">
          <Button variant="secondary">Ver eventos</Button>
        </Link>
      </div>
    );
  }
  if (error) return <ErrorState message={error.message} onRetry={() => void refetch()} />;
  return <>{children}</>;
}
