import { formatCompactCount, type ComercioProfile } from "@/lib/api/comercios";

/** Seguidores · eventos · clases. Counters only, zero counts stay out. */
export function ComercioStats({ profile }: { profile: ComercioProfile }) {
  const items: { value: string; label: string }[] = [
    {
      value: formatCompactCount(profile.followerCount),
      label: profile.followerCount === 1 ? "seguidor" : "seguidores",
    },
  ];
  if (profile.eventCount > 0) {
    items.push({
      value: String(profile.eventCount),
      label: profile.eventCount === 1 ? "evento" : "eventos",
    });
  }
  if (profile.classCount > 0) {
    items.push({
      value: String(profile.classCount),
      label: profile.classCount === 1 ? "clase" : "clases",
    });
  }
  return (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {items.map((item, index) => (
        <li key={item.label} className="flex items-center gap-2">
          {index > 0 ? (
            <span className="h-3 w-px bg-white/15" aria-hidden />
          ) : null}
          <span className="text-[17px] font-bold tabular-nums tracking-tight text-white">
            {item.value}
          </span>
          <span className="text-[14px] text-white/55">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
