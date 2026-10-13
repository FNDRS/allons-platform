"use client";

import { useState, type Dispatch, type SetStateAction } from "react";

/**
 * Tracks which drafts already exist on the server, so an edit can be turned
 * into creates, updates and removals. This is state rather than a memo of
 * the initial rows: a save that fails halfway still wrote part of its
 * changes, and a retry must patch those instead of writing them twice.
 */
export function useDraftPersistence<T extends { id: string }>(
  initialIds: string[],
  setDrafts: Dispatch<SetStateAction<T[]>>,
) {
  const [persistedIds, setPersistedIds] = useState<Set<string>>(() => new Set(initialIds));

  /** A new draft reached the server: adopt its id so a retry patches it. */
  const markPersisted = (draftId: string, serverId: string) => {
    setDrafts((current) =>
      current.map((item) => (item.id === draftId ? { ...item, id: serverId } : item)),
    );
    setPersistedIds((current) => new Set(current).add(serverId));
  };

  /** A removal reached the server: a retry must not remove it again. */
  const markDeleted = (serverId: string) => {
    setPersistedIds((current) => {
      const next = new Set(current);
      next.delete(serverId);
      return next;
    });
  };

  /** What has to happen on the server for the saved rows to match the drafts. */
  const diff = <P,>(drafts: T[], toPayload: (draft: T, index: number) => P) => {
    const indexed = drafts.map((draft, index) => ({ draft, index }));
    return {
      create: indexed
        .filter(({ draft }) => !persistedIds.has(draft.id))
        .map(({ draft, index }) => ({ draftId: draft.id, payload: toPayload(draft, index) })),
      update: indexed
        .filter(({ draft }) => persistedIds.has(draft.id))
        .map(({ draft, index }) => ({ id: draft.id, payload: toPayload(draft, index) })),
      removeIds: [...persistedIds].filter((id) => !drafts.some((draft) => draft.id === id)),
    };
  };

  return { markPersisted, markDeleted, diff };
}
