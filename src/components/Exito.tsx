import { TEXTOS } from '../config';

type Props = {
  email: string;
  /** true si quedo en la cola offline y todavia no llego al servidor. */
  enCola: boolean;
  onOtra: () => void;
};

export function Exito({ email, enCola, onOtra }: Props) {
  return (
    <div className="exito">
      <span className="exito-marca" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path
            d="M4.5 12.5 10 18 19.5 6.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <h2>{TEXTOS.exitoTitulo}</h2>

      {enCola ? (
        <>
          <p>
            Guardamos tus datos en este dispositivo. En cuanto vuelva la señal
            terminamos de registrarte en el sorteo y te llega el mail a{' '}
            <span className="correo">{email}</span>.
          </p>
          <p className="exito-nota">
            No hace falta que hagas nada más. Podés cerrar la página.
          </p>
        </>
      ) : (
        <>
          <p>
            Ya estás participando del sorteo. Te mandamos a{' '}
            <span className="correo">{email}</span>.
          </p>
          <p className="exito-nota">
            En ese mail va todo lo que hacemos y nuestras búsquedas laborales abiertas. Si no lo ves en unos minutos, revisá el correo no deseado.
          </p>
        </>
      )}

      <button type="button" className="boton boton-secundario" onClick={onOtra}>
        {TEXTOS.exitoOtra}
      </button>
    </div>
  );
}
