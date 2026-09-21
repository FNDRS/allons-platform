"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/app/AuthProvider";
import { usesLocalApi } from "@/lib/api/client";
import { providerKeys } from "@/lib/api/provider";
import { uniqueChannelTopic } from "@/lib/realtime";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export type LiveState = "idle" | "connecting" | "open" | "closed" | "error";

const CHANNEL_PREFIX = "comercio-realtime";

function dropStaleChannels(
  supabase: ReturnType<typeof getSupabaseBrowser>,
): void {
  for (const channel of supabase.getChannels()) {
    if (channel.topic.startsWith(`realtime:${CHANNEL_PREFIX}`)) {
      void supabase.removeChannel(channel);
    }
  }
}

/**
 * Live comercio data: one Supabase Realtime channel per signed-in member
 * that invalidates the panel's queries as the writes behind them land, so a
 * sale shows up without anyone reloading.
 *
 * The tables are the same four the app subscribes to, published by the
 * `provider_realtime_rls` migration. Row-level security scopes every one of
 * them to the caller's own comercio, and `payment_orders_broadcast` carries
 * sanitized columns so no Paygate identifier travels over the socket. The
 * payloads are only a signal to refetch: every number still comes from the
 * API, which is what authorizes it.
 *
 * Mount once, in `ComercioShell`.
 */
export function useProviderRealtime(enabled: boolean): LiveState {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const queryClientRef = useRef(queryClient);
  queryClientRef.current = queryClient;

  const [state, setState] = useState<LiveState>("idle");
  const channelRef = useRef<RealtimeChannel | null>(null);

  const userId = session?.user?.id;
  const accessToken = session?.access_token;

  useEffect(() => {
    // A local API writes to a local database, which Realtime cannot observe.
    // Staying idle there keeps the fallback polling on and the badge honest.
    if (!enabled || !userId || !accessToken || usesLocalApi()) {
      setState("idle");
      return;
    }

    let supabase: ReturnType<typeof getSupabaseBrowser>;
    try {
      supabase = getSupabaseBrowser();
    } catch {
      setState("error");
      return;
    }

    dropStaleChannels(supabase);
    if (channelRef.current) {
      void supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    setState("connecting");
    let cancelled = false;

    const invalidate = (key: readonly unknown[]) =>
      void queryClientRef.current.invalidateQueries({ queryKey: key });
    // Every event key is nested under the list key, so one call refreshes
    // the list, the open event, its hourly series and its payments.
    const refreshEvents = () => invalidate(providerKeys.events);
    const refreshDashboard = () => invalidate(providerKeys.dashboard);

    const open = () =>
      supabase
        .channel(uniqueChannelTopic(`${CHANNEL_PREFIX}-${userId}`))
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "tickets" },
          () => {
            refreshDashboard();
            refreshEvents();
            invalidate(providerKeys.activity);
          },
        )
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "provider_activity_log" },
          () => {
            invalidate(providerKeys.activity);
            refreshDashboard();
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "provider_event_ticket_types",
          },
          () => {
            refreshDashboard();
            refreshEvents();
          },
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "payment_orders_broadcast",
          },
          () => {
            refreshDashboard();
            refreshEvents();
          },
        )
        .subscribe((status) => {
          switch (status) {
            case "SUBSCRIBED":
              setState("open");
              break;
            case "CLOSED":
              setState("closed");
              break;
            case "CHANNEL_ERROR":
            case "TIMED_OUT":
              setState("error");
              break;
          }
        });

    // `setAuth` resolves before the channel joins, so it never joins with a
    // token the session has already replaced.
    void supabase.realtime
      .setAuth(accessToken)
      .catch(() => undefined)
      .then(() => {
        if (cancelled) return;
        channelRef.current = open();
      });

    return () => {
      cancelled = true;
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setState("closed");
    };
  }, [accessToken, enabled, userId]);

  return state;
}
