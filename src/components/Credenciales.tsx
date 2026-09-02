import { TEXTOS } from '../config';

/**
 * Tira de datos duros que monta a caballo entre el banner y el fondo de la
 * pagina. Es lo que da el peso de marca de 117 años sin escribir un parrafo.
 */
export function Credenciales() {
  return (
    <div className="contenedor">
      <ul className="credenciales">
        {TEXTOS.credenciales.map((c) => (
          <li key={c.dato}>
            <span className="credencial-dato">{c.dato}</span>
            <span className="credencial-detalle">{c.detalle}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
