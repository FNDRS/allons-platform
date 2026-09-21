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
