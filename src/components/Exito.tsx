type Props = {
  email: string;
  /** true si quedo en la cola offline y todavia no llego al servidor. */
  enCola: boolean;
};

export function Exito({ email, enCola }: Props) {
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

      <h2>¡Gracias por participar! 🙌</h2>

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
          <p>Tus datos se registraron correctamente y ya sos parte del sorteo.</p>
          <p className="exito-nota">
            Revisá tu mail: te enviamos más información para que puedas seguir
            descubriendo todo lo que hay detrás de Grupo FAVA y conocer nuestras
            oportunidades laborales.
          </p>
          <p className="exito-email">
            El mensaje fue enviado a <span className="correo">{email}</span>.
            Si no lo encontrás en unos minutos, revisá también la carpeta de
            correo no deseado.
          </p>
        </>
      )}
    </div>
  );
}
