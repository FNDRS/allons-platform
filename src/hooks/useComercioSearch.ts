"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  COMERCIO_SEARCH_MIN_LENGTH,
  comercioKeys,
  searchComercios,
} from "@/lib/api/comercios";

const DEBOUNCE_MS = 250;

/**
 * Comercios matching the listing's search. Unlike events and classes this
 * hits the API, so it waits for the user to pause typing.
 */
export function useComercioSearch(search: string) {
  const [term, setTerm] = useState(() => search.trim());

  useEffect(() => {
    const timer = setTimeout(() => setTerm(search.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const enabled = term.length >= COMERCIO_SEARCH_MIN_LENGTH;
  const query = useQuery({
    queryKey: comercioKeys.search(term.toLowerCase()),
    queryFn: () => searchComercios(term),
    enabled,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });

  const active = search.trim().length >= COMERCIO_SEARCH_MIN_LENGTH;
  return {
    comercios: active && enabled ? (query.data ?? []) : [],
    loading: active && (!enabled || query.isLoading),
  };
}
