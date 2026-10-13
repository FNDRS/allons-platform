import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { ProviderClassProgram } from "@/lib/api/providerClassPrograms";

function cancellationLabel(program: ProviderClassProgram) {
  if (program.cancellationPolicy === "none") return "Al cancelar, el cliente pierde la sesión.";
  if (program.cancellationWindowHours === 0) {
    return "La sesión vuelve al paquete si cancela antes de que empiece la clase.";
  }
  return `La sesión vuelve al paquete si cancela con ${program.cancellationWindowHours} h o más de anticipación.`;
}

/** Cover, description, place and cancellation rule of a program. */
export function ClassProgramInfo({ program }: { program: ProviderClassProgram }) {
  const place = [program.locationName, program.address, program.city].filter(Boolean).join(" · ");
  return (
    <Card className="flex flex-col gap-4 sm:flex-row">
      {program.coverImageUrl?.startsWith("https://") ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={program.coverImageUrl}
          alt=""
          className="aspect-[4/3] w-full shrink-0 rounded-[16px] object-cover sm:w-48"
        />
      ) : null}
      <div className="flex min-w-0 flex-col gap-3 text-[14px]">
        {program.description ? (
          <p className="whitespace-pre-line leading-6 text-white/75">{program.description}</p>
        ) : null}
        {place ? (
          <p className="flex items-start gap-2 text-white/60">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
            {place}
          </p>
        ) : null}
        <p className="text-white/60">{cancellationLabel(program)}</p>
      </div>
    </Card>
  );
}
