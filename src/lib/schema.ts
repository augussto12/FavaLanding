import { z } from 'zod';
import { normalizarDni, normalizarTelefono } from './telefono';
import { VALORES_ANIO, VALORES_CAMINO } from '../data/opciones';

/**
 * Los mensajes son los que ve el visitante. Concretos, no "Campo invalido":
 * hay 30 segundos de paciencia, no mas, y con gente esperando atras.
 *
 * Campos segun el brief de la Expo UFASTA. Ahi el telefono pasa a ser
 * obligatorio, y localidad y genero salieron del formulario.
 */
export const esquema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, 'Escribí tu nombre, al menos 2 letras')
    .max(50, 'El nombre no puede pasar de 50 caracteres'),

  apellido: z
    .string()
    .trim()
    .min(2, 'Escribí tu apellido, al menos 2 letras')
    .max(50, 'El apellido no puede pasar de 50 caracteres'),

  dni: z
    .string()
    .transform(normalizarDni)
    .refine(
      (v) => /^\d{7,8}$/.test(v),
      'El DNI va sin puntos, entre 7 y 8 números',
    ),

  telefono: z
    .string()
    .transform(normalizarTelefono)
    .refine(
      (v) => /^\d{10}$/.test(v),
      'El teléfono va con código de área y sin el 15. Ejemplo: 2235123456',
    ),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Necesitamos tu email para mandarte la información')
    .email('Revisá el email, le falta algo. Ejemplo: nombre@gmail.com'),

  estudios: z
    .string()
    .trim()
    .min(2, 'Contanos qué estudiás o estudiaste')
    .max(100, 'No puede pasar de 100 caracteres'),

  anioCarrera: z
    .string()
    .optional()
    .refine((v) => !v || VALORES_ANIO.includes(v), 'Elegí una opción de la lista'),

  camino: z
    .string()
    .refine((v) => VALORES_CAMINO.includes(v), 'Elegí uno de los cuatro caminos'),

  consentimiento: z.literal(true, {
    errorMap: () => ({
      message: 'Necesitamos tu permiso para guardar los datos',
    }),
  }),
});

/** Lo que el usuario tipea (antes de las transformaciones de zod). */
export type FormularioEntrada = z.input<typeof esquema>;
/** Lo que sale validado y normalizado. */
export type FormularioSalida = z.output<typeof esquema>;

export const VALORES_INICIALES: FormularioEntrada = {
  nombre: '',
  apellido: '',
  dni: '',
  telefono: '',
  email: '',
  estudios: '',
  anioCarrera: '',
  camino: '',
  consentimiento: false as unknown as true,
};

/** Payload exacto que espera el Apps Script. */
export type Payload = FormularioSalida & {
  token: string;
  submissionId: string;
  turnstileToken: string;
  origen: string;
  enviadoEn: string;
};
