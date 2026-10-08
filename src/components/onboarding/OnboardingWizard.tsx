"use client";

import { useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Stepper } from "@/components/ui/Stepper";
import { ONBOARDING_STEPS, useOnboardingForm } from "@/hooks/useOnboardingForm";
import type { OnboardingSession } from "@/lib/allons-api";
import { scrollToFirstInvalid } from "@/lib/scroll-to-invalid";
import { BillingStep } from "./BillingStep";
import { CompanyStep } from "./CompanyStep";
import { EventStep } from "./EventStep";
import { OnboardingOutcome } from "./OnboardingOutcome";
import { ReviewStep } from "./ReviewStep";

const EASE = [0.32, 0.72, 0, 1] as const;

/** El registro de comercio paso a paso. El token ya fue validado en el servidor. */
export function OnboardingWizard({
  token,
  session,
}: {
  token: string;
  session: OnboardingSession;
}) {
  const form = useOnboardingForm(token, session.email);
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const isLast = form.stepIndex === ONBOARDING_STEPS.length - 1;

  if (form.outcome !== "editing") {
    return <OnboardingOutcome kind={form.outcome} email={form.draft.company.email} />;
  }

  function onContinue() {
    if (isLast) {
      void form.submit().then(() => scrollToFirstInvalid(rootRef.current));
      return;
    }
    if (!form.next()) scrollToFirstInvalid(rootRef.current);
  }

  const offset = reduced ? 0 : 40 * form.direction;

  return (
    <div ref={rootRef}>
      <div className="mb-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-accent">
          Registro de comercio
        </p>
        <h1 className="mt-2 text-[30px] font-bold leading-[1.1] tracking-tight sm:text-[38px]">
          {session.label ? `Hola, ${session.label}` : "¡Hola!"}
        </h1>
        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted">
          Cuatro pasos y listo. Lo que escribas se guarda en este navegador mientras avanzas.
        </p>
      </div>

      <div className="mb-8">
        <Stepper
          steps={ONBOARDING_STEPS}
          current={form.stepIndex}
          onSelect={(index) => form.edit(ONBOARDING_STEPS[index].id)}
        />
      </div>

      <motion.div
        initial={false}
        animate={{ opacity: form.hydrated ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="relative rounded-[24px] border border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-8"
      >
        {/* Hasta leer el borrador guardado no se sabe en qué paso va. */}
        {form.hydrated ? (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={form.step}
              initial={{ opacity: 0, x: offset }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -offset }}
              transition={{ duration: reduced ? 0.15 : 0.35, ease: EASE }}
            >
              {form.step === "company" ? <CompanyStep form={form} token={token} /> : null}
              {form.step === "billing" ? <BillingStep form={form} /> : null}
              {form.step === "event" ? <EventStep form={form} token={token} /> : null}
              {form.step === "review" ? <ReviewStep form={form} /> : null}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="min-h-[28rem]" />
        )}

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-[#070708]/80 px-5 pb-[max(env(safe-area-inset-bottom),14px)] pt-3.5 backdrop-blur-xl sm:static sm:mt-9 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            {form.stepIndex > 0 ? (
              <Button type="button" variant="ghost" size="lg" onClick={form.back} disabled={form.submitting}>
                <ArrowLeft className="size-4" aria-hidden />
                Atrás
              </Button>
            ) : null}
            <Button
              type="button"
              size="lg"
              className="ml-auto min-w-[10rem] flex-1 sm:flex-none"
              onClick={onContinue}
              loading={form.submitting}
              disabled={form.isUploading}
            >
              {form.isUploading ? (
                "Subiendo imágenes…"
              ) : isLast ? (
                <>
                  Enviar solicitud
                  <Send className="size-4" aria-hidden />
                </>
              ) : (
                <>
                  Continuar
                  <ArrowRight className="size-4" aria-hidden />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
