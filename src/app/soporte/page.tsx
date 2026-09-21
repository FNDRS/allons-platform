import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

const CONTACT = "soporte@allonsapp.com";

export const metadata: Metadata = {
  title: "Soporte",
  description:
    "Centro de ayuda de Allons. Contáctanos y revisa las preguntas frecuentes.",
  alternates: { canonical: "/soporte" },
};

export default function SoportePage() {
  return (
    <LegalPage
      title="Centro de Soporte"
      updated="¿Necesitas ayuda? Estamos para apoyarte."
    >
      <div className="card">
        <p style={{ marginTop: 0 }}>
          Escríbenos y te respondemos lo antes posible, normalmente en un plazo
          de <strong>24 a 48 horas hábiles</strong>.
        </p>
        <a className="cta" href={`mailto:${CONTACT}?subject=Soporte%20Allons`}>
          Contactar soporte
        </a>
        <p style={{ marginBottom: 0 }}>
          Correo: <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
        </p>
      </div>

      <h2>Preguntas frecuentes</h2>

      <p>
        <strong>No encuentro mi boleto</strong>
      </p>
      <p>
        Tus boletos aparecen en la sección &quot;Mis boletos&quot; dentro de la
        App, incluso sin conexión. Asegúrate de iniciar sesión con la misma
        cuenta con la que realizaste la compra.
      </p>

      <p>
        <strong>¿Cómo entro al evento?</strong>
      </p>
      <p>
        Solo muestra el código QR de tu boleto en la entrada. El personal del
        evento lo escanea para validar tu acceso.
      </p>

      <p>
        <strong>No recibí mi boleto después de pagar</strong>
      </p>
      <p>
        El boleto se genera al confirmarse el pago. Si no aparece en unos
        minutos, revisa tu conexión y vuelve a abrir &quot;Mis boletos&quot;. Si
        el problema continúa, escríbenos con el correo de tu cuenta y el nombre
        del evento.
      </p>

      <p>
        <strong>¿Puedo pedir un reembolso?</strong>
      </p>
      <p>
        Los reembolsos dependen de la política del organizador y de cada evento.
        Si un evento se cancela o reprograma, contáctanos y te ayudamos a
        gestionarlo.
      </p>

      <p>
        <strong>Quiero eliminar mi cuenta</strong>
      </p>
      <p>
        Puedes hacerlo desde la App o solicitándolo por correo. Consulta la
        página de <a href="/eliminar-cuenta">eliminación de cuenta</a>.
      </p>

      <p>
        <strong>Soy organizador y necesito ayuda con mi evento</strong>
      </p>
      <p>
        Escríbenos a <a href={`mailto:${CONTACT}`}>{CONTACT}</a> indicando el
        nombre de tu negocio y tu evento.
      </p>
    </LegalPage>
  );
}
