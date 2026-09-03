import { LogoFava } from './LogoFava';
import { TEXTOS } from '../config';

/**
 * Banner de apertura. El orden pone el CTA lo mas arriba posible: la persona
 * esta de pie con gente esperando atras. Los premios van despues del boton
 * a proposito, para no empujarlo fuera de la primera pantalla.
 */
export function Banner() {
  return (
    <header className="banner">
      <div className="contenedor banner-cuerpo">
        <LogoFava className="banner-logo" />

        <p className="eyebrow">{TEXTOS.eyebrow}</p>

        {/* Cada linea dentro de su mascara: el span interno sube desde abajo
            y la mascara lo recorta. Es el gesto principal. */}
        <h1 className="titular">
          {TEXTOS.titular.split('\n').map((linea, i) => (
            <span className="linea" key={i}>
              <span>{linea}</span>
            </span>
          ))}
        </h1>

        <p className="apoyo">{TEXTOS.apoyo}</p>

        <p className="secundaria">{TEXTOS.secundaria}</p>

        <a className="boton boton-claro" href="#registro">
          {TEXTOS.cta}
          <svg
            className="flecha-abajo"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12 5v14m0 0-6-6m6 6 6-6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>

        <ul className="premios" role="list" aria-label="Premios del sorteo">
          {TEXTOS.premios.map((p) => (
            <li key={p.nombre}>
              <span aria-hidden="true">{p.emoji}</span>
              {p.nombre}
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
