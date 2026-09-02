import type { Payload } from './schema';
import { ErrorRed, ErrorServidor, ErrorValidacion, esErrorDeRed, esperar } from './errores';

const TIMEOUT_MS = 15_000;
const REINTENTOS = 2;

type Respuesta = {
  ok: boolean;
  duplicado?: boolean;
  error?: string;
  campo?: string;
  tipo?: 'validacion' | 'servidor';
};

/**
 * El Content-Type text/plain es a proposito. Con application/json el
 * navegador dispara un preflight OPTIONS que Apps Script no responde bien,
 * y ahi es donde se traba la mayoria de las integraciones. No cambiarlo.
 */
async function unIntento(datos: Payload): Promise<void> {
  const url = import.meta.env.VITE_SCRIPT_URL;
  if (!url) throw new ErrorServidor('Falta configurar VITE_SCRIPT_URL');

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(datos),
      signal: ctrl.signal,
      redirect: 'follow',
    });

    if (!res.ok) throw new ErrorRed(`HTTP ${res.status}`);

    let data: Respuesta;
    try {
      data = (await res.json()) as Respuesta;
    } catch {
      // Apps Script devolvio HTML: casi siempre es la pantalla de permisos
      // o una implementacion vieja. No se arregla reintentando.
      throw new ErrorServidor('Respuesta inesperada del servidor');
    }

    if (!data.ok) {
      const mensaje = data.error ?? 'No pudimos guardar los datos';
      if (data.tipo === 'validacion') throw new ErrorValidacion(mensaje, data.campo);
      throw new ErrorServidor(mensaje);
    }
  } finally {
    clearTimeout(timeout);
  }
}

export async function enviar(datos: Payload, intento = 0): Promise<void> {
  try {
    await unIntento(datos);
  } catch (e) {
    if (intento < REINTENTOS && esErrorDeRed(e)) {
      await esperar(1000 * 2 ** intento); // 1 s, 2 s
      return enviar(datos, intento + 1);
    }
    throw e;
  }
}
