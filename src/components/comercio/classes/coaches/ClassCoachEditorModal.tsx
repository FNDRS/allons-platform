"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import type { ClassCoach, ClassCoachInput } from "@/lib/api/classCoaches";
import { ClassFormField } from "../ClassFormField";

/** Name and bio of a new or existing coach. Mount it per edit: it seeds from `coach` once. */
export function ClassCoachEditorModal({
  open,
  coach,
  saving,
  onClose,
  onSave,
}: {
  open: boolean;
  coach: ClassCoach | null;
  saving: boolean;
  onClose: () => void;
  onSave: (body: ClassCoachInput) => void;
}) {
  const [name, setName] = useState(coach?.name ?? "");
  const [bio, setBio] = useState(coach?.bio ?? "");
  const canSave = name.trim().length > 0 && !saving;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={coach ? "Editar coach" : "Nuevo coach"}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            size="sm"
            loading={saving}
            disabled={!canSave}
            onClick={() => onSave({ name: name.trim(), bio: bio.trim() || null })}
          >
            Guardar
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <ClassFormField
          label="Nombre"
          hint={coach ? "Si cambias el nombre, se actualiza en todos sus horarios." : undefined}
        >
          {(id) => (
            <Input
              id={id}
              placeholder="Ej. Andrea Pineda"
              value={name}
              maxLength={80}
              onChange={(e) => setName(e.target.value)}
            />
          )}
        </ClassFormField>
        <ClassFormField label="Bio" hint="Opcional. Lo que tus clientes deben saber de este coach.">
          {(id) => (
            <Textarea
              id={id}
              rows={4}
              placeholder="Especialidad, certificaciones, estilo de clase"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          )}
        </ClassFormField>
      </div>
    </Modal>
  );
}
