import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionTitle } from "@/components/ui/Card";

/** A titled list of drafts with an add button and a required hint when empty. */
export function ClassBuilderSection({
  title,
  intro,
  addLabel,
  emptyHint,
  isEmpty,
  onAdd,
  children,
}: {
  title: string;
  intro: string;
  addLabel: string;
  emptyHint: string;
  isEmpty: boolean;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <section>
      <SectionTitle
        action={
          <Button variant="secondary" size="sm" onClick={onAdd}>
            <Plus className="size-4" aria-hidden />
            {addLabel}
          </Button>
        }
      >
        {title}
      </SectionTitle>
      <p className="mb-3 text-[13px] text-white/50">{intro}</p>
      {isEmpty ? (
        <p className="text-[13px] font-medium text-accent">{emptyHint}</p>
      ) : (
        <div className="flex flex-col gap-2">{children}</div>
      )}
    </section>
  );
}
