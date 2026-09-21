import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

const CONTACT = "soporte@allonsapp.com";

export const metadata: Metadata = {
  title: "Eliminar tu cuenta",
  description:
    "Cómo eliminar tu cuenta de Allons y los datos personales asociados.",
  alternates: { canonical: "/eliminar-cuenta" },
};

export default function EliminarCuentaPage() {
  return (
    <LegalPage
      title="Eliminar tu cuenta"
      updated="Cómo eliminar tu cuenta de Allons y los datos asociados"
    >
      <p>
        Puedes solicitar la eliminación de tu cuenta de Allons y de tus datos
        personales en cualquier momento, por cualquiera de estas dos vías:
      </p>

      <h2>Opción 1 — Desde la App</h2>
      <ol>
        <li>Abre la App e inicia sesión.</li>
        <li>
          Ve a la pestaña <strong>Perfil</strong>.
        </li>
        <li>
          En la sección <strong>Cuenta</strong>, toca{" "}
          <strong>Eliminar cuenta</strong>.
        </li>
        <li>Confirma la acción en la ventana que aparece.</li>
      </ol>

      <h2>Opción 2 — Por correo</h2>
      <div className="card">
        <p style={{ marginTop: 0 }}>
          Envíanos tu solicitud desde el correo asociado a tu cuenta:
        </p>
        <a
          className="cta"
          href={`mailto:${CONTACT}?subject=Eliminar%20mi%20cuenta%20Allons`}
        >
          Solicitar eliminación
        </a>
        <p style={{ marginBottom: 0 }}>
          Correo: <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
        </p>
      </div>
      <p>
        Procesamos las solicitudes por correo dentro de un plazo de{" "}
        <strong>30 días</strong>. Podríamos pedirte verificar tu identidad para
        proteger tu cuenta.
      </p>

      <h2>Qué datos se eliminan</h2>
      <ul>
        <li>Tu perfil: nombre, correo, foto de perfil y preferencias.</li>
        <li>Tus credenciales de acceso.</li>
        <li>Datos de uso vinculados a tu identidad.</li>
      </ul>

      <h2>Qué datos podemos conservar</h2>
      <p>
        Por obligaciones legales, contables y de prevención de fraude, podemos
        conservar de forma limitada ciertos registros de transacciones (por
        ejemplo, comprobantes de compra de boletos) durante el plazo que exija la
        ley. Estos registros se conservan de forma segura y se eliminan o
        anonimizan al vencer dicho plazo.
      </p>

      <h2>¿Tienes dudas?</h2>
      <p>
        Escríbenos a <a href={`mailto:${CONTACT}`}>{CONTACT}</a> y te ayudamos.
      </p>
    </LegalPage>
  );
}
