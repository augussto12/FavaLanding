import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Campo } from './Campo';
import { SelectCampo } from './SelectCampo';
import { CaminoCampo } from './CaminoCampo';
import { Turnstile } from './Turnstile';
import { Exito } from './Exito';

import { esquema, VALORES_INICIALES } from '../lib/schema';
import type { FormularioEntrada, FormularioSalida, Payload } from '../lib/schema';
import { enviar } from '../lib/enviar';
import { encolar } from '../lib/cola';
import { ErrorServidor, ErrorValidacion, esperar } from '../lib/errores';
import { ANIOS_CARRERA } from '../data/opciones';
import { ORIGEN, TEXTOS, TURNSTILE_ACTIVO } from '../config';

type Estado = 'idle' | 'enviando' | 'exito' | 'error';
/* Sin 'red': un error de red nunca llega hasta aca. Los reintentos se agotan
   dentro de enviar(), el payload va a la cola offline y el visitante ve la
   pantalla de exito, porque su parte terminó.

   'verificacion' es Turnstile que no llego a dar token. Se separa de
   'servidor' porque se resuelve tocando Enviar de nuevo, y el cartel tiene
   que decir eso en vez de mandar a buscar a alguien del stand. */
type TipoError = 'servidor' | 'validacion' | 'verificacion';

const OPCIONES_ANIO = ANIOS_CARRERA.map((a) => ({ valor: a, etiqueta: a }));

type Props = {
  onExito?: () => void;
  onOtra?: () => void;
};

function nuevoId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function Formulario({ onExito, onOtra }: Props) {
  const [estado, setEstado] = useState<Estado>('idle');
  const [errorEnvio, setErrorEnvio] = useState<{ tipo: TipoError; mensaje: string } | null>(null);
  const [emailEnviado, setEmailEnviado] = useState('');
  const [enCola, setEnCola] = useState(false);
  const [resetTurnstile, setResetTurnstile] = useState(0);

  // Un submissionId por sesion de formulario. El backend descarta repetidos,
  // asi el doble tap del que cree que se colgo no genera dos filas.
  const submissionId = useRef(nuevoId());
  const turnstileToken = useRef('');
  const volverAlFormulario = useRef(false);
  const aviso = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<FormularioEntrada, unknown, FormularioSalida>({
    resolver: zodResolver(esquema),
    defaultValues: VALORES_INICIALES,
    mode: 'onTouched',
  });

  // Al pasar a exito la tarjeta se achica varios cientos de px y el documento
  // queda mas corto que el scroll actual: la pagina saltaba hacia arriba justo
  // despues del tap. Se reancla la seccion.
  useEffect(() => {
    if (estado !== 'exito') return;
    document.getElementById('registro')?.scrollIntoView({ block: 'start' });
  }, [estado]);

  // El foco vuelve al primer campo recien cuando el input existe de nuevo:
  // llamarlo dentro de cargarOtra apuntaba a un nodo ya desmontado.
  useEffect(() => {
    if (estado === 'idle' && volverAlFormulario.current) {
      volverAlFormulario.current = false;
      setFocus('nombre');
    }
  }, [estado, setFocus]);

  // El aviso se inserta ARRIBA del boton y lo empuja fuera de pantalla.
  useEffect(() => {
    if (errorEnvio && errorEnvio.tipo !== 'validacion') {
      aviso.current?.scrollIntoView({ block: 'center' });
    }
  }, [errorEnvio]);

  const recibirToken = useCallback((t: string) => {
    turnstileToken.current = t;
  }, []);

  /** Turnstile resuelve solo, pero tarda. Se le dan hasta 3 s. */
  async function esperarTurnstile(): Promise<string> {
    if (!TURNSTILE_ACTIVO) return '';
    for (let i = 0; i < 30 && !turnstileToken.current; i++) await esperar(100);
    return turnstileToken.current;
  }

  async function onSubmit(datos: FormularioSalida) {
    setEstado('enviando');
    setErrorEnvio(null);

    const turnstile = await esperarTurnstile();

    // Sin token no tiene sentido mandar: el script lo iba a rechazar y el
    // contacto terminaba en un cartel que manda a buscar a alguien del stand.
    // Se avisa que se puede reintentar y se pide un token nuevo.
    if (TURNSTILE_ACTIVO && !turnstile) {
      setErrorEnvio({
        tipo: 'verificacion',
        mensaje: 'No llegamos a verificar que seas una persona',
      });
      setEstado('error');
      setResetTurnstile((n) => n + 1);
      return;
    }

    const payload: Payload = {
      ...datos,
      token: import.meta.env.VITE_FORM_TOKEN,
      submissionId: submissionId.current,
      turnstileToken: turnstile,
      origen: ORIGEN,
      enviadoEn: new Date().toISOString(),
    };

    try {
      await enviar(payload);
      setEmailEnviado(datos.email);
      setEnCola(false);
      setEstado('exito');
      onExito?.();
    } catch (e) {
      if (e instanceof ErrorValidacion) {
        const campo = e.campo as keyof FormularioEntrada | undefined;
        if (campo && campo in VALORES_INICIALES) {
          setError(campo, { type: 'server', message: e.message });
          setFocus(campo);
        }
        setErrorEnvio({ tipo: 'validacion', mensaje: e.message });
        setEstado('error');
        setResetTurnstile((n) => n + 1);
        return;
      }

      if (e instanceof ErrorServidor) {
        setErrorEnvio({ tipo: 'servidor', mensaje: e.message });
        setEstado('error');
        setResetTurnstile((n) => n + 1);
        return;
      }

      // Red: los reintentos ya se agotaron dentro de enviar(). El dato se
      // guarda y se manda solo mas tarde. Para el visitante esto terminó.
      encolar(payload);
      setEmailEnviado(datos.email);
      setEnCola(true);
      setEstado('exito');
      onExito?.();
    }
  }

  function cargarOtra() {
    reset(VALORES_INICIALES);
    submissionId.current = nuevoId();
    turnstileToken.current = '';
    setResetTurnstile((n) => n + 1);
    setErrorEnvio(null);
    setEnCola(false);
    setEstado('idle');
    onOtra?.();
    // El foco va en un efecto, no aca: en este punto el input todavia no se
    // remonto y setFocus caeria sobre un nodo que ya no existe.
    volverAlFormulario.current = true;
  }

  const enviando = estado === 'enviando';

  const anuncio =
    estado === 'enviando'
      ? 'Enviando tus datos, esperá un momento.'
      : estado === 'exito'
        ? 'Listo, tus datos se enviaron. Te mandamos un mail de confirmación.'
        : errorEnvio && errorEnvio.tipo !== 'validacion'
          ? 'No pudimos enviar los datos.'
          : '';

  return (
    <>
      {/* La region viva vive SIEMPRE montada. Si apareciera junto con su
          texto, el lector de pantalla no anunciaria nada. */}
      <div aria-live="polite" className="solo-lectores">
        {anuncio}
      </div>

      {estado === 'exito' ? (
        <Exito email={emailEnviado} enCola={enCola} onOtra={cargarOtra} />
      ) : (
        <>
          <h2 className="seccion-titulo">{TEXTOS.formularioTitulo}</h2>
          <p className="seccion-apoyo">{TEXTOS.formularioApoyo}</p>
          <form className="formulario" onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
            <div className="fila">
              <Campo
                id="nombre"
                etiqueta="Nombre"
                type="text"
                autoComplete="given-name"
                autoCapitalize="words"
                enterKeyHint="next"
                error={errors.nombre?.message}
                {...register('nombre')}
              />
              <Campo
                id="apellido"
                etiqueta="Apellido"
                type="text"
                autoComplete="family-name"
                autoCapitalize="words"
                enterKeyHint="next"
                error={errors.apellido?.message}
                {...register('apellido')}
              />
            </div>

            <div className="fila">
              <Campo
                id="dni"
                etiqueta="DNI"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                maxLength={10}
                enterKeyHint="next"
                placeholder="12345678"
                ayuda="Sin puntos"
                error={errors.dni?.message}
                {...register('dni')}
              />
              <Campo
                id="telefono"
                etiqueta="Teléfono"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                enterKeyHint="next"
                placeholder="223 5123456"
                error={errors.telefono?.message}
                {...register('telefono')}
              />
            </div>

            <Campo
              id="email"
              etiqueta="Email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="next"
              placeholder="nombre@gmail.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Campo
              id="estudios"
              etiqueta="¿Qué estudiás o estudiaste?"
              type="text"
              autoCapitalize="sentences"
              enterKeyHint="next"
              placeholder="Contador Público"
              error={errors.estudios?.message}
              {...register('estudios')}
            />

            <SelectCampo
              id="anioCarrera"
              etiqueta="¿En qué año de carrera estás?"
              opciones={OPCIONES_ANIO}
              opcional
              error={errors.anioCarrera?.message}
              {...register('anioCarrera')}
            />

            <CaminoCampo
              etiqueta={TEXTOS.caminoTitulo}
              error={errors.camino?.message}
              {...register('camino')}
            />

            <div className="grupo-consentimiento">
              <div className={`consentimiento${errors.consentimiento ? ' invalido' : ''}`}>
                <span className="caja-check">
                  <input
                    id="consentimiento"
                    type="checkbox"
                    aria-invalid={errors.consentimiento ? true : undefined}
                    aria-describedby={errors.consentimiento ? 'consentimiento-error' : undefined}
                    {...register('consentimiento')}
                  />
                </span>
                <label htmlFor="consentimiento">
                  {TEXTOS.consentimiento}{' '}
                  {TEXTOS.politicaUrl && (
                    <a href={TEXTOS.politicaUrl} target="_blank" rel="noreferrer">
                      Política de privacidad
                    </a>
                  )}
                </label>
              </div>
              {errors.consentimiento && (
                <span className="mensaje-error" id="consentimiento-error">
                  {errors.consentimiento.message}
                </span>
              )}
            </div>

            <Turnstile onToken={recibirToken} resetKey={resetTurnstile} />

            {/* El motivo real, no siempre el mismo cartel. Y la salida cambia
                segun el caso: la verificacion se arregla tocando Enviar otra
                vez, un error del script no. */}
            {errorEnvio && errorEnvio.tipo !== 'validacion' && (
              <div className="aviso" role="alert" ref={aviso}>
                <strong>No pudimos enviar los datos.</strong>
                {errorEnvio.mensaje}.{' '}
                {errorEnvio.tipo === 'verificacion'
                  ? 'Tocá Enviar de nuevo.'
                  : TEXTOS.contactoStand}
              </div>
            )}

            <button type="submit" className="boton" disabled={enviando}>
              {enviando ? TEXTOS.botonEnviando : TEXTOS.botonEnviar}
            </button>
          </form>
        </>
      )}
    </>
  );
}
