import { Label } from "@/components/ui/Field";

/** A labelled form block with an optional hint under it. */
export function ClassFormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <Label>{label}</Label>
      {children}
      {hint ? <p className="mt-1.5 text-[12px] leading-5 text-dim">{hint}</p> : null}
    </div>
  );
}
