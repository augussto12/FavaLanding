/**
 * Todo el copy vive aca, en un solo lugar, para que cambiarlo no obligue a
 * tocar componentes.
 *
 * OJO, PENDIENTE DE CLIENTE: los textos de `unidades` y el titular son
 * placeholders escritos por nosotros a partir del relevamiento. Los datos
 * duros (1909, marplatense, 40 sucursales, las tres unidades) vienen del
 * brief; las descripciones de cada unidad NO estan confirmadas por Fava.
 * Antes de publicar, que las revisen ellos.
 */
export const TEXTOS = {
  // ---- Banner ----
  eyebrow: 'Desde 1909',
  titular: 'Cerca tuyo\ndesde hace\n117 años',
  apoyo:
    'Dejanos tus datos y enterate antes que nadie de las promos, beneficios y novedades de Grupo Fava.',
  cta: 'Dejar mis datos',

  // ---- Credenciales ----
  credenciales: [
    { dato: '1909', detalle: 'Fundada en Mar del Plata' },
    { dato: '40', detalle: 'Sucursales en la Provincia' },
    { dato: '3', detalle: 'Unidades de negocio' },
  ],

  // ---- Unidades de negocio (descripciones sin confirmar) ----
  unidadesTitulo: 'Tres formas de estar cerca',
  unidades: [
    {
      nombre: 'Fava Paseo de Compras',
      detalle: 'Indumentaria, hogar y tecnología en las 40 sucursales del grupo.',
    },
    {
      nombre: 'Tarjeta Favacard',
      detalle: 'La tarjeta regional, con beneficios en los comercios adheridos.',
    },
    {
      nombre: 'Préstamos Muy',
      detalle: 'Préstamos personales, simples y resueltos cerca de casa.',
    },
  ],

  // ---- Formulario ----
  formularioTitulo: 'Dejanos tus datos',
  formularioApoyo: 'Es un minuto. Te llega un mail de confirmación al instante.',

  consentimiento:
    'Autorizo a Grupo Fava a guardar mis datos y a contactarme con novedades y promociones. Puedo pedir la baja cuando quiera.',

  /** Vacio = se muestra el texto sin enlace. Ley 25.326. */
  politicaUrl: '',

  botonEnviar: 'Enviar mis datos',
  botonEnviando: 'Enviando…',

  // ---- Exito ----
  exitoTitulo: '¡Listo!',
  exitoOtra: 'Cargar otra respuesta',

  // ---- Pie ----
  piePrincipal: 'Grupo Fava · Mar del Plata',
  pieSecundario: 'Fava Paseo de Compras · Tarjeta Favacard · Préstamos Muy',

  /** A quien avisar si algo falla durante el evento. */
  contactoStand: 'Avisale a alguien del stand y lo cargamos a mano.',
} as const;

/** Marca de donde vino el registro, util si mañana hay mas de un stand. */
export const ORIGEN = 'stand';

/**
 * Turnstile solo se monta si hay site key. Sin ella el formulario funciona
 * igual (util en local); la validacion real pasa siempre en el Apps Script.
 */
export const TURNSTILE_ACTIVO = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY);
