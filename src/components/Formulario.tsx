import { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Campo } from './Campo';
import { SelectCampo } from './SelectCampo';
import { Turnstile } from './Turnstile';
import { Exito } from './Exito';

import { esquema, VALORES_INICIALES } from '../lib/schema';
import type { FormularioEntrada, FormularioSalida, Payload } from '../lib/schema';
import { enviar } from '../lib/enviar';
import { encolar } from '../lib/cola';
import { ErrorServidor, ErrorValidacion, esperar } from '../lib/errores';
import { GENEROS, LOCALIDAD_DEFECTO, LOCALIDADES } from '../data/localidades';
import { ORIGEN, TEXTOS, TURNSTILE_ACTIVO } from '../config';

type Estado = 'idle' | 'enviando' | 'exito' | 'error';
type TipoError = 'red' | 'servidor' | 'validacion';

const OPCIONES_GENERO = GENEROS.map((g) => ({ valor: g, etiqueta: g }));

function nuevoId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function Formulario() {
  const [estado, setEstado] = useState<Estado>('idle');
  const [errorEnvio, setErrorEnvio] = useState<{ tipo: TipoError; mensaje: string } | null>(null);
  const [emailEnviado, setEmailEnviado] = useState('');
  const [enCola, setEnCola] = useState(false);
  const [resetTurnstile, setResetTurnstile] = useState(0);

  // Un submissionId por sesion de formulario. El backend descarta repetidos,
  // asi el doble tap del que cree que se colgo no genera dos filas.
  const submissionId = useRef(nuevoId());
  const turnstileToken = useRef('');

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<FormularioEntrada, unknown, FormularioSalida>({
    resolver: zodResolver(esquema),
    defaultValues: { ...VALORES_INICIALES, localidad: LOCALIDAD_DEFECTO },
    mode: 'onTouched',
  });

  const recibirToken = useCallback((t: string) => {
    turnstileToken.current = t;
  }, []);

  /** Turnstile resuelve solo, pero tarda. Se le dan hasta 4 s. */
  async function esperarTurnstile(): Promise<string> {
    if (!TURNSTILE_ACTIVO) return '';
    for (let i = 0; i < 40 && !turnstileToken.current; i++) await esperar(100);
    return turnstileToken.current;
  }

  async function onSubmit(datos: FormularioSalida) {
    setEstado('enviando');
    setErrorEnvio(null);

    const payload: Payload = {
      ...datos,
      token: import.meta.env.VITE_FORM_TOKEN,
      submissionId: submissionId.current,
      turnstileToken: await esperarTurnstile(),
      origen: ORIGEN,
      enviadoEn: new Date().toISOString(),
    };

    try {
      await enviar(payload);
      setEmailEnviado(datos.email);
      setEnCola(false);
      setEstado('exito');
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
    }
  }

  function cargarOtra() {
    reset({ ...VALORES_INICIALES, localidad: LOCALIDAD_DEFECTO });
    submissionId.current = nuevoId();
    turnstileToken.current = '';
    setResetTurnstile((n) => n + 1);
    setErrorEnvio(null);
    setEnCola(false);
    setEstado('idle');
    setFocus('nombre');
  }

  if (estado === 'exito') {
    return (
      <>
        <div aria-live="polite" className="solo-lectores">
          Datos enviados correctamente.
        </div>
        <Exito email={emailEnviado} enCola={enCola} onOtra={cargarOtra} />
      </>
    );
  }

  const enviando = estado === 'enviando';

  return (
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
          opcional
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          enterKeyHint="next"
          placeholder="223 5123456"
          error={errors.telefono?.message}
          {...register('telefono')}
        />
      </div>

      <SelectCampo
        id="localidad"
        etiqueta="Localidad"
        opcional
        opciones={LOCALIDADES}
        error={errors.localidad?.message}
        {...register('localidad')}
      />

      <SelectCampo
        id="genero"
        etiqueta="Género"
        opcional
        opciones={OPCIONES_GENERO}
        error={errors.genero?.message}
        {...register('genero')}
      />

      <div className={`consentimiento${errors.consentimiento ? ' invalido' : ''}`}>
        <input
          id="consentimiento"
          type="checkbox"
          aria-invalid={errors.consentimiento ? true : undefined}
          aria-describedby={errors.consentimiento ? 'consentimiento-error' : undefined}
          {...register('consentimiento')}
        />
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

      <Turnstile onToken={recibirToken} resetKey={resetTurnstile} />

      {errorEnvio && errorEnvio.tipo !== 'validacion' && (
        <div className="aviso" role="alert">
          <strong>No pudimos enviar los datos.</strong>
          {errorEnvio.tipo === 'servidor'
            ? ` ${TEXTOS.contactoStand}`
            : ' Probá de nuevo en unos segundos.'}
        </div>
      )}

      <button type="submit" className="boton" disabled={enviando}>
        {enviando ? TEXTOS.botonEnviando : TEXTOS.botonEnviar}
      </button>

      <div aria-live="polite" className="solo-lectores">
        {enviando ? 'Enviando tus datos, esperá un momento.' : ''}
      </div>
    </form>
  );
}
