import { TEXTOS } from '../config';

/**
 * Banner de apertura. El orden pone el CTA lo mas arriba posible: la persona
 * esta de pie con gente esperando atras. Los premios van despues del boton
 * a proposito, para no empujarlo fuera de la primera pantalla.
 */
export function Banner() {
  return (
    <header className="banner">
      <div className="banner-foto" role="img" aria-label="Expo UFASTA 2026 y Grupo Fava">
        <img src="/FASTA-13.jpg.jpeg" alt="" />
      </div>

      <div className="contenedor banner-cuerpo">
        <div className="banner-contenido">
          <p className="eyebrow">{TEXTOS.eyebrow}</p>
          <p className="marca-banner">GRUPO <strong>FAVA</strong></p>

          <h1 className="titular">{TEXTOS.titular}</h1>

          <p className="apoyo">{TEXTOS.apoyo}</p>
          <p className="secundaria">{TEXTOS.secundaria}</p>

          <a className="boton boton-claro" href="#registro">
            {TEXTOS.cta}
            <span aria-hidden="true">↓</span>
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
      </div>
    </header>
  );
}
