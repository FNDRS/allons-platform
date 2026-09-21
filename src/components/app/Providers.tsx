"use client";

import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { AuthProvider, useAuth } from "./AuthProvider";
import { AuthReturnTo } from "./AuthReturnTo";

/**
 * Private query keys are not scoped by user, so the cache must not outlive
 * the account that filled it: drop everything whenever the signed-in user
 * changes, including on sign-out.
 */
function CacheResetOnUserChange() {
  const client = useQueryClient();
  const { user, loading } = useAuth();
  const previous = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (loading) return;
    const current = user?.id ?? null;
    if (previous.current !== undefined && previous.current !== current) {
      client.clear();
    }
    previous.current = current;
  }, [client, user?.id, loading]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: (count, error) => {
              const status = (error as { status?: number }).status;
              if (status && status >= 400 && status < 500) return false;
              return count < 2;
            },
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        <AuthReturnTo />
        <CacheResetOnUserChange />
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}
