"use client";

import { UserPlus } from "lucide-react";
import { useState } from "react";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { useStaff } from "@/hooks/useStaff";
import type { StaffRole } from "@/lib/api/provider";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { FieldError, Input, Label, Select, SelectItem } from "@/components/ui/Field";
import { Badge, EmptyState, ErrorState, Skeleton } from "@/components/ui/States";

const ROLE_LABEL: Record<string, string> = { scanner: "Escáner", admin: "Administrador" };

export function StaffView() {
  const { ready } = useProviderAccess();
  const staff = useStaff(ready);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("scanner");
  const [error, setError] = useState<string | null>(null);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Escribe el nombre.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Correo inválido.");
    staff.invite.mutate(
      { name: name.trim(), email: email.trim(), role },
      {
        onSuccess: () => {
          setName("");
          setEmail("");
        },
      },
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <SectionTitle>Invitar</SectionTitle>
        <Card>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <p className="text-sm text-white/60">
              La persona recibe un correo para crear su acceso y entra a la app de Allons como
              staff de tu comercio. Un <strong className="text-white">escáner</strong> valida
              tickets en la puerta; un <strong className="text-white">administrador</strong>{" "}
              además gestiona eventos y ve las ventas.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block">
                <Label>Nombre</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" />
              </label>
              <label className="block">
                <Label>Correo</Label>
                <Input type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" />
              </label>
              <div className="block">
                <Label>Rol</Label>
                <Select
                  value={role}
                  onValueChange={(next) => setRole(next as StaffRole)}
                  aria-label="Rol"
                >
                  <SelectItem value="scanner">Escáner</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </Select>
              </div>
            </div>
            <FieldError>{error}</FieldError>
            <Button type="submit" loading={staff.invite.isPending} className="self-start">
              <UserPlus className="size-4" /> Enviar invitación
            </Button>
          </form>
        </Card>
      </section>

      <section>
        <SectionTitle>Equipo</SectionTitle>
        {staff.isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-20" />
            ))}
          </div>
        ) : staff.error ? (
          <ErrorState message={(staff.error as Error).message} onRetry={() => void staff.refetch()} />
        ) : staff.members.length === 0 ? (
          <EmptyState title="Todavía no hay staff" body="Invita a quien va a escanear tickets en la entrada." />
        ) : (
          <div className="flex flex-col gap-2.5">
            {staff.members.map((member) => (
              <Card key={member.userId} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold tracking-tight">{member.name ?? member.email ?? "Sin nombre"}</p>
                  <p className="truncate text-sm text-white/50">{member.email ?? "—"}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
                  <Badge tone={member.active ? "accent" : "neutral"}>
                    {ROLE_LABEL[member.role] ?? member.role}
                    {member.active ? "" : " · inactivo"}
                  </Badge>
                  {member.active ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={staff.remove.isPending && staff.remove.variables === member.userId}
                      onClick={() => staff.remove.mutate(member.userId)}
                    >
                      Desactivar
                    </Button>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
