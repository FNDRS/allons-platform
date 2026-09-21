"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ExternalLink, Plus } from "lucide-react";
import type { CardCheckout } from "@/hooks/useCardCheckout";
import { StepHeading } from "@/components/reserve/ReserveSections";
import { Skeleton } from "@/components/ui/States";
import { CardForm } from "./CardForm";
import { OptionRow, SavedCardRow } from "./SavedCardRow";

/**
 * Step "Pago": saved cards, a new card, or the hosted Paygate page. Renders
 * nothing while the deployment has saved cards switched off, so the flow
 * degrades to the hosted page without a gap in the numbering.
 */
export function PaymentMethodStep({
  step,
  checkout,
}: {
  step: number;
  checkout: CardCheckout;
}) {
  const reduce = useReducedMotion();
  if (checkout.loading) {
    return (
      <section>
        <StepHeading n={step}>Pago</StepHeading>
        <Skeleton className="h-16" />
      </section>
    );
  }
  // Nothing to offer beyond the hosted page: keep the flow as it was.
  if (!checkout.available) return null;
  if (checkout.cards.length === 0 && !checkout.enrollmentEnabled) return null;

  const cardSelected = checkout.method === "card";
  const showForm = cardSelected && checkout.usingNewCard;

  return (
    <section>
      <StepHeading n={step} hint="Cifrado de extremo a extremo">
        Pago
      </StepHeading>
      <div role="radiogroup" aria-label="Método de pago" className="flex flex-col gap-2.5">
        {checkout.cards.map((card) => (
          <SavedCardRow
            key={card.id}
            card={card}
            selected={cardSelected && checkout.choice === card.id}
            disabled={checkout.submitting}
            onSelect={() => {
              checkout.setMethod("card");
              checkout.setChoice(card.id);
            }}
          />
        ))}

        {checkout.enrollmentEnabled ? (
          <OptionRow
            selected={showForm}
            disabled={checkout.submitting}
            onSelect={() => {
              checkout.setMethod("card");
              checkout.setChoice("new");
            }}
            leading={<Plus className="size-4 text-white/70" strokeWidth={2} aria-hidden />}
            title={checkout.cards.length ? "Otra tarjeta" : "Tarjeta de crédito o débito"}
            subtitle="Pagas aquí mismo, sin salir de Allons"
          />
        ) : null}

        <AnimatePresence initial={false}>
          {showForm ? (
            <motion.div
              key="card-form"
              initial={reduce ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reduce ? undefined : { opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              className="overflow-hidden"
            >
              <div className="rounded-[22px] border border-border bg-surface p-4 pt-6 sm:p-6">
                <CardForm
                  draft={checkout.draft}
                  brand={checkout.brand}
                  errors={checkout.errors}
                  showErrors={checkout.showErrors}
                  needsIdNumber={checkout.needsIdNumber}
                  saveCard={checkout.saveCard}
                  disabled={checkout.submitting}
                  onChange={checkout.updateDraft}
                  onSaveCard={checkout.setSaveCard}
                />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <OptionRow
          selected={checkout.method === "paygate"}
          disabled={checkout.submitting}
          onSelect={() => checkout.setMethod("paygate")}
          leading={
            <ExternalLink className="size-4 text-white/70" strokeWidth={1.75} aria-hidden />
          }
          title="Pagar en Paygate"
          subtitle="Se abre la página de Clinpays en otra pestaña"
        />
      </div>
    </section>
  );
}
