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
      <h1 className="break-words text-[28px] font-bold leading-[1.05] tracking-[-0.03em] sm:text-[36px]">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-1.5 text-[15px] text-muted">{subtitle}</p>
      ) : null}
    </div>
  );
}
