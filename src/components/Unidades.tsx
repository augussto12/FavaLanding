import { TEXTOS } from '../config';

export function Unidades() {
  return (
    <section className="seccion" aria-labelledby="unidades-titulo">
      <div className="contenedor">
        <h2 className="seccion-titulo" id="unidades-titulo">
          {TEXTOS.unidadesTitulo}
        </h2>
        <ul role="list" className="unidades">
          {TEXTOS.unidades.map((u) => (
            <li className="unidad" key={u.nombre}>
              <span className="unidad-marca" aria-hidden="true" />
              <h3>{u.nombre}</h3>
              <p>{u.detalle}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
