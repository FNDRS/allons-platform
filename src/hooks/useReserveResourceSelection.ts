import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PublicResourceGroup } from "@/lib/api/events";

type SelectedByGroup = Record<string, string[]>;

function emptyByGroup(groups: PublicResourceGroup[]): SelectedByGroup {
  return Object.fromEntries(groups.map((group) => [group.id, []]));
}

function flatten(selected: SelectedByGroup): string[] {
  return Object.values(selected).flat();
}

/**
 * Bike/seat picks on Reservar. One unit per ticket per required group.
 */
export function useReserveResourceSelection(input: {
  groups: PublicResourceGroup[] | undefined;
  quantity: number;
}) {
  const groups = input.groups ?? [];
  const groupsKey = groups.map((group) => group.id).join("|");
  const [selected, setSelected] = useState<SelectedByGroup>({});
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  useEffect(() => {
    setSelected(emptyByGroup(groups));
    // Reset only when the set of groups changes, not on every map refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupsKey]);

  useEffect(() => {
    if (input.quantity <= 0) return;
    setSelected((prev) => {
      let changed = false;
      const next: SelectedByGroup = { ...prev };
      for (const group of groups) {
        const current = prev[group.id] ?? [];
        if (current.length <= input.quantity) continue;
        next[group.id] = current.slice(0, input.quantity);
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [groups, input.quantity]);

  const toggle = useCallback(
    (groupId: string, resourceId: string) => {
      const cap = Math.max(input.quantity, 1);
      const prev = selectedRef.current;
      const current = prev[groupId] ?? [];
      let next: SelectedByGroup;
      if (current.includes(resourceId)) {
        if (cap <= 1) return flatten(prev);
        next = {
          ...prev,
          [groupId]: current.filter((id) => id !== resourceId),
        };
      } else if (cap <= 1) {
        next = { ...prev, [groupId]: [resourceId] };
      } else if (current.length >= cap) {
        next = {
          ...prev,
          [groupId]: [...current.slice(1), resourceId],
        };
      } else {
        next = { ...prev, [groupId]: [...current, resourceId] };
      }
      selectedRef.current = next;
      setSelected(next);
      return flatten(next);
    },
    [input.quantity],
  );

  const selectedIds = useMemo(() => flatten(selected), [selected]);

  const resourcesReady = useMemo(() => {
    if (groups.length === 0) return true;
    if (input.quantity <= 0) return false;
    return groups.every((group) => {
      const count = (selected[group.id] ?? []).length;
      if (group.required) return count === input.quantity;
      return count === 0 || count === input.quantity;
    });
  }, [groups, input.quantity, selected]);

  const missingGroupName = useMemo(() => {
    if (groups.length === 0 || input.quantity <= 0) return null;
    const missing = groups.find((group) => {
      const count = (selected[group.id] ?? []).length;
      if (group.required) return count !== input.quantity;
      return count !== 0 && count !== input.quantity;
    });
    return missing?.name ?? null;
  }, [groups, input.quantity, selected]);

  return {
    hasGroups: groups.length > 0,
    selectedIds,
    selected,
    resourcesReady,
    missingGroupName,
    toggle,
  };
}
