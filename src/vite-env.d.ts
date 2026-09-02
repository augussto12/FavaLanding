/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SCRIPT_URL: string;
  readonly VITE_TURNSTILE_SITE_KEY: string;
  readonly VITE_FORM_TOKEN: string;
  readonly VITE_LOCALIDAD_DEFECTO?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
