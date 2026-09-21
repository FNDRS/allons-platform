import {
  CalendarMark,
  KitMark,
  MetaTile,
  PinMark,
  RefundMark,
} from "@/components/ui/MetaTile";

export function TicketMeta({
  when,
  venue,
  address,
  city,
  kitPickupInfo,
  refund,
}: {
  when: string | null;
  venue?: string | null;
  address?: string | null;
  city?: string | null;
  kitPickupInfo?: string | null;
  refund: string;
}) {
  const place = placeLabel(venue, address, city);
  const maps =
    venue || address || city
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          [venue, address, city].filter(Boolean).join(", "),
        )}`
      : null;
  return (
    <ul className="flex flex-col gap-2">
      {when ? (
        <MetaTile icon={<CalendarMark />} label="Cuándo">
          {when}
        </MetaTile>
      ) : null}
      {place ? (
        <MetaTile icon={<PinMark />} label="Dónde" href={maps}>
          {place}
        </MetaTile>
      ) : null}
      {kitPickupInfo ? (
        <MetaTile icon={<KitMark />} label="Kit">
          <span className="whitespace-pre-line">{kitPickupInfo}</span>
        </MetaTile>
      ) : null}
      <MetaTile icon={<RefundMark />} label="Reembolso">
        {refund}
      </MetaTile>
    </ul>
  );
}

function placeLabel(
  venue?: string | null,
  address?: string | null,
  city?: string | null,
) {
  const v = venue?.trim() || null;
  const a = address?.trim() || null;
  const c = city?.trim() || null;
  const bits: string[] = [];
  if (v) bits.push(v);
  if (a && a !== v) bits.push(a);
  const blob = bits.join(" ").toLowerCase();
  if (c && !blob.includes(c.toLowerCase())) bits.push(c);
  return bits.join(" · ");
}
