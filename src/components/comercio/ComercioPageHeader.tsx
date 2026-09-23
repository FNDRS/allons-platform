/** Page title block for comercio sections whose content has no heading of its own. */
export function ComercioPageHeader({
  title,
  subtitle,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <h1 className="break-words text-[26px] font-bold leading-[1.05] tracking-[-0.03em] sm:text-[32px]">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-1 text-[14px] text-muted">{subtitle}</p>
      ) : null}
    </div>
  );
}
