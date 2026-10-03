import type {
  CampaignAttendee,
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

const FIRST = ["Ana", "Luis", "María", "José", "Daniela", "Carlos", "Sofía", "Andrés", "Valeria", "Diego", "Camila", "Jorge"];
const LAST = ["Mejía", "Rodríguez", "Martínez", "López", "Hernández", "Zelaya", "Flores", "Castro", "Reyes", "Paz"];

const COMERCIOS = [
  { id: "demo-cafe", name: "Café Origen", handle: "cafeorigen", events: ["Cata y networking", "Taller de barismo"] },
  { id: "demo-studio", name: "Studio Creativo", handle: "studiocreativo", events: ["Branding para emprendedores"] },
  { id: "demo-tech", name: "Tech Lab HN", handle: "techlabhn", events: ["Pitch night", "Taller de IA para pymes"] },
  { id: "demo-verde", name: "Verde Market", handle: "verdemarket", events: ["Feria de productores locales"] },
  { id: "demo-fin", name: "Finanzas Claras", handle: "finanzasclaras", events: ["Finanzas para tu negocio"] },
];

/** What the list shows for each of the hub's campaigns in the demo. */
export const DEMO_COUNTS = {
  members: COMERCIOS.length - 1,
  events: COMERCIOS.reduce((n, c) => n + c.events.length, 0),
  pending: 1,
};

/** Campaigns from other hubs, for the "Campañas para tu comercio" demo. */
export const DEMO_OPEN_CAMPAIGNS = [
  {
    name: "Semana de la Innovación",
    subtitle: "Organiza Tech Lab HN · te invitó a participar",
    pill: "Te invitaron",
  },
  {
    name: "Ruta del Café Hondureño",
    subtitle: "Organiza Café Origen · 3 de tus eventos",
    pill: "Participas",
  },
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

/** A plausible answer for one attendee, matching the question's kind. */
function demoAnswer(q: CampaignQuestion, rand: () => number): string {
  if (q.kind === "boolean") return rand() < 0.7 ? "Sí" : "No";
  if ((q.kind === "select" || q.kind === "radio" || q.kind === "checkbox") && q.options?.length) {
    return q.options[Math.floor(rand() * q.options.length)];
  }
  if (q.kind === "number") return String(18 + Math.floor(rand() * 22));
  if (q.kind === "date") return "2027-01-15";
  return ["Me interesa emprender", "Vengo por networking", "Quiero aprender", "Me invitó un amigo"][
    Math.floor(rand() * 4)
  ];
}

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

  // Up to 24 sample people per event, enough to see the list; the totals
  // above stay the full counts.
  const attendeesByEvent = new Map<string, CampaignAttendee[]>();
  for (const e of byEvent) {
    const people: CampaignAttendee[] = [];
    const shown = Math.min(e.registered, 24);
    for (let i = 0; i < shown; i++) {
      const consented = rand() < 0.75;
      people.push({
        eventId: e.eventId,
        eventTitle: e.title,
        providerName: e.providerName,
        registeredAt: new Date(start + span * rand() * 0.5).toISOString(),
        name: consented
          ? `${FIRST[Math.floor(rand() * FIRST.length)]} ${LAST[Math.floor(rand() * LAST.length)]}`
          : "Anónimo",
        consented,
        attended: i < Math.round(shown * (e.attended / Math.max(e.registered, 1))),
        answers: consented
          ? Object.fromEntries(campaign.questions.map((q) => [q.id, demoAnswer(q, rand)]))
          : {},
      });
    }
    attendeesByEvent.set(e.eventId, people);
  }

  return { report, members, events, attendeesByEvent };
}
