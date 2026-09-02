/**
 * Localidades tal como las tiene cargadas Fava hoy, con su codigo interno.
 * Tomadas del <select name="location"> de fava.esmundial.com.ar/staff/index.php
 *
 * Se guarda el `valor` completo (codigo + nombre) en la planilla para que
 * despues puedan cruzarlo contra su propia base sin adivinar por texto.
 */
export type Localidad = { valor: string; etiqueta: string };

export const LOCALIDADES: Localidad[] = [
  { valor: '2-Adolfo Gonzales Chaves', etiqueta: 'Adolfo Gonzales Chaves' },
  { valor: '5-Ayacucho', etiqueta: 'Ayacucho' },
  { valor: '6-Azul', etiqueta: 'Azul' },
  { valor: '7-Bahía Blanca', etiqueta: 'Bahía Blanca' },
  { valor: '8-Balcarce', etiqueta: 'Balcarce' },
  { valor: '10-Benito Juárez', etiqueta: 'Benito Juárez' },
  { valor: '12-Bolívar', etiqueta: 'Bolívar' },
  { valor: '18-Carlos Casares', etiqueta: 'Carlos Casares' },
  { valor: '120-Comandante Nicanor Otamendi', etiqueta: 'Comandante Nicanor Otamendi' },
  { valor: '27-Coronel Dorrego', etiqueta: 'Coronel Dorrego' },
  { valor: '28-Coronel Pringles', etiqueta: 'Coronel Pringles' },
  { valor: '29-Coronel Suárez', etiqueta: 'Coronel Suárez' },
  { valor: '71-Coronel Vidal', etiqueta: 'Coronel Vidal' },
  { valor: '30-Daireaux', etiqueta: 'Daireaux' },
  { valor: '31-Dolores', etiqueta: 'Dolores' },
  { valor: '41-General Juan Madariaga', etiqueta: 'General Juan Madariaga' },
  { valor: '42-General La Madrid', etiqueta: 'General La Madrid' },
  { valor: '51-Henderson', etiqueta: 'Henderson' },
  { valor: '62-Laprida', etiqueta: 'Laprida' },
  { valor: '67-Lobería', etiqueta: 'Lobería' },
  { valor: '70-Maipú', etiqueta: 'Maipú' },
  { valor: '60-Mar de Ajó', etiqueta: 'Mar de Ajó' },
  { valor: '47-Mar del Plata', etiqueta: 'Mar del Plata' },
  { valor: '36-Miramar', etiqueta: 'Miramar' },
  { valor: '81-Necochea', etiqueta: 'Necochea' },
  { valor: '82-Nueve de Julio', etiqueta: 'Nueve de Julio' },
  { valor: '83-Olavarría', etiqueta: 'Olavarría' },
  { valor: '85-Pehuajó', etiqueta: 'Pehuajó' },
  { valor: '90-Pinamar', etiqueta: 'Pinamar' },
  { valor: '26-Punta Alta', etiqueta: 'Punta Alta' },
  { valor: '94-Rauch', etiqueta: 'Rauch' },
  { valor: '99-Saladillo', etiqueta: 'Saladillo' },
  { valor: '108-Tandil', etiqueta: 'Tandil' },
  { valor: '109-Tapalqué', etiqueta: 'Tapalqué' },
  { valor: '112-Trenque Lauquen', etiqueta: 'Trenque Lauquen' },
  { valor: '113-Tres Arroyos', etiqueta: 'Tres Arroyos' },
  { valor: '116-Villa Gesell', etiqueta: 'Villa Gesell' },
  { valor: '119-~OTROS~', etiqueta: 'Otra' },
];

export const VALORES_LOCALIDAD = LOCALIDADES.map((l) => l.valor);

export const GENEROS = [
  'Masculino',
  'Femenino',
  'Otro',
  'Prefiero no decirlo',
] as const;

/**
 * Localidad preseleccionada segun donde se monte el stand. Un tap menos por
 * visitante, que por 300 visitantes no es poco.
 */
export const LOCALIDAD_DEFECTO: string = VALORES_LOCALIDAD.includes(
  import.meta.env.VITE_LOCALIDAD_DEFECTO ?? '',
)
  ? (import.meta.env.VITE_LOCALIDAD_DEFECTO as string)
  : '';
