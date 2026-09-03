# Landing Fava

Landing de captación de contactos para el stand de **Grupo Fava**. Una sola
pantalla: logo, dos líneas de texto y el formulario. Sin backend propio: los
datos van a una planilla de Google vía Apps Script.

El contexto manda sobre todo lo demás: la sesión dura entre 30 y 90 segundos,
la persona está de pie, con alguien esperando atrás, y la conectividad del
predio es mala. Si el envío falla, ese contacto se perdió. Por eso hay
reintentos, cola offline e idempotencia.

## Arranque

```bash
npm install
cp .env.example .env   # completar VITE_SCRIPT_URL como mínimo
npm run dev
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | `tsc -b` + build de producción en `dist/` |
| `npm run preview` | Sirve `dist/` para probar el build |
| `npm run lint` | ESLint |
| `npm run typecheck` | Solo tipos |

Sin `VITE_TURNSTILE_SITE_KEY` el widget no se monta y el formulario anda
igual, lo que hace usable el modo local.

## Variables de entorno

Se cargan de `.env`, tanto en local como en el VPS (`/opt/landing-fava/.env`).
Vite las hornea en el bundle **en tiempo de compilación**: tocar el `.env` no
alcanza, hay que reconstruir.

| Variable | Para qué |
|---|---|
| `VITE_SCRIPT_URL` | URL `/exec` de la implementación del Apps Script |
| `VITE_TURNSTILE_SITE_KEY` | Site key pública de Turnstile |
| `VITE_FORM_TOKEN` | Token compartido con el script |

**`VITE_FORM_TOKEN` no es un secreto.** Termina en el bundle y cualquiera lo
lee con el inspector. Sirve para frenar bots ingenuos, nada más. La protección
real es Turnstile validado del lado del script.

## Marca

Los colores y el logo salen del sitio que Fava ya tiene en producción,
`https://fava.esmundial.com.ar/staff/index.php`. No hay colores inventados.

Ojo con una trampa de ese sitio: su `:root` define una paleta celeste y dorada
que es de la campaña del torneo de predicciones, **no** de la identidad del
grupo. El institucional es el rojo del navbar, del logo y de los títulos:

| Token | Valor | Uso |
|---|---|---|
| `--marca` | `#e52928` | Superficies grandes y logo (4,49:1, no alcanza para texto chico) |
| `--marca-oscuro` | `#b81f1e` | Botón, bordes y texto rojo (6,46:1) |
| `--marca-mas-oscuro` | `#8f1817` | Hover y active |

El logo es `logo-grupo-fava.svg` pegado como componente
([LogoFava.tsx](src/components/LogoFava.tsx)), con los `fill` pasados a
`currentColor` para poder pintarlo desde CSS sin duplicar el archivo. El
original viene en blanco porque está pensado para ir sobre el rojo.

Todos los pares texto/fondo están verificados a 4,5:1 o más; los números están
anotados en [tokens.css](src/styles/tokens.css).

Si aparece el manual de marca de Fava, gana sobre lo extraído.

## Backend: la planilla y el Apps Script

El código está en [apps-script/Codigo.gs](apps-script/Codigo.gs). Se pega tal
cual en el editor de Apps Script.

1. Crear la planilla en el Drive **de Fava**, no en una cuenta personal, y
   copiar su id de la URL.
2. Extensiones → Apps Script (o script nuevo y enlazarlo por `SHEET_ID`).
3. Pegar `Codigo.gs`.
4. Configuración del proyecto → Propiedades de la secuencia de comandos:

   | Propiedad | Valor |
   |---|---|
   | `SHEET_ID` | id de la planilla |
   | `HOJA` | `Registros` |
   | `FORM_TOKEN` | el mismo de `VITE_FORM_TOKEN` |
   | `TURNSTILE_SECRET` | secret key de Turnstile |
   | `MAIL_NOMBRE` | `Grupo Fava` |
   | `MAIL_RESPUESTA` | casilla de respuesta |

5. Ejecutar `inicializarPlanilla` una vez y aceptar los permisos.
6. Implementar → Nueva implementación → Aplicación web:
   - **Ejecutar como:** Yo, con la cuenta de Workspace de Fava
   - **Quién tiene acceso:** Cualquier usuario
7. Copiar la URL `/exec` a `VITE_SCRIPT_URL`.

Abrir esa URL en el navegador devuelve un JSON con la cuota de mails que
queda: sirve de health check.

### Redesplegar

**Cada cambio de código necesita una versión nueva** desde Administrar
implementaciones. Si no, la URL `/exec` sigue sirviendo el código viejo. Es el
error más común de toda la integración.

### Orden de operaciones

No es negociable, y está así en el código:

1. Token compartido y Turnstile
2. Validación de campos (revalidada del lado del servidor, no se confía en el navegador)
3. Idempotencia por `submissionId` en `CacheService`, TTL 10 minutos
4. `appendRow` dentro de `LockService`, con `MailEnviado` vacío
5. Responder `{ ok: true }` — **el mail no sale acá**, lo manda el disparador

Si el mail falla, el contacto ya está guardado. Al revés se pierde el dato,
que es lo único que realmente importa. Ver [Los mails](#los-mails).

## Qué pasa cuando falla la red

`enviar()` corta a los 15 s y reintenta dos veces con espera de 1 s y 2 s.
Si igual no sale, el payload queda en `localStorage` bajo `fava:pendientes` y
al visitante se le muestra el éxito, porque su parte terminó. La pantalla se
lo dice con todas las letras: el mail le va a llegar cuando vuelva la señal.

La cola se vacía sola al montar la app, al volver el evento `online` y cada
30 segundos mientras haya pendientes. Como cada envío lleva su `submissionId`,
el backend descarta los repetidos.

Un payload que el servidor rechaza por validación se saca de la cola: no tiene
sentido reintentarlo para siempre.

## Dominio y QR

Hoy la landing corre en el VPS (ver [Deploy en el VPS](#deploy-en-el-vps)) y se
llega por IP y puerto, sin HTTPS. **Falta definir el subdominio.**

Cuando esté: un CNAME del subdominio al VPS, el proxy host en
nginx-proxy-manager apuntando al contenedor `landing-fava` puerto 80, y el
certificado desde ahí. No tocar el registro raíz ni el SPF del dominio de Fava,
que ya tiene Google Workspace, favanet y Doppler adentro y romperlo les tira el
mail corporativo.

Bajar el TTL a 300 segundos unos días antes del evento, por si hay que corregir
algo sobre la hora.

El QR tiene que apuntar al subdominio final con HTTPS, nunca a la IP, y hay que
probarlo impreso a dos metros.

## Estructura

```
src/
  config.ts              textos y copy pendientes de confirmar, todo junto
  App.tsx                banner, credenciales, unidades, registro y pie
  components/
    Banner.tsx           banner rojo, premios y CTA al formulario
    Formulario.tsx       máquina de estados idle → enviando → exito | error
    CaminoCampo.tsx      los cuatro caminos, como radios en tarjetas
    Campo.tsx            label + input + error, un solo lugar
    SelectCampo.tsx
    Exito.tsx
    Turnstile.tsx        carga diferida del widget
    LogoFava.tsx         SVG institucional inline
  lib/
    schema.ts            zod, mensajes de error en criollo
    enviar.ts            fetch, timeout de 15 s, dos reintentos
    cola.ts              cola offline en localStorage
    errores.ts           validación / servidor / red
    telefono.ts          normalización argentina
  data/
    opciones.ts          los cuatro caminos y los años de carrera
    localidades.ts       SIN USO: lista de Fava con sus códigos internos
  styles/
    tokens.css           marca y escala, con los contrastes anotados
    app.css              todo lo demás, mobile first
apps-script/Codigo.gs    backend
```

## Los campos

Salen del brief de la **Expo UFASTA**: nombre, apellido, DNI, teléfono, email,
qué estudia, año de carrera y cuál de los cuatro caminos eligió en la dinámica
del stand. Todos obligatorios.

El teléfono pasó de opcional a obligatorio, y **localidad y género salieron del
formulario**: no están en el brief, y en un stand cada campo de más se paga en
gente que abandona. La lista de localidades con los códigos internos de Fava
(`47-Mar del Plata`) queda en `data/localidades.ts` como referencia sin uso,
porque volver a extraerla del sitio de ellos cuesta.

El año de carrera es **un solo select** con 1º a 6º más "Ya me recibí" y
"Todavía no empecé", en vez de un campo condicional: un formulario que se mueve
solo mientras lo completan es peor que uno con una opción más.

Los cuatro caminos van como radios de verdad dentro de un `fieldset`, en
tarjetas con emoji y no en un select: es la pregunta que da sentido a la
dinámica, y además se toca de una con el pulgar.

## Checklist previo al evento

Hacerlo el día anterior, completo:

- [ ] Envío real desde iPhone con datos móviles, no wifi
- [ ] Envío real desde Android con datos móviles
- [ ] La fila aparece en la planilla con todos los campos y la fecha correcta
- [ ] El mail llega a Gmail, Outlook y Yahoo, y no cae en spam en ninguno
- [ ] El remitente se ve como Fava, no como una dirección personal
- [ ] `verCuotaMails()` devuelve el número esperado
- [ ] Doble tap en Enviar genera una sola fila
- [ ] En modo avión sale el mensaje correcto y el dato queda en cola
- [ ] Al volver la conexión la cola se vacía sola
- [ ] La página carga en menos de 3 s en 4G real
- [ ] El QR impreso se lee desde dos metros
- [ ] Alguien de Fava puede abrir la planilla y exportarla sin ayuda
- [ ] Está definido a quién llamar si algo falla durante el evento

Lighthouse móvil con throttling: 90+ en Rendimiento y en Accesibilidad.

## Pendientes con el cliente

Nada de esto bloquea el desarrollo, pero sí el deploy final.

1. **¿Celular con QR o tablet del stand?** El layout responde a los dos, pero
   define qué se prueba primero y si conviene dejar el botón "Cargar otra
   respuesta" a la vista.
2. **¿Fava tiene Google Workspace?** Verificar los MX antes que cualquier otra
   cosa. Si no lo tienen, el mail sale por Brevo o Resend desde `UrlFetchApp` y
   cambia solo `enviarMail()`.
3. Nombre exacto del subdominio.
4. Casilla desde la que sale el mail y dirección de respuesta.
5. Textos definitivos: titular, línea de apoyo, cuerpo del mail y texto del
   consentimiento. Están todos en [src/config.ts](src/config.ts) y el del mail
   en `Codigo.gs`.
6. URL de la política de privacidad, para enlazar desde el consentimiento
   (`TEXTOS.politicaUrl`). Vacía, hoy el texto va sin enlace.
7. Manual de marca, si existe.
8. Qué pasa con la página después del evento.

## Accesos

- Planilla y Apps Script: cuenta de Workspace de Fava (pedir a _completar_)
- Cloudflare Pages y DNS: _completar_
- Cuenta de Turnstile: _completar_

## Los mails

**Fava tiene Google Workspace.** Verificado el 2026-09-03 en los MX:

```
grupofava.com.ar   MX -> ASPMX.L.GOOGLE.COM (+6)   SPF: include:_spf.google.com
fava.com.ar        MX -> smtp.google.com           SPF: include:_spf.google.com
halaxia.com        MX -> aspmx.l.google.com
favacard.com.ar    MX -> mx02.favanet.ar           servidor propio, NO Google
```

Eso descarta el riesgo principal del relevamiento: con Workspace, `MailApp` da
**1.500 mails por dia** contra los ~300 esperados. No hace falta Brevo ni
Resend.

Dos detalles de la cuota: se renueva **24 h despues del primer envio**, no a
medianoche, y es **por cuenta**, no por script. Si la misma cuenta manda mails
de otra cosa, comparten el pozo.

### El mail NO sale dentro del request

Antes `enviarMail()` corria dentro de `doPost` y el visitante esperaba a que
MailApp terminara, con gente atras suyo en la fila. Ahora:

1. `doPost` guarda la fila con la columna `MailEnviado` vacia y responde.
2. Un disparador por tiempo corre `procesarMails()` **cada minuto**, levanta las
   filas sin marcar y manda.
3. Cada fila queda marcada con la fecha, o con `ERROR: ...` si fallo.

Ademas del tiempo de respuesta, esto da reintento gratis y deja en la planilla
quien recibio el mail y quien no. Para reintentar uno fallido, se vacia la
celda `MailEnviado` a mano y el proximo minuto lo agarra.

Hay que correr **`instalarDisparadorDeMails()` una vez** desde el editor. Sin
eso las filas se guardan pero no sale ningun mail.

`verPendientes()` dice cuantos faltan, cuantos fallaron y cuanta cuota queda:
correrlo durante el evento.

### Lo que hay que pedirle a Fava

El remitente **no se puede elegir**: `MailApp` manda siempre desde la cuenta
que autorizo el script. O sea que la cuenta que crea la planilla y el Apps
Script define la direccion del "De:" para siempre. Si se arma desde un Gmail
personal, los 300 mails salen de ahi y arreglarlo despues obliga a rehacer el
script y volver a implementar.

Por eso hace falta **una cuenta de Workspace del dominio de Fava** (no admin,
una cuenta comun alcanza), idealmente una casilla funcional del estilo
`expo@grupofava.com.ar`. Desde esa cuenta:

- se crea la planilla, asi los datos quedan en el Drive de ellos desde el dia uno
- se crea y se implementa el Apps Script con "Ejecutar como: Yo"
- se corre `instalarDisparadorDeMails()`

`MAIL_NOMBRE` y `MAIL_RESPUESTA` solo cambian el nombre visible y el
responder-a, no el remitente real.

## Deploy en el VPS

La landing corre en el VPS junto al resto de los proyectos, detrás de
nginx-proxy-manager, con el mismo patrón que usa Condas: el contenedor entra a
la red `nginx-proxy-manager_default` y NPM lo alcanza por nombre.

```bash
ssh root@31.97.241.220
cd /opt/landing-fava
git pull
docker compose up -d --build
```

El puerto **8097** queda publicado en el host solo para poder ver la página por
IP mientras no haya subdominio. Cuando el dominio esté resuelto, se borra el
bloque `ports:` del compose y queda accesible únicamente por NPM.

### Las variables se hornean en el build

Vite reemplaza `import.meta.env.*` **en tiempo de compilación**: no alcanza con
pasarlas al contenedor, hay que reconstruir. El `.env` del servidor vive en
`/opt/landing-fava/.env` (no está en el repo) y el compose lo pasa como build
args.

```bash
# despues de tocar el .env
docker compose up -d --build
```

Si `VITE_SCRIPT_URL` está vacía, la página se ve igual pero el formulario falla
con "Falta configurar VITE_SCRIPT_URL". Es el estado esperado hasta que el Apps
Script esté desplegado.

### Cabeceras

`public/_headers` solo lo entiende Cloudflare Pages. Detrás de nginx las
cabeceras de seguridad viven en `nginx.conf`, duplicadas en cada bloque
`location` porque `add_header` pisa las del `server` en vez de heredarlas.
Si se tocan en un lado, tocarlas en el otro.
