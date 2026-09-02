import { useEffect, useRef } from 'react';

import { TURNSTILE_ACTIVO } from '../config';

type TurnstileApi = {
  render: (
    el: HTMLElement,
    opciones: {
      sitekey: string;
      callback: (token: string) => void;
      'expired-callback'?: () => void;
      'error-callback'?: () => void;
      action?: string;
      appearance?: 'always' | 'execute' | 'interaction-only';
      language?: string;
      theme?: 'light' | 'dark' | 'auto';
    },
  ) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let promesaScript: Promise<void> | null = null;

function cargarScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (promesaScript) return promesaScript;

  promesaScript = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => {
      promesaScript = null;
      reject(new Error('No se pudo cargar Turnstile'));
    };
    document.head.appendChild(s);
  });
  return promesaScript;
}

type Props = {
  onToken: (token: string) => void;
  /** Cambiar este valor vuelve a pedir un token (tras enviar, por ejemplo). */
  resetKey?: number;
};

/**
 * Widget invisible de Cloudflare. Se carga diferido, despues del primer
 * render, para no meterse en el LCP: en 4G de predio ferial cada request
 * bloqueante se paga caro.
 *
 * Si no hay site key configurada (desarrollo local) no se monta nada y el
 * formulario sigue funcionando. La validacion real pasa en el Apps Script.
 */
export function Turnstile({ onToken, resetKey = 0 }: Props) {
  const contenedor = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);

  // Se actualiza en efecto, no en render: escribir un ref durante el render
  // es justo lo que React desaconseja.
  useEffect(() => {
    onTokenRef.current = onToken;
  });

  useEffect(() => {
    if (!TURNSTILE_ACTIVO) return;
    let vivo = true;

    const montar = () => {
      if (!vivo || !contenedor.current || !window.turnstile) return;
      if (widgetId.current !== null) return;
      widgetId.current = window.turnstile.render(contenedor.current, {
        sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
        action: 'landing-stand',
        appearance: 'interaction-only',
        language: 'es',
        theme: 'light',
        callback: (token) => onTokenRef.current(token),
        'expired-callback': () => onTokenRef.current(''),
        'error-callback': () => onTokenRef.current(''),
      });
    };

    // requestIdleCallback donde exista (Safari todavia no lo tiene);
    // si no, un tick despues del paint.
    const arrancar = () => {
      cargarScript().then(montar).catch(() => {
        // Sin Turnstile el envio va igual y el script decide que hacer.
        console.warn('[turnstile] no cargó');
      });
    };

    // Sin desligar del window: requestIdleCallback suelto tira
    // Illegal invocation en varios navegadores.
    const hayIdle = typeof window.requestIdleCallback === 'function';
    const handle = hayIdle
      ? window.requestIdleCallback(arrancar)
      : window.setTimeout(arrancar, 200);

    return () => {
      vivo = false;
      if (hayIdle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
      if (widgetId.current !== null && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (resetKey === 0) return;
    if (widgetId.current !== null && window.turnstile) {
      window.turnstile.reset(widgetId.current);
    }
  }, [resetKey]);

  if (!TURNSTILE_ACTIVO) return null;
  return <div className="turnstile" ref={contenedor} />;
}
