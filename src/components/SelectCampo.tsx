import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';

type Opcion = { valor: string; etiqueta: string };

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  etiqueta: string;
  opciones: Opcion[];
  error?: string;
  opcional?: boolean;
  vacio?: string;
};

export const SelectCampo = forwardRef<HTMLSelectElement, Props>(
  function SelectCampo(
    { id, etiqueta, opciones, error, opcional, vacio = 'Seleccionar…', ...props },
    ref,
  ) {
    const idError = `${id}-error`;

    return (
      <div className="campo">
        <label htmlFor={id}>
          {etiqueta}
          {opcional && <span className="opcional"> (opcional)</span>}
        </label>
        <select
          {...props}
          id={id}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? idError : undefined}
        >
          <option value="">{vacio}</option>
          {opciones.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.etiqueta}
            </option>
          ))}
        </select>
        {error && (
          <span className="mensaje-error" id={idError}>
            {error}
          </span>
        )}
      </div>
    );
  },
);
