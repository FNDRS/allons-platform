import { Fragment } from "react";
import { LEGAL_ENTITY, type LegalSection } from "@/lib/legalCenter";

// Emails and the site URL show up inline in the policy text; link them.
const LINKABLE = /([\w.+-]+@[\w-]+(?:\.[\w-]+)+|https:\/\/allonsapp\.com)/g;

function linkify(text: string) {
  return text.split(LINKABLE).map((part, i) => {
    if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>;
    const href = part.startsWith("http") ? part : `mailto:${part}`;
    return (
      <a key={i} href={href}>
        {part}
      </a>
    );
  });
}

export function LegalSections({ sections }: { sections: LegalSection[] }) {
  return sections.map((section) => (
    <section key={section.heading}>
      <h2>{section.heading}</h2>
      {section.body.map((paragraph) => (
        <p key={paragraph}>{linkify(paragraph)}</p>
      ))}
    </section>
  ));
}

/** The company's official data, shown at the top of every policy. */
export function LegalEntityCard() {
  return (
    <div className="card">
      <strong>Razón social:</strong> {LEGAL_ENTITY.name}
      <br />
      <strong>RTN:</strong> {LEGAL_ENTITY.rtn}
      <br />
      <strong>Matrícula mercantil:</strong> {LEGAL_ENTITY.registry}
      <br />
      <strong>Domicilio comercial:</strong> {LEGAL_ENTITY.address}
      <br />
      <strong>Correo:</strong>{" "}
      <a href={`mailto:${LEGAL_ENTITY.email}`}>{LEGAL_ENTITY.email}</a>
      <br />
      <strong>WhatsApp:</strong>{" "}
      <a href={LEGAL_ENTITY.whatsappUrl} target="_blank" rel="noopener noreferrer">
        {LEGAL_ENTITY.whatsapp}
      </a>
      <br />
      <strong>Web:</strong> <a href={LEGAL_ENTITY.web}>{LEGAL_ENTITY.web}</a>
    </div>
  );
}
