import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DateField } from "@/components/ui/DateField";
import { addDays, formatDayKey, todayHN } from "@/lib/dateKeys";

/** Previous, next and current week, plus a jump to any date's week. */
export function ClassWeekNav({
  weekStart,
  weekEnd,
  isCurrentWeek,
  onPrevious,
  onNext,
  onToday,
  onJump,
}: {
  weekStart: string;
  weekEnd: string;
  isCurrentWeek: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onJump: (date: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="glass" size="icon-sm" aria-label="Semana anterior" onClick={onPrevious}>
        <ChevronLeft className="size-4" aria-hidden />
      </Button>
      <p className="min-w-[150px] text-center text-[14px] font-semibold tabular-nums">
        {`${formatDayKey(weekStart, weekStart.slice(0, 4) !== weekEnd.slice(0, 4))} al ${formatDayKey(weekEnd, true)}`}
      </p>
      <Button variant="glass" size="icon-sm" aria-label="Semana siguiente" onClick={onNext}>
        <ChevronRight className="size-4" aria-hidden />
      </Button>
      <Button variant="secondary" size="sm" disabled={isCurrentWeek} onClick={onToday}>
        Hoy
      </Button>
      <div className="w-full sm:w-[240px]">
        {/* Shows the week's Monday; picking any day jumps to its week. */}
        <DateField value={weekStart} min={addDays(todayHN(), -365)} onChange={onJump} />
      </div>
    </div>
  );
}
