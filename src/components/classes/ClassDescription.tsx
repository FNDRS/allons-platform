/** The comercio's own words about the class. */
export function ClassDescription({ text }: { text: string | null }) {
  if (!text?.trim()) return null;
  return (
    <section>
      <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/38">
        Sobre la clase
      </h2>
      <p className="whitespace-pre-line break-words text-[15px] leading-7 text-white/75">
        {text.trim()}
      </p>
    </section>
  );
}
