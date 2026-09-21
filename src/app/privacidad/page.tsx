import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

const CONTACT = "soporte@allonsapp.com";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Cómo Allons recopila, usa y protege tu información en la app de eventos y boletos.",
  alternates: { canonical: "/privacidad" },
};

export default function PrivacidadPage() {
  return (
    <LegalPage
      title="Política de Privacidad"
      updated="Última actualización: 24 de junio de 2026"
    >
      <p>
        En Allons valoramos tu privacidad. Esta política explica qué información
        recopilamos a través de la aplicación móvil Allons (la &quot;App&quot;) y
        nuestros servicios, cómo la usamos y cuáles son tus derechos. Al usar la
        App aceptas las prácticas descritas aquí.
      </p>

      <div className="card">
        <strong>Responsable del tratamiento:</strong> Allons
        <br />
        <strong>Contacto:</strong> <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
      </div>

      <h2>1. Información que recopilamos</h2>
      <table>
        <thead>
          <tr>
            <th>Categoría</th>
            <th>Datos</th>
            <th>Finalidad</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Cuenta</td>
            <td>Nombre, correo, contraseña (cifrada), foto de perfil</td>
            <td>Crear y gestionar tu cuenta</td>
          </tr>
          <tr>
            <td>Identificadores</td>
            <td>ID de usuario, identificadores de dispositivo</td>
            <td>Operar la App y análisis</td>
          </tr>
          <tr>
            <td>Ubicación</td>
            <td>Ubicación aproximada (mientras usas la App)</td>
            <td>Mostrarte eventos cercanos</td>
          </tr>
          <tr>
            <td>Compras</td>
            <td>Historial de boletos y órdenes</td>
            <td>Entregar y validar tus boletos</td>
          </tr>
          <tr>
            <td>Uso</td>
            <td>Interacción con la App, eventos vistos</td>
            <td>Mejorar el producto (análisis)</td>
          </tr>
          <tr>
            <td>Notificaciones</td>
            <td>Token de notificaciones push</td>
            <td>Enviarte avisos de tus eventos</td>
          </tr>
        </tbody>
      </table>

      <h2>2. Cómo usamos tu información</h2>
      <ul>
        <li>
          Para operar la App: descubrir eventos, comprar boletos y mostrar tu
          código QR de acceso.
        </li>
        <li>
          Para comunicarnos contigo sobre tus compras, eventos y soporte.
        </li>
        <li>
          Para mejorar y proteger el servicio, prevenir fraude y cumplir
          obligaciones legales.
        </li>
      </ul>

      <h2>3. Pagos</h2>
      <p>
        Los pagos de boletos se procesan a través de nuestro proveedor de
        pasarela de pago externo (Paygate) en su propio entorno seguro.{" "}
        <strong>Allons no almacena los datos completos de tu tarjeta.</strong> La
        información de pago se rige también por las políticas del procesador.
      </p>

      <h2>4. Servicios de terceros</h2>
      <p>
        Usamos proveedores que tratan datos en nuestro nombre, exclusivamente
        para prestar el servicio:
      </p>
      <ul>
        <li>
          <strong>Supabase</strong> — autenticación y base de datos.
        </li>
        <li>
          <strong>Paygate</strong> — procesamiento de pagos.
        </li>
        <li>
          <strong>PostHog</strong> — análisis de uso del producto (primera
          parte; no usamos estos datos para rastrearte entre apps de otras
          empresas).
        </li>
        <li>
          <strong>Expo / proveedores de notificaciones push</strong> — entrega
          de notificaciones.
        </li>
      </ul>

      <h2>5. Permisos del dispositivo</h2>
      <ul>
        <li>
          <strong>Cámara</strong> — para escanear códigos QR y validar accesos
          en la entrada del evento.
        </li>
        <li>
          <strong>Ubicación</strong> — para mostrarte eventos cerca de ti.
        </li>
        <li>
          <strong>Fotos</strong> — para que elijas tu foto de perfil.
        </li>
        <li>
          <strong>Notificaciones</strong> — para avisarte sobre tus boletos y
          eventos.
        </li>
      </ul>
      <p>
        Puedes revocar estos permisos en cualquier momento desde los ajustes de
        tu dispositivo.
      </p>

      <h2>6. Con quién compartimos datos</h2>
      <p>
        No vendemos tus datos personales. Compartimos información únicamente con:
        los proveedores listados arriba; los organizadores del evento al que
        compras un boleto (para validar tu acceso); y autoridades cuando la ley
        lo exija.
      </p>

      <h2>7. Conservación</h2>
      <p>
        Conservamos tus datos mientras tu cuenta esté activa y durante el tiempo
        necesario para cumplir obligaciones legales, contables y de prevención
        de fraude. Al eliminar tu cuenta, borramos o anonimizamos tus datos
        según lo descrito en nuestra{" "}
        <a href="/eliminar-cuenta">página de eliminación de cuenta</a>.
      </p>

      <h2>8. Tus derechos</h2>
      <p>
        Puedes solicitar acceso, corrección o eliminación de tus datos, así como
        una copia de los mismos, escribiendo a{" "}
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. También puedes eliminar tu
        cuenta directamente (ver <a href="/eliminar-cuenta">Eliminar cuenta</a>).
      </p>

      <h2>9. Seguridad</h2>
      <p>
        Aplicamos medidas técnicas y organizativas razonables para proteger tu
        información. Ningún sistema es 100% seguro, pero trabajamos para mantener
        tus datos protegidos.
      </p>

      <h2>10. Menores</h2>
      <p>
        La App no está dirigida a menores de 13 años y no recopilamos
        conscientemente sus datos. Los usuarios menores de edad deben usar la App
        bajo supervisión de un adulto responsable.
      </p>

      <h2>11. Cambios a esta política</h2>
      <p>
        Podemos actualizar esta política. Publicaremos la versión vigente en esta
        página con su fecha de actualización.
      </p>

      <h2>12. Contacto</h2>
      <p>
        ¿Preguntas sobre privacidad? Escríbenos a{" "}
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>
    </LegalPage>
  );
}
