import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

const CONTACT = "soporte@allonsapp.com";

export const metadata: Metadata = {
  title: "Política de Cookies y Almacenamiento",
  description:
    "Qué guarda allonsapp.com en tu navegador, para qué lo usa y cómo borrarlo.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <LegalPage
      title="Política de Cookies y Almacenamiento"
      updated="Última actualización: 24 de septiembre de 2026"
    >
      <p>
        Esta política explica qué información guarda el sitio{" "}
        <strong>allonsapp.com</strong> en tu navegador. En resumen:{" "}
        <strong>
          no usamos cookies de publicidad ni de rastreo entre sitios
        </strong>
        . Solo guardamos lo necesario para que el sitio funcione.
      </p>

      <h2>1. Qué usamos</h2>
      <p>
        En lugar de cookies, el sitio usa el almacenamiento local de tu
        navegador (<code>localStorage</code> y <code>sessionStorage</code>).
        Todo lo que se guarda es estrictamente necesario para prestarte el
        servicio que pides, por lo que no requiere un consentimiento aparte.
      </p>
      <table>
        <thead>
          <tr>
            <th>Qué</th>
            <th>Para qué</th>
            <th>Duración</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Sesión de tu cuenta</td>
            <td>Mantenerte con la sesión iniciada de forma segura</td>
            <td>Hasta que cierres sesión</td>
          </tr>
          <tr>
            <td>Destino después de iniciar sesión</td>
            <td>Regresarte a la página donde estabas</td>
            <td>1 hora</td>
          </tr>
          <tr>
            <td>Reserva en curso</td>
            <td>Recordar el tiempo que te queda para completar tu compra</td>
            <td>Hasta cerrar la pestaña</td>
          </tr>
          <tr>
            <td>Enlace de pago</td>
            <td>Retomar un pago abierto en otra pestaña</td>
            <td>Hasta cerrar la pestaña</td>
          </tr>
          <tr>
            <td>Preferencias del panel (comercios)</td>
            <td>Recordar si ocultaste los montos del panel</td>
            <td>Hasta que la borres</td>
          </tr>
        </tbody>
      </table>

      <h2>2. Servicios de terceros al cargar el sitio</h2>
      <ul>
        <li>
          <strong>Google Fonts</strong> — sirve la tipografía del sitio. Tu
          navegador se conecta a los servidores de Google, que reciben tu
          dirección IP como en cualquier descarga.
        </li>
        <li>
          <strong>Monitoreo de errores</strong> — si algo falla, enviamos un
          reporte técnico del error a través de nuestro propio dominio, sin
          datos personales y sin grabar tu sesión.
        </li>
      </ul>
      <p>
        No usamos píxeles de redes sociales, herramientas de publicidad ni
        análisis que te sigan en otros sitios. Si esto cambia, actualizaremos
        esta página y te pediremos tu consentimiento antes de activarlos.
      </p>

      <h2>3. Cómo borrar esta información</h2>
      <p>
        Cerrar sesión borra tu sesión. Además, puedes eliminar todo lo que el
        sitio guardó desde la configuración de tu navegador (&quot;Borrar datos
        de navegación&quot; o &quot;Datos del sitio&quot;). Si lo haces,
        tendrás que iniciar sesión de nuevo.
      </p>

      <h2>4. Más información</h2>
      <p>
        Para saber cómo tratamos tus datos personales consulta nuestra{" "}
        <a href="/privacidad">Política de Privacidad</a>. Dudas:{" "}
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>
    </LegalPage>
  );
}
