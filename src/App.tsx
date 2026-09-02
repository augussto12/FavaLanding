import { useEffect } from 'react';
import { LogoFava } from './components/LogoFava';
import { Formulario } from './components/Formulario';
import { iniciarCola } from './lib/cola';
import { TEXTOS } from './config';

export default function App() {
  // La cola arranca con la app: si quedaron pendientes de una visita anterior
  // (o de un corte de señal), se vacian sin que nadie haga nada.
  useEffect(() => iniciarCola(() => {}), []);

  return (
    <div className="app">
      {/* Barra de marca solo en mobile; en 768+ manda el panel lateral. */}
      <header className="marca-barra">
        <LogoFava className="logo" />
      </header>

      <main className="principal">
        <aside className="panel-marca">
          <LogoFava className="logo" />
          <div>
            <p className="titular">{TEXTOS.panelTitulo}</p>
            <p className="apoyo">{TEXTOS.panelApoyo}</p>
          </div>
          <p className="desde">{TEXTOS.panelPie}</p>
        </aside>

        <div className="columna">
          <div className="columna-interior">
            <h1 className="titular">{TEXTOS.titular}</h1>
            <p className="apoyo">{TEXTOS.apoyo}</p>
            <Formulario />
          </div>
        </div>
      </main>
    </div>
  );
}
