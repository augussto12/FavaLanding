import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { CAMINOS } from '../data/opciones';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  etiqueta: string;
  error?: string;
};

/**
 * Los cuatro caminos de la dinamica del stand. Van como radios de verdad
 * dentro de un fieldset, no como un select: es la pregunta que da sentido a
 * toda la actividad, y ademas cuatro opciones grandes se tocan de una con el
 * pulgar. Un select serian dos taps y una lista tapando la pantalla.
 */
export const CaminoCampo = forwardRef<HTMLInputElement, Props>(
  function CaminoCampo({ etiqueta, error, ...props }, ref) {
    const idError = 'camino-error';

    return (
      <fieldset
        className={`camino${error ? ' invalido' : ''}`}
        aria-describedby={error ? idError : undefined}
      >
        <legend>{etiqueta}</legend>

        <div className="camino-opciones">
          {CAMINOS.map((c) => (
            <label className="camino-opcion" key={c.valor}>
              {/* El mismo ref en los cuatro: react-hook-form los junta como
                  grupo y asi setFocus cae en el primero. */}
              <input type="radio" value={c.valor} ref={ref} {...props} />
              <span className="camino-emoji" aria-hidden="true">
                {c.emoji}
              </span>
              <span className="camino-nombre">{c.valor}</span>
            </label>
          ))}
        </div>

        {error && (
          <span className="mensaje-error" id={idError}>
            {error}
          </span>
        )}
      </fieldset>
    );
  },
);
