/**
 * Opciones de los campos nuevos de la expo UFASTA.
 */

/**
 * Los cuatro caminos de la dinamica del stand. El valor es lo que se guarda
 * en la planilla; el emoji es solo visual y no viaja al backend.
 */
export const CAMINOS = [
  { valor: 'Crear', emoji: '💡' },
  { valor: 'Resolver', emoji: '🧠' },
  { valor: 'Conectar', emoji: '🤝' },
  { valor: 'Hacer crecer', emoji: '📈' },
] as const;

export const VALORES_CAMINO: string[] = CAMINOS.map((c) => c.valor);

/**
 * Un solo select en vez de un campo condicional: en un stand, un formulario
 * que se mueve solo mientras lo completan es peor que uno con una opcion mas.
 * Las dos ultimas cubren a quien ya termino y a quien todavia no arranco.
 */
export const ANIOS_CARRERA = [
  '1º año',
  '2º año',
  '3º año',
  '4º año',
  '5º año',
  '6º año',
  'Ya me recibí',
  'Todavía no empecé',
] as const;

export const VALORES_ANIO: string[] = [...ANIOS_CARRERA];
