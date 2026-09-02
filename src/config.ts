/**
 * Todo el texto que Fava todavia tiene que confirmar vive aca, en un solo
 * lugar, para que cambiarlo no obligue a tocar componentes.
 *
 * PENDIENTE DE CLIENTE (ver README, seccion "Pendientes"):
 *   - titular y apoyo definitivos
 *   - texto exacto del consentimiento, revisado por ellos
 *   - URL de la politica de privacidad
 */
export const TEXTOS = {
  titular: 'Dejanos tus datos',
  apoyo: 'Te avisamos de las promos y novedades de Grupo Fava antes que a nadie.',

  panelTitulo: 'Cerca tuyo desde 1909.',
  panelApoyo: '40 sucursales en la Provincia de Buenos Aires.',
  panelPie: 'Fava Paseo de Compras · Tarjeta Favacard · Préstamos Muy',

  consentimiento:
    'Autorizo a Grupo Fava a guardar mis datos y a contactarme con novedades y promociones. Puedo pedir la baja cuando quiera.',

  /** Vacio = se muestra el texto sin enlace. Ley 25.326. */
  politicaUrl: '',

  botonEnviar: 'Enviar mis datos',
  botonEnviando: 'Enviando…',

  exitoTitulo: '¡Listo!',
  exitoOtra: 'Cargar otra respuesta',

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
