import type { ProviderEventQuestion } from "@/lib/api/provider";
import { formatNumber } from "@/lib/format";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Stat";

/**
 * How much each option of a limited question has left, like shirts per size.
 * Taken counts sold tickets plus checkouts still open, the same count that
 * greys an option out for buyers.
 */
export function OptionStockSection({ questions }: { questions: ProviderEventQuestion[] }) {
  const limited = questions.filter(
    (question) =>
      !question.campaignQuestionId &&
      question.optionLimits &&
      Object.keys(question.optionLimits).length > 0,
  );
  if (limited.length === 0) return null;

  return (
    <section>
      <SectionTitle>Stock por opción</SectionTitle>
      <div className="flex flex-col gap-3">
        {limited.map((question) => {
          const limits = question.optionLimits ?? {};
          const taken = question.optionTaken ?? {};
          return (
            <Card key={question.id}>
              <p className="text-[16px] font-semibold tracking-tight">{question.label}</p>
              <ul className="mt-3 flex flex-col divide-y divide-white/[0.06]">
                {(question.options ?? []).map((option) => {
                  const limit = limits[option];
                  const used = taken[option] ?? 0;
                  const left = limit === undefined ? null : Math.max(0, limit - used);
                  return (
                    <li key={option} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-baseline justify-between gap-3 text-[13px]">
                        <p className="tabular-nums text-white/80">
                          <span className="mr-2 text-[15px] font-semibold text-white">
                            {option}
                          </span>
                          {formatNumber(used)}
                          {limit !== undefined ? (
                            <span className="text-white/40"> / {formatNumber(limit)}</span>
                          ) : null}{" "}
                          tomadas
                        </p>
                        <p
                          className={`shrink-0 tabular-nums ${
                            left === 0 ? "font-semibold text-danger" : "text-white/45"
                          }`}
                        >
                          {left === null
                            ? "Sin límite"
                            : left === 0
                              ? "Agotada"
                              : `Quedan ${formatNumber(left)}`}
                        </p>
                      </div>
                      {limit !== undefined && limit > 0 ? (
                        <div className="mt-2">
                          <Progress value={used} max={limit} />
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
