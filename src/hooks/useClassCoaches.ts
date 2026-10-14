"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { classProgramErrorMessage } from "@/hooks/useProviderClassPrograms";
import {
  classCoachKeys,
  createClassCoach,
  listClassCoaches,
  updateClassCoach,
  type ClassCoach,
  type ClassCoachInput,
} from "@/lib/api/classCoaches";
import { classScheduleKeys } from "@/lib/api/classSchedule";
import { providerClassProgramKeys } from "@/lib/api/providerClassPrograms";

/** The comercio's coaches, active first and then by name. */
export function useClassCoaches() {
  const { ready } = useProviderAccess();
  const query = useQuery({
    queryKey: classCoachKeys.all,
    queryFn: listClassCoaches,
    enabled: ready,
  });
  const coaches: ClassCoach[] = [...(query.data ?? [])].sort(
    (a, b) => Number(b.active) - Number(a.active) || a.name.localeCompare(b.name, "es"),
  );
  return {
    coaches,
    activeCoaches: coaches.filter((coach) => coach.active),
    isLoading: !ready || query.isLoading,
    error: query.error ? classProgramErrorMessage(query.error) : null,
    refetch: () => void query.refetch(),
  };
}

type SaveInput = { id: string | null; body: ClassCoachInput };

/** Create, edit, retire and reactivate coaches. */
export function useClassCoachActions() {
  const client = useQueryClient();
  const invalidate = () =>
    Promise.all([
      client.invalidateQueries({ queryKey: classCoachKeys.all }),
      // A rename shows up on every slot and program that uses the coach.
      client.invalidateQueries({ queryKey: classScheduleKeys.all }),
      client.invalidateQueries({ queryKey: providerClassProgramKeys.all }),
    ]);

  const save = useMutation({
    mutationFn: ({ id, body }: SaveInput) =>
      id ? updateClassCoach(id, body) : createClassCoach(body),
    onSuccess: (coach, { id }) => {
      toast.success(id ? `Guardamos los cambios de ${coach.name}.` : `${coach.name} ya está en tu equipo.`);
      return invalidate();
    },
    onError: (error) => toast.error(classProgramErrorMessage(error)),
  });

  const setActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      updateClassCoach(id, { active }),
    onSuccess: (coach) => {
      toast.success(coach.active ? `${coach.name} está activo de nuevo.` : `${coach.name} quedó retirado.`);
      return invalidate();
    },
    onError: (error) => toast.error(classProgramErrorMessage(error)),
  });

  return {
    /** Resolves to whether it saved, so the editor knows when to close. */
    save: (input: SaveInput) =>
      save.mutateAsync(input).then(
        () => true,
        () => false,
      ),
    saving: save.isPending,
    setActive: (id: string, active: boolean) => setActive.mutate({ id, active }),
    togglingId: setActive.isPending ? setActive.variables?.id ?? null : null,
  };
}
