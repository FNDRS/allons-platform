import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PublicResourceGroup } from "@/lib/api/events";

type SelectedByGroup = Record<string, string[]>;

const EMPTY_GROUPS: PublicResourceGroup[] = [];

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
  const groups = input.groups ?? EMPTY_GROUPS;
  const groupsKey = groups.map((group) => group.id).join("|");
  const [selected, setSelected] = useState<SelectedByGroup>({});
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const availableByGroup = useMemo(
    () =>
      new Map(
        groups.map((group) => [
          group.id,
          new Set(
            group.resources
              .filter((resource) => !resource.taken)
              .map((resource) => resource.id),
          ),
        ]),
      ),
    [groups],
  );

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
      if (!availableByGroup.get(groupId)?.has(resourceId)) return flatten(prev);
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
    [availableByGroup, input.quantity],
  );

  useEffect(() => {
    setSelected((prev) => {
      let changed = false;
      const cap = Math.max(input.quantity, 0);
      const next: SelectedByGroup = {};
      for (const group of groups) {
        const available = availableByGroup.get(group.id) ?? new Set<string>();
        const current = prev[group.id] ?? [];
        const kept = cap > 0
          ? current.filter((id) => available.has(id)).slice(0, cap)
          : [];
        next[group.id] = kept;
        if (
          !(group.id in prev) ||
          kept.length !== current.length ||
          kept.some((id, index) => id !== current[index])
        ) {
          changed = true;
        }
      }
      if (Object.keys(prev).some((groupId) => !availableByGroup.has(groupId))) {
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [availableByGroup, groups, input.quantity]);

  const selectedIds = useMemo(
    () =>
      groups.flatMap((group) => {
        const available = availableByGroup.get(group.id) ?? new Set<string>();
        return (selected[group.id] ?? []).filter((id) => available.has(id));
      }),
    [availableByGroup, groups, selected],
  );

  const resourcesReady = useMemo(() => {
    if (groups.length === 0) return true;
    if (input.quantity <= 0) return false;
    return groups.every((group) => {
      const available = availableByGroup.get(group.id) ?? new Set<string>();
      const count = (selected[group.id] ?? []).filter((id) =>
        available.has(id),
      ).length;
      if (group.required) return count === input.quantity;
      return count === 0 || count === input.quantity;
    });
  }, [availableByGroup, groups, input.quantity, selected]);

  const missingGroupName = useMemo(() => {
    if (groups.length === 0 || input.quantity <= 0) return null;
    const missing = groups.find((group) => {
      const available = availableByGroup.get(group.id) ?? new Set<string>();
      const count = (selected[group.id] ?? []).filter((id) =>
        available.has(id),
      ).length;
      if (group.required) return count !== input.quantity;
      return count !== 0 && count !== input.quantity;
    });
    return missing?.name ?? null;
  }, [availableByGroup, groups, input.quantity, selected]);

  return {
    hasGroups: groups.length > 0,
    selectedIds,
    selected,
    resourcesReady,
    missingGroupName,
    toggle,
  };
}
