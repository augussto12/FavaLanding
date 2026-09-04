import { useEffect } from 'react';
import { Banner } from './components/Banner';
import { Credenciales } from './components/Credenciales';
import { Unidades } from './components/Unidades';
import { Formulario } from './components/Formulario';
import { Cierre } from './components/Cierre';
import { PieDePagina } from './components/PieDePagina';
import { iniciarCola } from './lib/cola';

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

        {/* El titulo vive dentro de Formulario, no aca: al pasar a exito tiene
            que irse con el resto. Si no, la tarjeta queda diciendo "Dejanos tus
            datos" arriba de un "¡Listo!" y con dos h2 en la misma seccion. */}
        <section className="seccion seccion-registro" id="registro" aria-label="Registro">
          <div className="contenedor">
            <div className="tarjeta">
              <Formulario />
            </div>
          </div>
        </section>
      </main>

      <Cierre />
      <PieDePagina />
    </>
  );
}
