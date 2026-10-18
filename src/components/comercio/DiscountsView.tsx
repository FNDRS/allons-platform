"use client";

import { Tag } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { useProviderDiscounts } from "@/hooks/useProviderDiscounts";
import { getProviderEvent, listProviderEvents, providerKeys } from "@/lib/api/provider";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { FieldError, Input, Label, Select, SelectItem } from "@/components/ui/Field";
import { Badge, EmptyState, ErrorState, Skeleton } from "@/components/ui/States";

const ALL_EVENTS = "";
const ALL_TICKETS = "";

export function DiscountsView() {
  const { ready } = useProviderAccess();
  const discounts = useProviderDiscounts(ready);
  const events = useQuery({
    queryKey: providerKeys.events,
    queryFn: listProviderEvents,
    enabled: ready,
  });

  const [code, setCode] = useState("");
  const [percent, setPercent] = useState("20");
  const [maxUses, setMaxUses] = useState("100");
  const [eventId, setEventId] = useState(ALL_EVENTS);
  const [ticketTypeId, setTicketTypeId] = useState(ALL_TICKETS);
  const [error, setError] = useState<string | null>(null);
  // The picked event's entries, to limit the code to one of them.
  const eventDetail = useQuery({
    queryKey: providerKeys.event(eventId),
    queryFn: () => getProviderEvent(eventId),
    enabled: ready && Boolean(eventId),
  });
  const ticketTypes = eventId ? (eventDetail.data?.ticketTypes ?? []) : [];

  function pickEvent(id: string) {
    setEventId(id);
    setTicketTypeId(ALL_TICKETS);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const trimmedCode = code.trim().toUpperCase();
    if (trimmedCode.length < 3) return setError("El código debe tener al menos 3 caracteres.");
    const percentValue = Number(percent);
    if (!Number.isFinite(percentValue) || percentValue <= 0 || percentValue > 100) {
      return setError("El porcentaje debe estar entre 1 y 100.");
    }
    const maxUsesValue = Number(maxUses);
    if (!Number.isFinite(maxUsesValue) || maxUsesValue < 1) {
      return setError("Los usos máximos deben ser un número mayor a 0.");
    }
    discounts.create.mutate(
      {
        code: trimmedCode,
        percent: Math.round(percentValue),
        maxUses: Math.round(maxUsesValue),
        eventId: eventId || null,
        ...(ticketTypeId ? { ticketTypeId } : {}),
      },
      {
        onSuccess: () => {
          setCode("");
          setPercent("20");
          setMaxUses("100");
          setEventId(ALL_EVENTS);
          setTicketTypeId(ALL_TICKETS);
        },
      },
    );
  }

  function remove(id: string, code: string) {
    if (!window.confirm(`¿Eliminar el código ${code}? No se puede deshacer.`)) return;
    discounts.remove.mutate(id);
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <SectionTitle>Crear código</SectionTitle>
        <Card>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <p className="text-sm text-white/60">
              Compártelo con tus compradores; en el checkout lo aplican y ven el
              precio rebajado en el momento.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block">
                <Label>Código</Label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="HOCE20"
                  maxLength={64}
                  autoCapitalize="characters"
                  className="tracking-[0.06em]"
                />
              </label>
              <label className="block">
                <Label>Porcentaje</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={100}
                  value={percent}
                  onChange={(e) => setPercent(e.target.value)}
                />
              </label>
              <label className="block">
                <Label>Usos máximos</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="block">
                <Label>Evento</Label>
                <Select
                  value={eventId}
                  onValueChange={pickEvent}
                  placeholder="Todos los eventos"
                  aria-label="Evento"
                >
                  <SelectItem value={ALL_EVENTS}>Todos los eventos</SelectItem>
                  {(events.data ?? []).map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div className="block">
                <Label>Entrada</Label>
                <Select
                  value={ticketTypeId}
                  onValueChange={setTicketTypeId}
                  placeholder={eventId ? "Todas las entradas" : "Elige un evento primero"}
                  aria-label="Entrada"
                  disabled={!eventId || ticketTypes.length === 0}
                >
                  <SelectItem value={ALL_TICKETS}>Todas las entradas</SelectItem>
                  {ticketTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>
            {ticketTypeId ? (
              <p className="text-sm text-white/50">
                Con una entrada elegida, el código vale por un boleto en cada uso y
                puede usar los lugares que esa entrada guarda para códigos.
              </p>
            ) : null}
            <FieldError>{error}</FieldError>
            <Button type="submit" loading={discounts.create.isPending} className="self-start">
              <Tag className="size-4" /> Crear código
            </Button>
          </form>
        </Card>
      </section>

      <section>
        <SectionTitle>Tus códigos</SectionTitle>
        {discounts.isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-20" />
            ))}
          </div>
        ) : discounts.error ? (
          <ErrorState
            message={(discounts.error as Error).message}
            onRetry={() => void discounts.refetch()}
          />
        ) : discounts.discounts.length === 0 ? (
          <EmptyState
            title="Todavía no hay códigos"
            body="Crea uno arriba para ofrecer un descuento en el checkout."
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {discounts.discounts.map((discount) => {
              const exhausted = discount.uses >= discount.maxUses;
              return (
              <Card
                key={discount.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold tracking-tight">
                    {discount.code}
                    <span className="ml-2 font-medium text-white/40">
                      -{discount.percent}%
                    </span>
                  </p>
                  <p className="truncate text-sm text-white/50">
                    {discount.eventTitle ?? "Todos los eventos"}
                    {discount.ticketTypeName ? ` · ${discount.ticketTypeName}` : ""} ·{" "}
                    {discount.uses === 0
                      ? "sin usar"
                      : `usado ${discount.uses} ${discount.uses === 1 ? "vez" : "veces"}`}{" "}
                    ({discount.uses}/{discount.maxUses})
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
                  {exhausted ? <Badge tone="warn">Agotado</Badge> : null}
                  <Badge tone={discount.active ? "accent" : "neutral"}>
                    {discount.active ? "Activo" : "Inactivo"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={
                      discounts.toggleActive.isPending &&
                      discounts.toggleActive.variables?.id === discount.id
                    }
                    onClick={() =>
                      discounts.toggleActive.mutate({
                        id: discount.id,
                        active: !discount.active,
                      })
                    }
                  >
                    {discount.active ? "Desactivar" : "Activar"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={
                      discounts.remove.isPending &&
                      discounts.remove.variables === discount.id
                    }
                    onClick={() => remove(discount.id, discount.code)}
                  >
                    Eliminar
                  </Button>
                </div>
              </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
