import { useEffect } from 'react';
import { Banner } from './components/Banner';
import { Credenciales } from './components/Credenciales';
import { Unidades } from './components/Unidades';
import { Formulario } from './components/Formulario';
import { PieDePagina } from './components/PieDePagina';
import { iniciarCola } from './lib/cola';
import { TEXTOS } from './config';

export default function App() {
  // La cola arranca con la app: si quedaron pendientes de una visita anterior
  // (o de un corte de señal), se vacian sin que nadie haga nada.
  useEffect(() => iniciarCola(() => {}), []);

  return (
    <>
      <a className="saltar" href="#registro">
        Ir directo al formulario
      </a>

      <Banner />

      <main>
        <Credenciales />
        <Unidades />

        <section className="seccion seccion-registro" id="registro" aria-labelledby="registro-titulo">
          <div className="contenedor">
            <div className="tarjeta">
              <h2 className="seccion-titulo" id="registro-titulo">
                {TEXTOS.formularioTitulo}
              </h2>
              <p className="seccion-apoyo">{TEXTOS.formularioApoyo}</p>
              <Formulario />
            </div>
          </div>
        </section>
      </main>

      <PieDePagina />
    </>
  );
}
