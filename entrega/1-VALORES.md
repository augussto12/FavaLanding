# Valores a cargar

Todo esto va en **Configuración del proyecto → Propiedades de la secuencia de
comandos**, dentro del editor de Apps Script (paso 3 del instructivo).

El nombre va **tal cual**, respetando mayúsculas.

| Propiedad | Valor |
|---|---|
| `SHEET_ID` | *(lo sacás de la URL de la planilla que creás en el paso 1)* |
| `HOJA` | `Registros` |
| `FORM_TOKEN` | `1UaOekelFUO-3rMq3bZImsiFR5KFcehtt4AyCtbY0qI` |
| `TURNSTILE_SECRET` | *(vacío por ahora; se carga al activar Turnstile en la landing)* |
| `MAIL_FROM` | `noreply@conocegrupofava.com.ar` |
| `MAIL_NOMBRE` | `Grupo Fava` |
| `MAIL_RESPUESTA` | `comunidadfava@gmail.com` |
| `MAILERSEND_KEY` | *(token de MailerSend; nunca se sube al repositorio)* |
| `URL_HALAXIA` | `https://www.halaxia.com/empresa/grupo-fava` |
| `URL_LINKEDIN` | `https://www.linkedin.com/company/grupofava/` |
| `URL_BASE` | `https://conocegrupofava.com.ar` |

## Los tres que necesitan que completes algo

**`SHEET_ID`** — cuando creés la planilla, la dirección del navegador se ve así:

```
https://docs.google.com/spreadsheets/d/1a2B3c4D5e6F7g8H9i0J/edit
                                       └─────────────────┘
                                         esto es el SHEET_ID
```

**`TURNSTILE_SECRET`** — se deja vacío hasta que el widget Turnstile esté
activo en el navegador. No debe guardarse en el repositorio.

**`MAILERSEND_KEY`** — es el token de envío de MailerSend que empieza con
`mlsn.`. Se carga únicamente en las propiedades del Apps Script.

**`MAIL_RESPUESTA`** — cuando alguien responda el mail de confirmación (por
ejemplo pidiendo la baja), va a llegar a esa casilla. Elegí una que alguien
lea de verdad.

## Lo que NO va acá

Las claves privadas de MailerSend y Turnstile nunca se guardan en el código ni
en el repositorio. El remitente visible se define con `MAIL_FROM` y
`MAIL_NOMBRE`.

## Cuando termines

Pasale a Augusto **la URL que termina en `/exec`** (sale en el paso 7) y dale
permiso de **Editor** sobre la planilla y sobre el proyecto de Apps Script.

Con eso él termina de conectar la página y ya está.
