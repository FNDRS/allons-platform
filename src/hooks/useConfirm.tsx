"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

type Pending = {
  title: string;
  body: string;
  confirmLabel: string;
  resolve: (ok: boolean) => void;
};

/**
 * A promise-based confirmation in the app's own modal, instead of the
 * browser's `confirm()`. Render `dialog` once; `confirm()` resolves to
 * whether the person accepted.
 */
export function useConfirm() {
  const [pending, setPending] = useState<Pending | null>(null);

  const confirm = useCallback(
    (title: string, body: string, confirmLabel = "Confirmar") =>
      new Promise<boolean>((resolve) =>
        setPending({ title, body, confirmLabel, resolve }),
      ),
    [],
  );

  const close = (ok: boolean) => {
    pending?.resolve(ok);
    setPending(null);
  };

  const dialog = (
    <Modal
      open={Boolean(pending)}
      onClose={() => close(false)}
      title={pending?.title ?? ""}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => close(false)}>
            Cancelar
          </Button>
          <Button variant="danger" size="sm" onClick={() => close(true)}>
            {pending?.confirmLabel}
          </Button>
        </div>
      }
    >
      <p className="text-[14px] leading-6 text-white/70">{pending?.body}</p>
    </Modal>
  );

  return { confirm, dialog };
}
