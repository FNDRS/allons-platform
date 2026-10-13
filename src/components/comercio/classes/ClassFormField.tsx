import { useId } from "react";
import { Label } from "@/components/ui/Field";

/**
 * A labelled form block with an optional hint under it. Pass `children` as a
 * function to get the id for a single control, which the label then names.
 * Anything else is wrapped in a group named by the label.
 */
export function ClassFormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode | ((id: string) => React.ReactNode);
}) {
  const id = useId();
  const labelId = `${id}-label`;
  return (
    <div className="flex flex-col">
      {typeof children === "function" ? (
        <>
          <Label htmlFor={id}>{label}</Label>
          {children(id)}
        </>
      ) : (
        <>
          <Label id={labelId}>{label}</Label>
          <div role="group" aria-labelledby={labelId}>
            {children}
          </div>
        </>
      )}
      {hint ? <p className="mt-1.5 text-[12px] leading-5 text-dim">{hint}</p> : null}
    </div>
  );
}
