/**
 * Tres errores distintos porque el mensaje al visitante cambia en cada caso:
 * uno se arregla solo, otro se reintenta, otro hay que avisarle a alguien.
 */

/** El script rechazo los datos. No tiene sentido reintentar igual. */
export class ErrorValidacion extends Error {
  constructor(
    message: string,
    readonly campo?: string,
  ) {
    super(message);
    this.name = 'ErrorValidacion';
  }
}

/** Respondio, pero con ok:false generico. Tampoco se reintenta solo. */
export class ErrorServidor extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ErrorServidor';
  }
}

/** No llego la respuesta: timeout, sin señal, DNS, 5xx. Se reintenta. */
export class ErrorRed extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ErrorRed';
  }
}

export function esErrorDeRed(e: unknown): boolean {
  if (e instanceof ErrorRed) return true;
  if (e instanceof ErrorValidacion || e instanceof ErrorServidor) return false;
  // AbortError del timeout, TypeError de fetch sin conexion, y cualquier
  // otra cosa inesperada: se asume red, que es lo mas probable en un predio.
  return true;
}

export function esperar(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
