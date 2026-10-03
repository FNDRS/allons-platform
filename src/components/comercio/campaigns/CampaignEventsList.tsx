"use client";

import type { ReactNode } from "react";
import type { CampaignEventRow } from "@/lib/api/campaigns";
import { Card } from "@/components/ui/Card";
import { formatCampaignDay } from "./campaignFormat";

/** Events of a campaign, each with one optional action on the right. */
export function CampaignEventsList({
  events,
  action,
  onSelect,
}: {
  events: CampaignEventRow[];
  action?: (event: CampaignEventRow) => ReactNode;
  /** Makes the row open the event's detail. */
  onSelect?: (event: CampaignEventRow) => void;
}) {
  return (
    <Card padding="none" className="divide-y divide-border">
      {events.map((e) => (
        <div key={e.id} className="flex items-center gap-3 px-5 py-4">
          <div
            className={`min-w-0 flex-1 ${onSelect ? "cursor-pointer" : ""}`}
            {...(onSelect
              ? {
                  role: "button",
                  tabIndex: 0,
                  onClick: () => onSelect(e),
                  onKeyDown: (k: React.KeyboardEvent) => {
                    if (k.key === "Enter" || k.key === " ") {
                      k.preventDefault();
                      onSelect(e);
                    }
                  },
                }
              : {})}
          >
            <p className={`truncate font-semibold ${onSelect ? "hover:underline" : ""}`}>{e.title}</p>
            <p className="truncate text-[13px] text-white/50">
              {[e.provider?.name, e.startsAt ? formatCampaignDay(e.startsAt) : null, e.city]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          {action?.(e)}
        </div>
      ))}
    </Card>
  );
}
