import { LogoFava } from './LogoFava';
import { TEXTOS } from '../config';

export function PieDePagina() {
  return (
    <footer className="pie">
      <div className="contenedor pie-cuerpo">
        <LogoFava className="pie-logo" />
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
