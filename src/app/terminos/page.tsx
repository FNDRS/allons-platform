import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

const CONTACT = "soporte@allonsapp.com";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description:
    "Términos y condiciones de uso de la app de eventos y boletos Allons.",
  alternates: { canonical: "/terminos" },
};

export default function TerminosPage() {
  return (
    <LegalPage
      title="Términos y Condiciones"
      updated="Última actualización: 24 de junio de 2026"
    >
      <p>
        Estos Términos y Condiciones (&quot;Términos&quot;) regulan el uso de la
        aplicación Allons (la &quot;App&quot;) y sus servicios. Al crear una
        cuenta o usar la App, aceptas estos Términos.
      </p>

      <h2>1. El servicio</h2>
      <p>
        Allons es una plataforma para descubrir eventos, comprar boletos
        digitales con código QR y, para organizadores, crear y gestionar eventos
        en Honduras. Allons actúa como intermediario entre asistentes y
        organizadores; los organizadores son responsables del evento que
        publican.
      </p>

      <h2>2. Tu cuenta</h2>
      <ul>
        <li>
          Debes proporcionar información veraz y mantener la confidencialidad de
          tus credenciales.
        </li>
        <li>Eres responsable de la actividad realizada desde tu cuenta.</li>
        <li>
          Debes ser mayor de edad o contar con autorización de un adulto
          responsable.
        </li>
      </ul>

      <h2>3. Compra de boletos</h2>
      <ul>
        <li>
          Los boletos son válidos para el evento, fecha y tipo indicados al
          momento de la compra.
        </li>
        <li>
          Cada boleto contiene un código QR que se valida una sola vez en la
          entrada del evento.
        </li>
        <li>
          La reventa o duplicación no autorizada de boletos está prohibida y
          puede invalidar el acceso.
        </li>
      </ul>

      <h2>4. Precios, pagos y comisiones</h2>
      <p>
        Los precios se muestran en Lempiras (HNL). Los pagos se procesan mediante
        un proveedor de pasarela externo (Paygate). Allons puede aplicar una
        comisión de servicio por boleto, que se refleja al momento de la compra.
        Los cargos del procesador de pago no son reembolsables.
      </p>

      <h2>5. Reembolsos y cancelaciones</h2>
      <p>
        Las políticas de reembolso dependen del organizador y de las condiciones
        de cada evento. Si un evento se cancela o reprograma, el organizador es
        responsable de gestionar el reembolso correspondiente conforme a la ley.
        Para solicitudes, escribe a <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>

      <h2>6. Organizadores</h2>
      <p>
        Los organizadores son responsables de la veracidad de la información del
        evento, del cumplimiento de la entrega del servicio y de las leyes
        aplicables. Allons puede retirar contenido que infrinja estos Términos o
        la ley.
      </p>

      <h2>7. Conducta del usuario</h2>
      <p>
        No debes usar la App para fines ilícitos, fraudulentos, ni para publicar
        contenido ofensivo, engañoso o que infrinja derechos de terceros.
        Podemos suspender cuentas que incumplan estos Términos.
      </p>

      <h2>8. Propiedad intelectual</h2>
      <p>
        La App, su marca, logotipos y contenido propio pertenecen a Allons. No se
        concede ningún derecho sobre ellos salvo el uso permitido de la App.
      </p>

      <h2>9. Limitación de responsabilidad</h2>
      <p>
        La App se proporciona &quot;tal cual&quot;. En la medida permitida por la
        ley, Allons no será responsable por daños indirectos derivados del uso
        del servicio o de la realización de los eventos, los cuales son
        responsabilidad de cada organizador.
      </p>

      <h2>10. Ley aplicable</h2>
      <p>
        Estos Términos se rigen por las leyes de la República de Honduras.
      </p>

      <h2>11. Cambios</h2>
      <p>
        Podemos actualizar estos Términos. La versión vigente se publicará en
        esta página con su fecha de actualización.
      </p>

      <h2>12. Contacto</h2>
      <p>
        Dudas sobre estos Términos: <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>
    </LegalPage>
  );
}
