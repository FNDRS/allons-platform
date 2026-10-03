import type { CampaignMemberStatus, CampaignStatus } from "@/lib/api/campaigns";

const DAY = new Intl.DateTimeFormat("es-HN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "America/Tegucigalpa",
});

export const formatCampaignRange = (start: string, end: string) =>
  `${DAY.format(new Date(start))} al ${DAY.format(new Date(end))}`;

export const formatCampaignDay = (value: string) => DAY.format(new Date(value));

export const formatRate = (rate: number) =>
  `${rate.toLocaleString("es-HN", { maximumFractionDigits: 1 })}%`;

export const CAMPAIGN_STATUS_LABEL: Record<CampaignStatus, string> = {
  draft: "Borrador",
  published: "Publicada",
  archived: "Archivada",
};

export const MEMBER_STATUS_LABEL: Record<CampaignMemberStatus, string> = {
  pending: "Pendiente",
  accepted: "En la campaña",
  declined: "Rechazó",
  revoked: "Quitado",
  left: "Salió",
};
