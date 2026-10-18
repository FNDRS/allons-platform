/**
 * The three public policies from the "Centro Legal de Allons" master
 * document (v1.1). The text is copied verbatim: legal approved it as written,
 * so edit the master document first and then mirror the change here. Two
 * deliberate deviations: allons.hn doesn't exist, so the site is
 * allonsapp.com, and the contact is soporte@ instead of contacto@.
 */

export interface LegalSection {
  heading: string;
  body: string[];
}

export const LEGAL_VERSION = "Versión 1.1 · Última actualización: 16 de octubre de 2026";

export const LEGAL_ENTITY = {
  name: "ALLONS S. de R.L.",
  rtn: "08019026444050",
  registry: "2631095",
  address: "Colonia San Juan, Tegucigalpa, Distrito Central, Honduras",
  email: "soporte@allonsapp.com",
  whatsapp: "+504 9722-0989",
  whatsappUrl: "https://wa.me/50497220989",
  web: "https://allonsapp.com",
} as const;

export const TERMS_SECTIONS: LegalSection[] = [
  {
    heading: "1. Identificación y aceptación",
    body: [
      "ALLONS S. de R.L. (\"ALLONS\" o \"la Plataforma\"), con RTN 08019026444050, matrícula mercantil 2631095 y domicilio comercial en Colonia San Juan, Tegucigalpa, Distrito Central, Honduras, ofrece servicios digitales mediante su aplicación y sitio web. Estos términos regulan el registro, uso y compra de boletos. Al utilizar la Plataforma o confirmar una compra, el usuario acepta estos términos y las políticas aplicables."
    ],
  },
  {
    heading: "2. Naturaleza del servicio",
    body: [
      "ALLONS facilita la publicación, comercialización, gestión y emisión de boletos digitales para eventos, clases y experiencias de terceros. Salvo indicación expresa, el organizador identificado es responsable de producir y realizar el evento, sus permisos, seguridad y contenido. ALLONS responde por sus propios servicios y obligaciones legales."
    ],
  },
  {
    heading: "3. Cuentas y registro",
    body: [
      "El usuario proporcionará información verdadera y actualizada, protegerá sus credenciales y notificará accesos no autorizados. ALLONS podrá restringir cuentas por fraude, suplantación o incumplimientos justificados, respetando derechos adquiridos. Los menores estarán sujetos a la normativa y restricciones de cada evento."
    ],
  },
  {
    heading: "4. Información de eventos",
    body: [
      "El organizador determinará y mantendrá actualizados nombre, descripción, fecha, lugar, precio, categorías, aforo, restricciones y condiciones de acceso. ALLONS podrá suspender publicaciones con información engañosa, riesgo de fraude o incumplimiento."
    ],
  },
  {
    heading: "5. Compras y procesamiento de pagos",
    body: [
      "La compra depende de la autorización bancaria y de los proveedores de procesamiento de pagos habilitados por ALLONS. Según el acuerdo con cada comercio, los fondos podrán distribuirse directamente entre los participantes autorizados o ALLONS podrá actuar como recaudador. Las identidades y condiciones comerciales de los proveedores constituyen información empresarial no pública, salvo cuando su comunicación sea exigida por ley o necesaria para informar debidamente al usuario. La compra se confirma cuando se aprueba el pago y se genera una orden válida. El usuario debe verificar los detalles antes de pagar."
    ],
  },
  {
    heading: "6. Precios y tarifas",
    body: [
      "El organizador fija el precio nominal. ALLONS podrá cobrar una tarifa de servicio acordada individualmente con cada comercio u organizador, sin porcentaje universal. Esta podrá cubrir procesamiento, tecnología, emisión y gestión. Antes de confirmar se mostrará el precio del boleto, los cargos aplicables y el total a pagar, incluidos impuestos cuando procedan. No se añadirán cargos no informados."
    ],
  },
  {
    heading: "7. Emisión y entrega",
    body: [
      "Los boletos se emitirán digitalmente mediante códigos QR o identificadores equivalentes y estarán disponibles dentro de la aplicación oficial de ALLONS. Cuando la funcionalidad esté habilitada, el usuario también podrá conservar su boleto en billeteras digitales compatibles, como Apple Wallet. Los boletos y sus códigos de acceso no se enviarán por correo electrónico. La validación de ingreso se realizará mediante la aplicación de comercio de ALLONS, utilizando los controles de autenticidad y uso único correspondientes. El comprador deberá verificar la disponibilidad de sus boletos y reportar cualquier incidencia. No se requiere impresión física."
    ],
  },
  {
    heading: "8. Uso único e intransferibilidad",
    body: [
      "Los boletos son personales, de uso único y no transferibles, salvo autorización expresa de ALLONS y del organizador. Se prohíbe revender, ceder, duplicar, alterar o falsificar boletos sin autorización. Cuando existan copias, prevalecerá la primera validación legítima, salvo que el evento contemple expresamente accesos múltiples. ALLONS responderá por fallas de seguridad que le sean atribuibles."
    ],
  },
  {
    heading: "9. Acceso al evento",
    body: [
      "El ingreso requiere boleto válido y cumplimiento de restricciones de edad, identificación, horarios, aforo y seguridad previamente informadas. El organizador aplicará las reglas de acceso de forma legítima y no discriminatoria. La negativa por incumplimiento del usuario no da derecho automático a devolución, sin perjuicio de la ley."
    ],
  },
  {
    heading: "10. Compras definitivas",
    body: [
      "Las compras confirmadas son definitivas. No se aceptan cancelaciones voluntarias, cambios ni reembolsos por errores de selección, cambio de planes o imposibilidad personal de asistir, salvo obligación legal. Los boletos tampoco podrán transferirse o cambiarse por otros eventos sin autorización expresa. Cancelaciones del evento, cargos duplicados y falta de emisión válida se gestionarán conforme a la Política de Reembolsos y la legislación aplicable."
    ],
  },
  {
    heading: "11. Cambios y reprogramaciones",
    body: [
      "El organizador comunicará oportunamente los cambios. Ante reprogramación, el boleto seguirá siendo válido para la nueva fecha salvo aviso distinto. La imposibilidad personal de asistir no genera automáticamente reembolso. Las modificaciones sustanciales que generen derechos conforme a ley serán atendidas según la Política de Reembolsos."
    ],
  },
  {
    heading: "12. Reclamaciones",
    body: [
      "ALLONS recibirá inicialmente las reclamaciones sobre compras y cancelaciones mediante sus canales oficiales, verificará la operación y coordinará con el organizador y el procesador. Procurará dar una primera respuesta dentro de cinco (5) días hábiles desde la recepción de los datos necesarios; esto no equivale a resolución final. Las devoluciones legalmente procedentes se tramitarán preferentemente al medio original, sujetas a tiempos bancarios."
    ],
  },
  {
    heading: "13. Obligaciones del organizador",
    body: [
      "El organizador es responsable de permisos, producción, seguridad, aforo, horarios, beneficios anunciados, comunicaciones de cambios y cumplimiento de obligaciones legales, fiscales y económicas. Cooperará con ALLONS ante incidencias y reclamaciones."
    ],
  },
  {
    heading: "14. Obligaciones de ALLONS",
    body: [
      "ALLONS prestará con diligencia razonable sus servicios tecnológicos, gestión de órdenes, emisión de boletos y soporte. No garantiza la calidad artística o realización material de eventos de terceros, pero sí responde por incumplimientos directamente atribuibles y responsabilidades no excluibles legalmente."
    ],
  },
  {
    heading: "15. Incidencias técnicas",
    body: [
      "Puede haber interrupciones por mantenimiento, conectividad o proveedores externos. ALLONS adoptará medidas razonables de asistencia y corrección. Si una falla propia impide prestar el servicio contratado, se aplicarán los remedios legales correspondientes."
    ],
  },
  {
    heading: "16. Promociones y cortesías",
    body: [
      "Boletos gratuitos, promociones y cortesías estarán sujetos a condiciones previamente comunicadas. ALLONS podrá invalidar beneficios obtenidos fraudulentamente."
    ],
  },
  {
    heading: "17. Datos personales",
    body: [
      "ALLONS tratará información necesaria para cuentas, compras, QR, soporte, prevención de fraude y cumplimiento legal, conforme a su Política de Privacidad independiente. Los organizadores y proveedores solo recibirán los datos necesarios para finalidades informadas."
    ],
  },
  {
    heading: "18. Servicios externos",
    body: [
      "Los anuncios y enlaces a comercios externos pueden redirigir fuera de ALLONS. Salvo indicación expresa, las transacciones posteriores se celebran con el tercero, responsable de sus propias condiciones y servicios."
    ],
  },
  {
    heading: "19. Propiedad intelectual",
    body: [
      "Marcas, diseños, software, contenidos y materiales de ALLONS están protegidos por la legislación aplicable. Se prohíbe su explotación no autorizada. Los materiales de organizadores pertenecen a sus titulares."
    ],
  },
  {
    heading: "20. Conductas prohibidas",
    body: [
      "Se prohíbe fraude, manipulación de QR, suplantación, acceso indebido, interferencia tecnológica y usos ilícitos. ALLONS podrá tomar medidas proporcionadas de seguridad."
    ],
  },
  {
    heading: "21. Contacto",
    body: [
      "Correo: soporte@allonsapp.com. Teléfono/WhatsApp: +504 9722-0989. Web: https://allonsapp.com. Domicilio: Colonia San Juan, Tegucigalpa, Distrito Central, Honduras. La primera respuesta a reclamaciones formales se procurará dentro de cinco (5) días hábiles."
    ],
  },
  {
    heading: "22. Actualizaciones",
    body: [
      "ALLONS podrá modificar estos términos por razones legales, operativas o comerciales y comunicará cambios sustanciales. No se aplicarán retroactivamente para perjudicar derechos adquiridos en compras confirmadas."
    ],
  },
  {
    heading: "23. Ley aplicable",
    body: [
      "Estos términos se rigen por las leyes de Honduras. El usuario conserva su derecho de acudir a autoridades administrativas y judiciales competentes."
    ],
  },
  {
    heading: "24. Integración y prevalencia",
    body: [
      "La Política de Privacidad, la Política de Reembolsos y las condiciones particulares del evento complementan estos términos. Prevalecerán las normas obligatorias y los derechos irrenunciables de los consumidores."
    ],
  },
];

export const REFUND_SECTIONS: LegalSection[] = [
  {
    heading: "1. Alcance y principio general",
    body: [
      "Esta política rige compras realizadas mediante ALLONS. Toda compra confirmada es definitiva. No se admiten devoluciones o cambios voluntarios, salvo autorización excepcional expresa o derecho legal obligatorio. La política debe estar disponible antes de pagar y no podrá empeorarse retroactivamente."
    ],
  },
  {
    heading: "2. No reembolso por motivos personales",
    body: [
      "No procede reembolso por cambios de planes, imposibilidad de asistir, enfermedad, transporte, selección errónea del evento, categoría o fecha, ni por inasistencia (no-show), salvo que la legislación aplicable exija otra solución."
    ],
  },
  {
    heading: "3. Intransferibilidad",
    body: [
      "Los boletos son personales, no transferibles y válidos para el evento indicado. La reventa, cesión o intercambio requieren autorización expresa de ALLONS y el organizador."
    ],
  },
  {
    heading: "4. Cancelación definitiva del evento",
    body: [
      "Si el organizador cancela definitivamente un evento, ALLONS recibirá la reclamación y coordinará la solución que corresponda conforme a la ley y los acuerdos aplicables. Cuando proceda devolución, se determinará el importe exigible, incluidos cargos obligatorios vinculados a la compra cuando legalmente corresponda. Las obligaciones internas del organizador no reducen derechos del comprador."
    ],
  },
  {
    heading: "5. Evento no prestado",
    body: [
      "Si el evento no se realiza o el servicio principal no se presta sustancialmente, ALLONS evaluará con el organizador las medidas legalmente procedentes, incluida la devolución cuando corresponda."
    ],
  },
  {
    heading: "6. Reprogramación",
    body: [
      "Ante cambio de fecha, el boleto conserva validez para la nueva programación salvo comunicación contraria. La imposibilidad personal de asistir no genera automáticamente devolución. Cuando el cambio sea sustancial y la ley reconozca un derecho, se ofrecerá el remedio correspondiente."
    ],
  },
  {
    heading: "7. Cambio de lugar o contenido",
    body: [
      "Cambios menores de horarios accesorios, artistas secundarios o ubicación dentro de un mismo recinto no generan por sí mismos derecho a devolución. Un traslado significativo o la supresión del elemento esencial anunciado se evaluará como modificación sustancial conforme a ley."
    ],
  },
  {
    heading: "8. Cobros duplicados y errores",
    body: [
      "Los cobros duplicados, transacciones aprobadas sin orden válida, emisión fallida atribuible a la Plataforma u otros errores verificables serán revisados y corregidos; se efectuará devolución cuando corresponda."
    ],
  },
  {
    heading: "9. Presentación de reclamaciones",
    body: [
      "El usuario contactará inicialmente a ALLONS en soporte@allonsapp.com o +504 9722-0989, indicando identificador de orden, evento, fecha, descripción del problema y evidencia razonablemente necesaria. No se solicitará documentación excesiva."
    ],
  },
  {
    heading: "10. Primera respuesta",
    body: [
      "ALLONS procurará emitir una primera respuesta dentro de cinco (5) días hábiles desde la recepción de la información necesaria. La resolución definitiva dependerá de la verificación y de la colaboración del organizador o procesador."
    ],
  },
  {
    heading: "11. Gestión con organizadores",
    body: [
      "ALLONS podrá trasladar la incidencia al organizador y coordinar su atención. Podrá iniciar devoluciones cuando lo permitan el contrato comercial, el proveedor de pagos y la legislación aplicable. La asignación de costos entre empresas no afectará derechos irrenunciables del comprador."
    ],
  },
  {
    heading: "12. Método y acreditación",
    body: [
      "Las devoluciones que excepcionalmente correspondan por disposición legal, cancelación definitiva, falta de prestación del servicio o errores de cobro comprobados se tramitarán preferentemente al medio de pago original, cuando sea técnicamente posible. La acreditación dependerá de los procedimientos del procesador de pagos y de las entidades financieras involucradas. La aprobación de una devolución no implica que el abono aparezca inmediatamente."
    ],
  },
  {
    heading: "13. Contracargos",
    body: [
      "El usuario conserva los derechos que le correspondan frente al banco emisor. ALLONS y el organizador podrán aportar documentación legítima para investigar operaciones disputadas."
    ],
  },
  {
    heading: "14. Fuerza mayor y comunicaciones",
    body: [
      "Circunstancias extraordinarias podrán motivar cancelación o reprogramación, sin eliminar obligaciones legales de devolución. ALLONS y el organizador comunicarán cambios por la aplicación, sitio web o canales de contacto disponibles. Las actualizaciones no afectarán retroactivamente derechos de compras previas."
    ],
  },
];

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    heading: "1. Responsable y alcance",
    body: [
      "ALLONS S. de R.L., con domicilio comercial en Colonia San Juan, Tegucigalpa, Distrito Central, Honduras, es responsable del tratamiento de datos que realice para sus propias finalidades mediante la Plataforma. Contacto: soporte@allonsapp.com y +504 9722-0989. Esta política comprende usuarios, compradores, asistentes, organizadores y anunciantes."
    ],
  },
  {
    heading: "2. Datos recopilados",
    body: [
      "Según las funciones utilizadas, ALLONS podrá tratar nombre, correo, teléfono, ciudad, credenciales protegidas, compras y órdenes, tipo de boleto, monto, identificadores QR, estado de pago, información necesaria de facturación, IP, dispositivo, registros de seguridad, navegación, búsquedas, favoritos, preferencias, comunicaciones de soporte y datos profesionales, tributarios o bancarios de organizadores. Los boletos se almacenan en la aplicación oficial y pueden incorporarse a billeteras digitales compatibles por elección del usuario; no se remiten códigos QR por correo electrónico. Solo se recopilarán datos necesarios para las funciones efectivamente prestadas."
    ],
  },
  {
    heading: "3. Origen de los datos",
    body: [
      "Los datos pueden provenir del propio usuario, su uso de la Plataforma, organizadores, procesadores de pagos y proveedores tecnológicos. No se importarán contactos ni datos de redes externas sin justificación y aviso adecuados."
    ],
  },
  {
    heading: "4. Finalidades",
    body: [
      "Los datos se utilizarán para registrar y administrar cuentas; mostrar eventos; procesar pagos; emitir boletos en la aplicación y, cuando corresponda, permitir su incorporación a billeteras digitales compatibles; validar los códigos QR mediante la aplicación de comercio de ALLONS; prevenir fraude; atender consultas y reclamaciones; personalizar recomendaciones; analizar rendimiento; cumplir obligaciones legales, contables y tributarias; y enviar comunicaciones promocionales cuando exista la autorización o fundamento aplicable."
    ],
  },
  {
    heading: "5. Datos compartidos con organizadores",
    body: [
      "ALLONS podrá facilitar al organizador los datos estrictamente necesarios para administrar asistentes, validar acceso, comunicar cambios y atender incidencias. No se autoriza la venta ni reutilización de listas de asistentes para publicidad ajena al evento sin fundamento y autorización adecuados. Los datos adicionales requeridos por un organizador deberán informarse al usuario."
    ],
  },
  {
    heading: "6. Proveedores y pagos",
    body: [
      "ALLONS podrá compartir exclusivamente los datos necesarios con proveedores autorizados de procesamiento de pagos, entidades financieras y prestadores de alojamiento tecnológico, seguridad, soporte, mensajería, notificaciones y analítica. La identidad de estos proveedores y las condiciones de sus acuerdos comerciales se consideran información empresarial reservada y no se publicarán de forma general, sin perjuicio de la información que deba facilitarse por exigencia legal, para ejercer derechos de privacidad o para cumplir obligaciones de transparencia frente al usuario. Los datos completos de tarjetas deberán ser tratados por proveedores de pago habilitados y no almacenarse en ALLONS salvo necesidad legítima y con las salvaguardas aplicables."
    ],
  },
  {
    heading: "7. Analítica, cookies y tecnologías similares",
    body: [
      "El sitio y la aplicación podrán utilizar tecnologías necesarias para sesiones, seguridad, medición y funcionamiento. Cuando se utilicen herramientas no esenciales de publicidad o perfilado, se proporcionarán los avisos y controles exigidos por la legislación aplicable."
    ],
  },
  {
    heading: "8. Ubicación",
    body: [
      "ALLONS podrá utilizar ciudad o ubicación aproximada para mostrar eventos relevantes. El acceso a ubicación precisa del dispositivo requerirá permiso del usuario cuando se implemente esa función. Rechazarlo no debería impedir funciones básicas que no dependan de GPS."
    ],
  },
  {
    heading: "9. Conservación",
    body: [
      "La información se conservará durante el tiempo necesario para prestar los servicios, resolver reclamaciones, prevenir fraude y cumplir obligaciones legales, fiscales o contables. Los períodos concretos dependerán de la categoría de datos y de las obligaciones aplicables; no se conservarán indefinidamente sin una finalidad legítima."
    ],
  },
  {
    heading: "10. Seguridad",
    body: [
      "ALLONS aplicará medidas técnicas y organizativas razonables y proporcionales al riesgo para proteger los datos personales, incluidos controles de acceso y mecanismos de protección de credenciales y comunicaciones. Ningún sistema puede garantizar seguridad absoluta."
    ],
  },
  {
    heading: "11. Derechos del usuario",
    body: [
      "El usuario podrá solicitar acceso, actualización, corrección y, cuando legalmente corresponda, eliminación, oposición o limitación del tratamiento. Las solicitudes se enviarán a soporte@allonsapp.com. ALLONS podrá verificar razonablemente la identidad del solicitante y responder conforme a la legislación aplicable, incluido el marco de hábeas data en Honduras."
    ],
  },
  {
    heading: "12. Infraestructura internacional",
    body: [
      "La prestación de los servicios podrá requerir el tratamiento o alojamiento de determinados datos fuera de Honduras mediante proveedores tecnológicos autorizados. Cuando corresponda, ALLONS aplicará las garantías exigidas por la legislación y facilitará la información que resulte legalmente obligatoria, sin publicar detalles confidenciales de infraestructura o acuerdos comerciales."
    ],
  },
  {
    heading: "13. Menores de edad",
    body: [
      "ALLONS procurará limitar la recopilación de datos de menores a lo necesario y aplicar los requisitos de autorización, información y protección correspondientes cuando un evento o función se dirija a menores."
    ],
  },
  {
    heading: "14. Cambios de política",
    body: [
      "ALLONS podrá actualizar esta política cuando cambien sus funciones, proveedores o las normas aplicables. Las modificaciones relevantes se comunicarán razonablemente y cada versión mostrará su fecha de actualización."
    ],
  },
  {
    heading: "15. Contacto de privacidad",
    body: [
      "Para consultas y ejercicio de derechos: soporte@allonsapp.com; WhatsApp +504 9722-0989; https://allonsapp.com. Dirección comercial: Colonia San Juan, Tegucigalpa, Distrito Central, Honduras."
    ],
  },
];

