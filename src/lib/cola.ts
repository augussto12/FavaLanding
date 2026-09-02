import type { Payload } from './schema';
import { enviar } from './enviar';
import { ErrorValidacion, ErrorServidor } from './errores';

/**
 * Cola offline. Es la diferencia entre perder contactos y no perderlos.
 *
 * Si los reintentos se agotan, el payload queda en localStorage, al visitante
 * se le muestra igual el exito (su parte terminó) y la cola se vacia sola
 * cuando vuelve la señal. La idempotencia del backend cubre el riesgo de
 * mandar dos veces el mismo submissionId.
 */
const CLAVE = 'fava:pendientes';
const CADA_MS = 30_000;
const MAX_PENDIENTES = 200;

function leer(): Payload[] {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (!crudo) return [];
    const datos = JSON.parse(crudo);
    return Array.isArray(datos) ? (datos as Payload[]) : [];
  } catch {
    return [];
  }
}

function escribir(items: Payload[]): void {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(items.slice(-MAX_PENDIENTES)));
  } catch {
    // Safari en navegacion privada tira QuotaExceededError. Nada que hacer:
    // el dato se pierde igual que sin cola, no rompemos la pantalla por eso.
  }
}

export function pendientes(): number {
  return leer().length;
}

export function encolar(datos: Payload): void {
  const items = leer();
  if (items.some((p) => p.submissionId === datos.submissionId)) return;
  items.push(datos);
  escribir(items);
}

function quitar(submissionId: string): void {
  escribir(leer().filter((p) => p.submissionId !== submissionId));
}

let procesando = false;

export async function procesarCola(): Promise<number> {
  if (procesando) return pendientes();
  procesando = true;
  try {
    for (const item of leer()) {
      try {
        await enviar(item);
        quitar(item.submissionId);
      } catch (e) {
        if (e instanceof ErrorValidacion || e instanceof ErrorServidor) {
          // El backend nunca lo va a aceptar: sacarlo para no reintentar
          // para siempre. Se registra en consola por si alguien mira.
          console.error('[cola] descartado', item.submissionId, e.message);
          quitar(item.submissionId);
          continue;
        }
        // Sigue sin haber red: cortar y probar en el proximo ciclo.
        break;
      }
    }
  } finally {
    procesando = false;
  }
  return pendientes();
}

/** Arranca los tres disparadores. Devuelve la funcion de limpieza. */
export function iniciarCola(alCambiar: (n: number) => void): () => void {
  const correr = () => {
    void procesarCola().then(alCambiar);
  };

  correr(); // al montar la app
  const id = window.setInterval(() => {
    if (pendientes() > 0) correr();
  }, CADA_MS);
  window.addEventListener('online', correr);

  return () => {
    window.clearInterval(id);
    window.removeEventListener('online', correr);
  };
}
