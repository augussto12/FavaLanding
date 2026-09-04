import { TEXTOS } from '../config';

export function Cierre() {
  return (
    <section className="cierre" aria-labelledby="cierre-titulo">
      <div className="contenedor cierre-contenido">
        <span className="cierre-icono" aria-hidden="true">✦</span>
        <div>
          <p className="cierre-kicker">Grupo Fava · Expo UFASTA 2026</p>
          <h2 id="cierre-titulo">{TEXTOS.cierreTitulo}</h2>
          <p>{TEXTOS.cierreApoyo}</p>
        </div>
      </div>
    </section>
  );
}
