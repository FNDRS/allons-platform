import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

const CONTACT = "soporte@allonsapp.com";

export const metadata: Metadata = {
  title: "Política de Seguridad",
  description:
    "Cómo Allons protege tu cuenta, tus pagos y tus datos, y cómo reportar una vulnerabilidad de forma responsable.",
  alternates: { canonical: "/seguridad" },
};

export default function SeguridadPage() {
  return (
    <LegalPage
      title="Política de Seguridad"
      updated="Última actualización: 24 de septiembre de 2026"
    >
      <p>
        La seguridad de tu cuenta, tus boletos y tus pagos es parte del
        producto. Esta política describe las medidas con las que protegemos la
        App, el sitio <strong>allonsapp.com</strong> y el panel de comercios,
        qué hacemos si ocurre un incidente y cómo puedes reportarnos una
        vulnerabilidad.
      </p>

      <h2>1. Marco de referencia</h2>
      <p>
        Diseñamos y revisamos nuestros controles tomando como referencia
        estándares reconocidos de la industria: el{" "}
        <strong>OWASP Top 10</strong> y el{" "}
        <strong>OWASP Application Security Verification Standard (ASVS)</strong>{" "}
        para aplicaciones web, los principios de{" "}
        <strong>ISO/IEC 27001</strong> para la gestión de la seguridad de la
        información y los requisitos de <strong>PCI DSS</strong> aplicables a
        páginas que reciben datos de tarjeta. Tomarlos como referencia no
        equivale a una certificación; cuando obtengamos alguna, la publicaremos
        aquí.
      </p>

      <h2>2. Medidas técnicas</h2>
      <ul>
        <li>
          <strong>Cifrado en tránsito.</strong> Todo el tráfico viaja por HTTPS
          (TLS). El sitio exige HTTPS con HSTS, por lo que tu navegador nunca se
          conecta sin cifrado.
        </li>
        <li>
          <strong>Contraseñas.</strong> No guardamos tu contraseña: nuestro
          proveedor de autenticación almacena solo un hash con sal. El inicio
          de sesión con proveedores externos usa el flujo PKCE.
        </li>
        <li>
          <strong>Sesiones.</strong> Usamos tokens de acceso de corta duración
          que se renuevan automáticamente; al cerrar sesión se revoca la sesión.
        </li>
        <li>
          <strong>Pagos.</strong> Los datos de tarjeta viajan cifrados y se
          tokenizan con nuestro procesador de pagos (Paygate). Allons no
          almacena el número completo de la tarjeta ni el código de seguridad
          (CVV); de una tarjeta guardada solo conservamos la marca, los últimos
          cuatro dígitos y el vencimiento.
        </li>
        <li>
          <strong>Protección del navegador.</strong> El sitio envía una
          política de seguridad de contenido (CSP) que limita a qué servidores
          puede enviar datos la página, impide que se muestre dentro de otros
          sitios (clickjacking) y bloquea contenido mixto, además de otras
          cabeceras de seguridad (<code>X-Content-Type-Options</code>,{" "}
          <code>Referrer-Policy</code>, <code>Permissions-Policy</code>).
        </li>
        <li>
          <strong>Control de acceso.</strong> Cada solicitud a nuestra API se
          autentica y se autoriza según tu rol (asistente, comercio o staff).
          Un comercio solo ve los datos de sus propios eventos.
        </li>
        <li>
          <strong>Mínimo privilegio.</strong> Las credenciales con privilegios
          elevados viven solo en nuestros servidores y nunca se envían al
          navegador ni a la App.
        </li>
        <li>
          <strong>Abuso y fraude.</strong> Validamos todas las entradas en el
          servidor, limitamos la frecuencia de solicitudes y rechazamos
          envíos de formularios que no se originan en nuestro sitio.
        </li>
        <li>
          <strong>Monitoreo.</strong> Registramos errores para corregirlos sin
          enviar datos personales al servicio de monitoreo y sin grabar tus
          sesiones de navegación.
        </li>
        <li>
          <strong>Infraestructura.</strong> Alojamos el servicio con
          proveedores de nube que cuentan con certificaciones de seguridad
          reconocidas (por ejemplo, SOC 2 e ISO/IEC 27001).
        </li>
      </ul>

      <h2>3. Medidas organizativas</h2>
      <ul>
        <li>
          El acceso a datos personales y a sistemas de producción se limita al
          personal que lo necesita para su trabajo.
        </li>
        <li>
          Todo cambio de código pasa por revisión y por verificaciones
          automáticas antes de publicarse.
        </li>
        <li>
          Mantenemos nuestras dependencias actualizadas y atendemos con
          prioridad las vulnerabilidades publicadas que nos afectan.
        </li>
      </ul>

      <h2>4. Gestión de incidentes</h2>
      <p>
        Si detectamos un incidente de seguridad que afecte tus datos
        personales, lo contenemos, investigamos su alcance y te lo notificamos
        sin demora indebida —y, cuando sea posible, dentro de las{" "}
        <strong>72 horas</strong> siguientes a confirmarlo— por correo
        electrónico o dentro de la App, indicando qué pasó, qué datos se vieron
        afectados, qué hicimos y qué te recomendamos hacer. Cuando la ley lo
        exija, informaremos también a las autoridades competentes.
      </p>

      <h2>5. Cómo puedes protegerte</h2>
      <ul>
        <li>Usa una contraseña única para Allons y no la compartas.</li>
        <li>
          Tu código QR es tu entrada: no lo publiques en redes sociales ni lo
          envíes a desconocidos.
        </li>
        <li>
          <strong>
            Allons nunca te pedirá tu contraseña, el código de seguridad (CVV)
            de tu tarjeta ni códigos de verificación
          </strong>{" "}
          por correo, WhatsApp, redes sociales o teléfono. Si recibes una
          solicitud así, no respondas y repórtala a{" "}
          <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
        </li>
        <li>
          Compra solo en <strong>allonsapp.com</strong> o en la App oficial.
          Verifica la dirección antes de ingresar datos de pago.
        </li>
      </ul>

      <h2 id="divulgacion-responsable">6. Divulgación responsable</h2>
      <p>
        Si encontraste una vulnerabilidad en Allons, te agradecemos que nos la
        reportes. Escríbenos a <a href={`mailto:${CONTACT}`}>{CONTACT}</a> con
        el asunto <strong>&quot;Seguridad&quot;</strong>, una descripción del
        problema, los pasos para reproducirlo y su posible impacto. También
        publicamos nuestro contacto en{" "}
        <a href="/.well-known/security.txt">/.well-known/security.txt</a>.
      </p>
      <p>
        <strong>Alcance:</strong> allonsapp.com, api.allonsapp.com y las apps
        oficiales de Allons para iOS y Android.
      </p>
      <p>
        <strong>Te pedimos que:</strong>
      </p>
      <ul>
        <li>
          No accedas, modifiques ni borres datos de otras personas; usa solo
          cuentas propias o de prueba.
        </li>
        <li>
          No realices pruebas de denegación de servicio, spam, ingeniería
          social ni ataques físicos.
        </li>
        <li>
          No uses herramientas automatizadas que degraden el servicio para
          otros usuarios.
        </li>
        <li>
          Nos des un plazo razonable (90 días) para corregir el problema antes
          de divulgarlo públicamente.
        </li>
      </ul>
      <p>
        <strong>Nuestro compromiso:</strong> acusaremos recibo en un máximo de
        5 días hábiles, te mantendremos informado del avance y te daremos
        crédito públicamente si lo deseas. Si actúas de buena fe y dentro de
        estas reglas, no emprenderemos acciones legales en tu contra por tu
        investigación.
      </p>

      <h2>7. Cambios</h2>
      <p>
        Actualizamos esta política cuando cambian nuestras medidas. La versión
        vigente se publica en esta página con su fecha de actualización.
      </p>

      <h2>8. Contacto</h2>
      <p>
        Dudas o reportes de seguridad:{" "}
        <a href={`mailto:${CONTACT}?subject=Seguridad`}>{CONTACT}</a>.
      </p>
    </LegalPage>
  );
}
