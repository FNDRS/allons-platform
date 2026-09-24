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
      updated="Última actualización: 24 de septiembre de 2026"
    >
      <p>
        Estos Términos y Condiciones (&quot;Términos&quot;) regulan el uso de la
        aplicación Allons (la &quot;App&quot;), del sitio web{" "}
        <strong>allonsapp.com</strong> (incluido el panel de comercios) y sus
        servicios. Al crear una cuenta, comprar un boleto o usar la App o el
        sitio, aceptas estos Términos, nuestra{" "}
        <a href="/privacidad">Política de Privacidad</a>, nuestra{" "}
        <a href="/cookies">Política de Cookies</a> y nuestra{" "}
        <a href="/seguridad">Política de Seguridad</a>.
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
          Si sospechas que alguien accedió a tu cuenta, cambia tu contraseña y
          avísanos de inmediato a <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
        </li>
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
        comisión de servicio por boleto, que se refleja antes de confirmar la
        compra. Salvo lo que disponga la ley, los cargos del procesador de pago
        no son reembolsables. Podemos rechazar o anular pagos que el procesador
        o nuestros controles identifiquen como fraudulentos.
      </p>

      <h2>5. Reembolsos y cancelaciones</h2>
      <p>
        Las políticas de reembolso dependen del organizador y de las condiciones
        de cada evento. Si un evento se cancela o reprograma, el organizador es
        responsable de gestionar el reembolso correspondiente conforme a la ley.
        Para solicitudes, escribe a <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
        Nada en estos Términos limita los derechos que te reconoce la Ley de
        Protección al Consumidor de Honduras.
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

      <h2>7.1. Uso aceptable y seguridad</h2>
      <p>Al usar Allons no debes:</p>
      <ul>
        <li>
          Intentar acceder a cuentas, datos o sistemas que no te pertenecen, ni
          eludir los controles de seguridad o de acceso.
        </li>
        <li>
          Usar bots, scripts o medios automatizados para comprar, reservar o
          acaparar boletos, ni para extraer datos del servicio de forma masiva.
        </li>
        <li>
          Interferir con el funcionamiento del servicio, sobrecargarlo o
          introducir código malicioso.
        </li>
        <li>
          Suplantar a Allons, a un organizador o a otra persona, ni usar la
          marca Allons para engañar a terceros (phishing).
        </li>
      </ul>
      <p>
        Las investigaciones de seguridad de buena fe que sigan nuestro programa
        de <a href="/seguridad#divulgacion-responsable">divulgación
        responsable</a> no se consideran una infracción de esta sección.
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
        Cualquier controversia se someterá a los tribunales competentes de
        Honduras, sin perjuicio de los derechos que la ley te otorgue como
        consumidor.
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
