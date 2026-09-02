import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  etiqueta: string;
  error?: string;
  ayuda?: ReactNode;
  opcional?: boolean;
};

/**
 * Label arriba del campo, siempre. Nunca placeholder como label: desaparece
 * al tipear y deja a la persona sin saber que estaba llenando.
 */
export const Campo = forwardRef<HTMLInputElement, Props>(function Campo(
  { id, etiqueta, error, ayuda, opcional, ...props },
  ref,
) {
  const idError = `${id}-error`;
  const idAyuda = `${id}-ayuda`;
  const descrito = [error ? idError : null, ayuda ? idAyuda : null]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="campo">
      <label htmlFor={id}>
        {etiqueta}
        {opcional && <span className="opcional"> (opcional)</span>}
      </label>
      <input
        {...props}
        id={id}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={descrito || undefined}
      />
      {ayuda && (
        <span className="ayuda" id={idAyuda}>
          {ayuda}
        </span>
      )}
      {error && (
        <span className="mensaje-error" id={idError}>
          {error}
        </span>
      )}
    </div>
  );
});
