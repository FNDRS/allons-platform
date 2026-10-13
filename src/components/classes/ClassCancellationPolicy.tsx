import type { ClassProgram } from "@/lib/api/classPrograms";

/** The comercio's cancellation rule, said before anyone books. */
export function ClassCancellationPolicy({
  program,
}: {
  program: Pick<ClassProgram, "cancellationPolicy" | "cancellationWindowHours">;
}) {
  const hours = Math.round(program.cancellationWindowHours ?? 0);
  const text =
    program.cancellationPolicy === "none"
      ? "Si cancelas una reserva, la sesión no vuelve a tu paquete."
      : hours > 0
        ? `Si cancelas hasta ${hours === 1 ? "1 hora" : `${hours} horas`} antes de la clase, la sesión vuelve a tu paquete.`
        : "Si cancelas antes de que empiece la clase, la sesión vuelve a tu paquete.";
  return <p className="text-[13px] leading-5 text-white/45">{text}</p>;
}
