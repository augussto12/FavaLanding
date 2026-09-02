/**
 * Argentina es un desastre con los telefonos: la misma persona escribe
 * "0223 155-123456", "+54 9 223 5123456" o "223-512-3456".
 * Se normaliza a 10 digitos (codigo de area + numero, sin 0 ni 15) antes
 * de validar, y se guarda normalizado en la planilla.
 */
export function normalizarTelefono(v: string): string {
  let d = v.replace(/\D/g, '');
  if (d.startsWith('54')) d = d.slice(2);
  if (d.startsWith('9')) d = d.slice(1);
  if (d.startsWith('0')) d = d.slice(1);
  // quitar el 15 que va despues del codigo de area (2 a 4 digitos)
  d = d.replace(/^(\d{2,4})15(\d{6,8})$/, '$1$2');
  return d;
}

export function normalizarDni(v: string): string {
  return v.replace(/\D/g, '');
}
