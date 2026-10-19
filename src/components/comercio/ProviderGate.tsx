"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Store } from "lucide-react";
import { useAuth } from "@/components/app/AuthProvider";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { isScannerOnlyUser, SCANNER_PATH } from "@/lib/role";
import { Button } from "@/components/ui/Button";
import { ErrorState, Skeleton } from "@/components/ui/States";

/**
 * Renders children only for comercio members; explains otherwise. Door
 * staff get the scanner page and nothing else: any other comercio URL
 * sends them there.
 */
export function ProviderGate({ children }: { children: React.ReactNode }) {
  const { loading, forbidden, error, refetch } = useProviderAccess();
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const scanner = !loading && isScannerOnlyUser(user);
  const onScanner = pathname === SCANNER_PATH;
  useEffect(() => {
    if (scanner && !onScanner) router.replace(SCANNER_PATH);
  }, [scanner, onScanner, router]);

  if (scanner && onScanner) return <>{children}</>;
  if (loading || scanner) {
    return (
      <div className="app-canvas flex min-h-dvh flex-col gap-4 px-6 py-16 text-white">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-28" />
        <Skeleton className="h-64" />
      </div>
    );
  }
  if (forbidden) {
    return (
      <div className="app-canvas flex min-h-dvh flex-col items-center justify-center px-6 text-center text-white">
        <Store className="size-8 text-white/35" aria-hidden />
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">
          Tu cuenta no es de un comercio
        </h1>
        <p className="mt-2 max-w-sm text-sm text-white/55">
          Esta sección es para organizadores. Entra con la cuenta del comercio
          si vendes eventos con Allons.
        </p>
        <Link href="/eventos" className="mt-6">
          <Button variant="secondary">Ver eventos</Button>
        </Link>
      </div>
    );
  }
  if (error) return <ErrorState message={error.message} onRetry={() => void refetch()} />;
  return <>{children}</>;
}
