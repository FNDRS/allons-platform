import { Star } from "lucide-react";
import type { ComercioProfile } from "@/lib/api/comercios";
import { formatShortDate } from "@/lib/format";
import { Card, SectionTitle } from "@/components/ui/Card";

function Stars({ value }: { value: number }) {
  const rounded = Math.round(value);
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value.toFixed(1)} de 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`size-3.5 ${index < rounded ? "fill-accent text-accent" : "text-white/20"}`}
          aria-hidden
        />
      ))}
    </span>
  );
}

/** Average rating and the latest written reviews. Hidden without any. */
export function ComercioReviews({ profile }: { profile: ComercioProfile }) {
  const reviews = profile.reviews.filter((review) => review.body.trim());
  if (profile.rating == null || profile.reviewCount === 0) return null;

  return (
    <section>
      <SectionTitle>Reseñas</SectionTitle>
      <Card className="flex flex-col gap-5">
        <div className="flex items-end gap-4">
          <p className="text-[36px] font-bold leading-none tracking-[-0.04em] tabular-nums sm:text-[44px]">
            {profile.rating.toFixed(1)}
          </p>
          <div className="pb-1">
            <Stars value={profile.rating} />
            <p className="mt-1 text-[13px] text-white/50">
              {profile.reviewCount} {profile.reviewCount === 1 ? "reseña" : "reseñas"} en Allons
            </p>
          </div>
        </div>
        {reviews.length > 0 ? (
          <ul className="flex flex-col divide-y divide-white/[0.08] border-t border-white/[0.08]">
            {reviews.slice(0, 4).map((review) => (
              <li key={review.id} className="flex flex-col gap-1.5 py-4">
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <p className="min-w-0 truncate text-[14px] font-semibold tracking-tight">
                    {review.authorName?.trim() || "Cliente de Allons"}
                  </p>
                  {review.rating != null ? <Stars value={review.rating} /> : null}
                </div>
                <p className="text-[14px] leading-6 text-white/72">{review.body}</p>
                {formatShortDate(review.createdAt) ? (
                  <p className="text-[12px] text-white/35">{formatShortDate(review.createdAt)}</p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </Card>
    </section>
  );
}
