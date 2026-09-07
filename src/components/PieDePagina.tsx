import { LogoFava } from './LogoFava';
import { TEXTOS } from '../config';

/**
 * Pie de la landing.
 *
 * El banner que mandaron es de 4001x417, o sea 9,6:1. A 390 px de ancho eso
 * queda en 40 px de alto y el texto es ilegible. Asi que la pieza original se
 * usa de 768 para arriba, y abajo de eso se rearma el mismo contenido
 * apilado, con el logo vectorial y el sello recortado del propio banner.
 */
export function PieDePagina() {
  return (
    <footer className="pie">
      <div className="pie-banner">
        <img
          className="pie-banner-ancho"
          src="/pie-banner.webp"
          alt="Hay mucho más detrás de FAVA · Grupo Fava · Expo UFASTA 2026"
          width="1800"
          height="188"
          loading="lazy"
        />

        <div className="pie-banner-apilado" aria-hidden="true">
          <p>Hay mucho más detrás de FAVA</p>
          <div className="pie-banner-marcas">
            <LogoFava className="pie-banner-logo" />
            <img
              className="pie-banner-sello"
              src="/sello-expo.webp"
              alt=""
              width="360"
              height="255"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <div className="contenedor pie-cuerpo">
        <p className="pie-principal">{TEXTOS.piePrincipal}</p>
        <p className="pie-secundario">{TEXTOS.pieSecundario}</p>
        {TEXTOS.politicaUrl && (
          <a href={TEXTOS.politicaUrl} target="_blank" rel="noreferrer">
            Política de privacidad
          </a>
        )}
      </div>
    </footer>
  );
}
