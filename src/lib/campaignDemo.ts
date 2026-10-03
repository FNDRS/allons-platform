import type {
  CampaignEventRow,
  CampaignQuestion,
  CampaignReport,
  HubCampaign,
  HubCampaignMember,
} from "@/lib/api/campaigns";

/**
 * Example data for a hub to see what a running campaign looks like before
 * real comercios and attendees arrive. Built on the campaign's own dates and
 * questions so the preview matches what it will report. Never sent anywhere.
 */

const COMERCIOS = [
  { id: "demo-cafe", name: "Café Origen", handle: "cafeorigen", events: ["Cata y networking", "Taller de barismo"] },
  { id: "demo-studio", name: "Studio Creativo", handle: "studiocreativo", events: ["Branding para emprendedores"] },
  { id: "demo-tech", name: "Tech Lab HN", handle: "techlabhn", events: ["Pitch night", "Taller de IA para pymes"] },
  { id: "demo-verde", name: "Verde Market", handle: "verdemarket", events: ["Feria de productores locales"] },
  { id: "demo-fin", name: "Finanzas Claras", handle: "finanzasclaras", events: ["Finanzas para tu negocio"] },
];

/** Deterministic pseudo-random numbers, so the demo does not jump on refresh. */
function seeded(seed: number) {
  let x = seed % 2147483647 || 1;
  return () => {
    x = (x * 16807) % 2147483647;
    return (x - 1) / 2147483646;
  };
}

const rate = (attended: number, registered: number) =>
  registered > 0 ? Math.round((attended / registered) * 1000) / 10 : 0;

function demoAnswers(q: CampaignQuestion, answered: number, rand: () => number) {
  if (q.kind === "boolean") {
    const yes = Math.round(answered * (0.55 + rand() * 0.3));
    return { options: [{ option: "Sí", count: yes }, { option: "No", count: answered - yes }] };
  }
  if ((q.kind === "select" || q.kind === "radio" || q.kind === "checkbox") && q.options?.length) {
    const weights = q.options.map(() => 0.3 + rand());
    const total = weights.reduce((a, b) => a + b, 0);
    return {
      options: q.options.map((option, i) => ({
        option,
        count: Math.round((weights[i] / total) * answered),
      })),
    };
  }
  if (q.kind === "number") {
    const min = 18 + Math.floor(rand() * 4);
    return { numeric: { average: Math.round((min + 9 + rand() * 4) * 10) / 10, min, max: min + 22 } };
  }
  return {};
}

export function buildCampaignDemo(campaign: HubCampaign) {
  const rand = seeded(campaign.id.split("").reduce((a, ch) => a + ch.charCodeAt(0), 0));
  const start = new Date(campaign.startsAt).getTime();
  const span = Math.max(new Date(campaign.endsAt).getTime() - start, 86_400_000);

  const events: CampaignEventRow[] = [];
  const byEvent: CampaignReport["byEvent"] = [];
  const byComercio: CampaignReport["byComercio"] = [];

  COMERCIOS.forEach((c, ci) => {
    let regSum = 0;
    let attSum = 0;
    c.events.forEach((title, ei) => {
      const registered = 40 + Math.floor(rand() * 110);
      const attended = Math.round(registered * (0.58 + rand() * 0.32));
      const id = `${c.id}-${ei}`;
      regSum += registered;
      attSum += attended;
      events.push({
        id,
        title,
        startsAt: new Date(start + span * ((ci * 2 + ei + 1) / 12)).toISOString(),
        city: ci % 2 === 0 ? "Tegucigalpa" : "San Pedro Sula",
        provider: { id: c.id, name: c.name, handle: c.handle, logoUrl: null },
      });
      byEvent.push({
        eventId: id,
        title,
        providerName: c.name,
        removedAt: null,
        registered,
        attended,
        attendanceRate: rate(attended, registered),
      });
    });
    byComercio.push({
      providerId: c.id,
      name: c.name,
      events: c.events.length,
      registered: regSum,
      attended: attSum,
      attendanceRate: rate(attSum, regSum),
    });
  });
  byComercio.sort((a, b) => b.attended - a.attended);

  const registered = byComercio.reduce((s, c) => s + c.registered, 0);
  const attended = byComercio.reduce((s, c) => s + c.attended, 0);

  const report: CampaignReport = {
    totals: {
      events: events.length,
      removedEvents: 0,
      comercios: COMERCIOS.length,
      registered,
      attended,
      attendanceRate: rate(attended, registered),
    },
    byComercio,
    byEvent,
    questions: campaign.questions.map((q) => {
      const answered = Math.round(attended * (q.requiredForAttendee ? 1 : 0.6 + rand() * 0.25));
      return { id: q.id, label: q.label, answered, ...demoAnswers(q, answered, rand) };
    }),
  };

  const members: HubCampaignMember[] = COMERCIOS.map((c, i) => ({
    id: `member-${c.id}`,
    status: i === COMERCIOS.length - 1 ? "pending" : "accepted",
    initiatedBy: i === COMERCIOS.length - 1 ? "comercio" : "hub",
    provider: { id: c.id, name: c.name, handle: c.handle, logoUrl: null },
    eventCount: c.events.length,
  }));

  return { report, members, events };
}
