import type { Metadata } from "next";
import { LegalEntityCard, LegalSections } from "@/components/LegalSections";
import { LegalPage } from "@/components/LegalPage";
import { LEGAL_ENTITY, LEGAL_VERSION, PRIVACY_SECTIONS } from "@/lib/legalCenter";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Cómo Allons recopila, usa y protege tus datos personales.",
  alternates: { canonical: "/privacidad" },
};

export default function PrivacidadPage() {
  return (
    <LegalPage title="Política de Privacidad" updated={LEGAL_VERSION}>
      <LegalEntityCard />
      <LegalSections sections={PRIVACY_SECTIONS} />

      {/* Not part of the master document: details the previous version of
          this page committed to, kept on purpose. */}
      <h2>Información complementaria</h2>

      <p>
        <strong>Proveedores que tratan datos en nuestro nombre.</strong> Usamos
        estos proveedores exclusivamente para prestar el servicio:
      </p>
      <ul>
        <li>
          <strong>Supabase</strong>: autenticación y base de datos.
        </li>
        <li>
          <strong>Paygate</strong>: procesamiento de pagos.
        </li>
        <li>
          <strong>PostHog</strong>: análisis de uso del producto (primera
          parte; no usamos estos datos para rastrearte entre apps de otras
          empresas).
        </li>
        <li>
          <strong>Expo / proveedores de notificaciones push</strong>: entrega
          de notificaciones.
        </li>
        <li>
          <strong>Vercel y Amazon Web Services</strong>: alojamiento del sitio
          web y de nuestra API.
        </li>
        <li>
          <strong>Sentry</strong>: reportes de errores técnicos, configurado
          para no enviar datos personales ni grabar sesiones.
        </li>
        <li>
          <strong>Google Fonts</strong>: tipografía del sitio web (recibe tu
          dirección IP al descargarla).
        </li>
      </ul>
      <p>
        Algunos de estos proveedores almacenan o procesan datos fuera de
        Honduras, principalmente en los Estados Unidos.
      </p>

      <p>
        <strong>Plazo de respuesta.</strong> Respondemos las solicitudes de
        acceso, corrección o eliminación de datos en un plazo máximo de 30
        días. Escríbenos a{" "}
        <a href={`mailto:${LEGAL_ENTITY.email}`}>{LEGAL_ENTITY.email}</a>.
      </p>

      <p>
        <strong>Incidentes de seguridad.</strong> Si ocurre un incidente que
        afecte tus datos, te lo notificaremos sin demora indebida. Los detalles
        están en nuestra <a href="/seguridad">Política de Seguridad</a>.
      </p>

      <p>
        <strong>Cookies.</strong> El sitio no usa cookies de publicidad ni de
        rastreo. Consulta nuestra{" "}
        <a href="/cookies">Política de Cookies y Almacenamiento</a>.
      </p>

      <p>
        <strong>Eliminar tu cuenta.</strong> Puedes eliminar tu cuenta
        directamente; al hacerlo borramos o anonimizamos tus datos según lo
        descrito en la <a href="/eliminar-cuenta">página de eliminación de cuenta</a>.
      </p>
    </LegalPage>
  );
}
