/**
 * The hero line: "Sábado 20 ·" with a small red dot, and the month muted
 * below. Honduras time, since that is where the events are.
 */
export function DateLine({ date = new Date() }: { date?: Date }) {
  const weekday = date.toLocaleDateString("es-HN", {
    weekday: "long",
    timeZone: "America/Tegucigalpa",
  });
  const day = date.toLocaleDateString("es-HN", {
    day: "numeric",
    timeZone: "America/Tegucigalpa",
  });
  const month = date.toLocaleDateString("es-HN", {
    month: "long",
    timeZone: "America/Tegucigalpa",
  });
  const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
  return (
    <div className="leading-tight">
      <p className="flex items-center gap-1.5 text-[17px] font-bold tracking-tight">
        {cap(weekday)} {day}
        <span className="size-1.5 rounded-full bg-[#ff4d4d]" aria-hidden />
      </p>
      <p className="text-[15px] font-semibold text-dim">{cap(month)}</p>
    </div>
  );
}

/** Display headline with an optional muted subtitle and a right slot. */
export function PageHeader({
  eyebrow,
  title,
  body,
  action,
  size = "display",
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  body?: React.ReactNode;
  action?: React.ReactNode;
  size?: "display" | "h1";
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow ? <div className="mb-3">{eyebrow}</div> : null}
        <h1
          className={`font-bold leading-[1.05] tracking-[-0.03em] ${
            size === "display" ? "text-[34px] sm:text-[44px]" : "text-[26px] sm:text-[30px]"
          }`}
        >
          {title}
        </h1>
        {body ? <p className="mt-2 max-w-xl text-[15px] text-muted">{body}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
