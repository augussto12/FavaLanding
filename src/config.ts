/**
 * Todo el copy vive aca, en un solo lugar.
 *
 * Los textos del banner, los premios y los campos vienen del brief de la
 * Expo UFASTA. Lo unico que sigue sin confirmar de Fava son las tres
 * descripciones de `unidades`, que escribimos nosotros.
 */
export const TEXTOS = {
  // ---- Banner ----
  eyebrow: 'Expo UFASTA',
  titular: 'Hay mucho más\ndetrás de FAVA.',
  apoyo: 'Conocé todo lo que hacemos y a las personas que lo hacen posible.',
  secundaria:
    '¡Completá tus datos, conocé nuestras propuestas laborales y participá de un sorteo especial!',
  premios: [
    { emoji: '🎒', nombre: 'Mochila' },
    { emoji: '🥤', nombre: 'Botella' },
    { emoji: '🎧', nombre: 'Auriculares' },
  ],
  cta: 'Completá tus datos',

  // ---- Credenciales ----
  credenciales: [
    { dato: '1909', detalle: 'Fundada en Mar del Plata' },
    { dato: '40', detalle: 'Sucursales en la Provincia' },
    { dato: '3', detalle: 'Unidades de negocio' },
  ],

  // ---- Unidades de negocio (descripciones sin confirmar por Fava) ----
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
  formularioTitulo: '¡Queremos conocerte!',
  formularioApoyo:
    'Completá tus datos para que podamos seguir en contacto y participar del sorteo.',

  caminoTitulo: '¿Qué camino elegiste?',

  consentimiento:
    'Acepto que Grupo Fava guarde mis datos, me envíe información y oportunidades laborales, y me incluya en el sorteo.',

  /** Vacio = se muestra el texto sin enlace. Ley 25.326. */
  politicaUrl: '',

  botonEnviar: 'Enviar y participar',
  botonEnviando: 'Enviando…',

  // ---- Exito ----
  exitoTitulo: '¡Listo, ya estás participando!',
  cierreTitulo: '¡Gracias por participar! 🙌',
  cierreApoyo:
    'Tus datos se registraron correctamente y ya estás participando del sorteo. Además, revisá tu mail: te enviamos más información para que puedas conocer todo lo que hay detrás de Grupo FAVA y nuestras oportunidades laborales.',
  exitoOtra: 'Cargar otra respuesta',

  // ---- Pie ----
  piePrincipal: 'Grupo Fava · Mar del Plata',
  pieSecundario: 'Fava Paseo de Compras · Tarjeta Favacard · Préstamos Muy',

  /** A quien avisar si algo falla durante el evento. */
  contactoStand: 'Avisale a alguien del stand y lo cargamos a mano.',
} as const;

/** Marca de donde vino el registro, util si mañana hay mas de un stand. */
export const ORIGEN = 'expo-ufasta';

/**
 * Turnstile solo se monta si hay site key. Sin ella el formulario funciona
 * igual (util en local); la validacion real pasa siempre en el Apps Script.
 */
export const TURNSTILE_ACTIVO = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY);
