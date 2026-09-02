import { z } from 'zod';
import { normalizarDni, normalizarTelefono } from './telefono';
import { GENEROS, VALORES_LOCALIDAD } from '../data/localidades';

/**
 * Los mensajes son los que ve el visitante. Concretos, no "Campo invalido":
 * el publico historico de Fava incluye gente mayor y hay 30 segundos de
 * paciencia, no mas.
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

  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Necesitamos tu email para mandarte la confirmación')
    .email('Revisá el email, le falta algo. Ejemplo: nombre@gmail.com'),

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
      (v) => v === '' || /^\d{10}$/.test(v),
      'El teléfono va con código de área y sin el 15. Ejemplo: 2235123456',
    ),

  localidad: z
    .string()
    .refine(
      (v) => v === '' || VALORES_LOCALIDAD.includes(v),
      'Elegí una localidad de la lista',
    ),

  genero: z
    .string()
    .refine(
      (v) => v === '' || (GENEROS as readonly string[]).includes(v),
      'Elegí una opción de la lista',
    ),

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
  email: '',
  dni: '',
  telefono: '',
  localidad: '',
  genero: '',
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
