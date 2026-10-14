import { DateField } from "@/components/ui/DateField";
import { Label } from "@/components/ui/Field";

/** Earliest day the pickers offer. */
const MIN_DATE = "2025-01-01";

/** From and to dates for a finance report. */
export function FinanceRangeFields({
  from,
  to,
  error,
  onFromChange,
  onToChange,
}: {
  from: string;
  to: string;
  error: string | null;
  onFromChange: (date: string) => void;
  onToChange: (date: string) => void;
}) {
  return (
    <div>
      <div className="grid gap-3 sm:max-w-[560px] sm:grid-cols-2">
        <div>
          <Label htmlFor="finance-from">Desde</Label>
          <DateField id="finance-from" value={from} min={MIN_DATE} onChange={onFromChange} invalid={Boolean(error)} />
        </div>
        <div>
          <Label htmlFor="finance-to">Hasta</Label>
          <DateField id="finance-to" value={to} min={MIN_DATE} onChange={onToChange} invalid={Boolean(error)} />
        </div>
      </div>
      {error ? <p className="mt-1.5 text-[13px] text-red-300">{error}</p> : null}
    </div>
  );
}
