"use client";

import { Select, SelectItem } from "@/components/ui/Select";
import type { ClassCoach } from "@/lib/api/classCoaches";

/**
 * Picks one of the comercio's active coaches, or none (`""`). A retired
 * coach still shows while it is the current value, so nothing changes by
 * just opening the list.
 */
export function ClassCoachSelect({
  coaches,
  value,
  onChange,
  noneLabel = "Sin coach",
  disabled,
  "aria-label": ariaLabel,
}: {
  coaches: ClassCoach[];
  value: string;
  onChange: (coachId: string) => void;
  noneLabel?: string;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  const options = coaches.filter((coach) => coach.active || coach.id === value);
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled} aria-label={ariaLabel}>
      <SelectItem value="">{noneLabel}</SelectItem>
      {options.map((coach) => (
        <SelectItem key={coach.id} value={coach.id}>
          {coach.active ? coach.name : `${coach.name} (retirado)`}
        </SelectItem>
      ))}
    </Select>
  );
}
