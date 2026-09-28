"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProviderBillingInfo,
  providerKeys,
  updateProviderBillingInfo,
  type ProviderBillingInfo,
} from "@/lib/api/provider";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { FieldError, Input, Label } from "@/components/ui/Field";
import { Skeleton } from "@/components/ui/States";

type BillingFormKey = keyof ProviderBillingInfo;

/**
 * Where the comercio's settlement PDF gets its "se transfiere a" details
 * from. Self-service on purpose: the comercio knows its own RTN and bank
 * account, the platform shouldn't be guessing or entering it on their
 * behalf.
 */
export function ProviderBillingForm() {
  const queryClient = useQueryClient();
  const info = useQuery({
    queryKey: providerKeys.billingInfo,
    queryFn: getProviderBillingInfo,
  });
  const [form, setForm] = useState<Record<string, string>>({});
  const [savedJustNow, setSavedJustNow] = useState(false);

  useEffect(() => {
    if (!info.data) return;
    setForm({
      legalName: info.data.legalName ?? "",
      taxId: info.data.taxId ?? "",
      address: info.data.address ?? "",
      bankName: info.data.bankName ?? "",
      bankAccountNumber: info.data.bankAccountNumber ?? "",
      bankAccountType: info.data.bankAccountType ?? "",
    });
  }, [info.data]);

  const save = useMutation({
    mutationFn: (patch: Partial<ProviderBillingInfo>) =>
      updateProviderBillingInfo(patch),
    onSuccess: (updated) => {
      queryClient.setQueryData(providerKeys.billingInfo, updated);
      setSavedJustNow(true);
      setTimeout(() => setSavedJustNow(false), 2000);
    },
  });

  function field(key: BillingFormKey, label: string, placeholder = "") {
    return (
      <label className="block">
        <Label>{label}</Label>
        <Input
          value={form[key] ?? ""}
          onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
          placeholder={placeholder}
        />
      </label>
    );
  }

  return (
    <section>
      <SectionTitle>Datos de facturación</SectionTitle>
      <Card>
        {info.isLoading ? (
          <Skeleton className="h-40" />
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate({
                legalName: form.legalName,
                taxId: form.taxId,
                address: form.address,
                bankName: form.bankName,
                bankAccountNumber: form.bankAccountNumber,
                bankAccountType: form.bankAccountType,
              });
            }}
            className="flex flex-col gap-4"
          >
            <p className="text-sm text-white/60">
              Con qué nombre, RTN y cuenta bancaria aparecen en el comprobante de
              liquidación de cada evento.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {field("legalName", "Nombre legal / razón social")}
              {field("taxId", "RTN")}
            </div>
            {field("address", "Dirección fiscal")}
            <div className="grid gap-3 sm:grid-cols-3">
              {field("bankName", "Banco")}
              {field("bankAccountType", "Tipo de cuenta", "Ahorro / Cheques")}
              {field("bankAccountNumber", "Número de cuenta")}
            </div>
            <FieldError>
              {save.isError ? (save.error as Error).message : null}
            </FieldError>
            <div className="flex items-center gap-3">
              <Button type="submit" loading={save.isPending} className="self-start">
                Guardar
              </Button>
              {savedJustNow ? (
                <span className="text-sm text-white/50">Guardado.</span>
              ) : null}
            </div>
          </form>
        )}
      </Card>
    </section>
  );
}
