import { FieldError, Label } from "@/components/ui/Field";

/** Etiqueta, control y error de un campo, con el id del error enlazado. */
export function FormField({
  label,
  hint,
  error,
  errorId,
  className = "",
  group = false,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  errorId: string;
  className?: string;
  /** Para controles con varios botones (subir archivos): un `<div>`, no `<label>`. */
  group?: boolean;
  children: React.ReactNode;
}) {
  const Tag = group ? "div" : "label";
  return (
    <Tag className={`block ${className}`}>
      <Label hint={hint}>{label}</Label>
      {children}
      <FieldError id={errorId}>{error}</FieldError>
    </Tag>
  );
}

/** Título y bajada de cada paso. */
export function StepHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-7">
      <h2 className="text-[24px] font-bold leading-tight tracking-tight sm:text-[28px]">{title}</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">{description}</p>
    </div>
  );
}
