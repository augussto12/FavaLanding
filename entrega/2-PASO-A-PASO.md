# Paso a paso

Instructivo para la persona que tiene la cuenta de Grupo Fava.

Son unos 15 minutos. **No hace falta saber programar**: se copia y se pega.

---

## Antes de arrancar

**Entrá con UNA sola cuenta de Google.**

Es el error más común. Si en el navegador tenés varias cuentas abiertas a la
vez, Google se confunde y puede crear las cosas bajo la cuenta equivocada.
Después no se pueden mover.

La forma segura: abrí una **ventana de incógnito** y entrá ahí solamente con
la cuenta de Grupo Fava. Todo el instructivo se hace en esa ventana.

Para verificar: entrá a [drive.google.com](https://drive.google.com), tocá tu
foto arriba a la derecha y confirmá que dice la dirección de Grupo Fava y
ninguna otra.

**Por qué importa tanto:** la cuenta que hace estos pasos es la que va a
figurar como remitente en los mails que reciban los visitantes de la expo. No
se puede cambiar después sin rehacer todo desde cero.

---

## Lo que vas a necesitar a mano

Augusto te tiene que pasar estos tres valores antes de empezar:

| Dato | Para qué |
|---|---|
| `FORM_TOKEN` | Una clave que comparten la página y este script |
| `TURNSTILE_SECRET` | La clave del anti-robots |
| El archivo `Codigo.gs` | El código para pegar |

Y estos dos ya están definidos, se copian tal cual:

| Dato | Para qué |
|---|---|
| Link de Halaxia | `https://www.halaxia.com/empresa/grupo-fava` |
| Link de LinkedIn | `https://www.linkedin.com/company/grupofava/` |

La página ya está online en `https://conocegrupofava.com.ar`, de ahí salen las
imágenes del mail.

---

## Paso 1 — Crear la planilla

1. Entrá a [sheets.google.com](https://sheets.google.com) y creá una planilla
   en blanco.
2. Ponele de nombre **Expo UFASTA 2026 — Registros**.
3. Mirá la dirección del navegador. Va a ser algo así:

   ```
   https://docs.google.com/spreadsheets/d/1a2B3c4D5e6F7g8H9i0J/edit
                                          └─────────────────┘
                                            esto es el ID
   ```

4. **Copiá ese código del medio** y guardalo en un bloc de notas. Es el
   `SHEET_ID` y lo vas a necesitar en el paso 3.

---

## Paso 2 — Abrir el editor y pegar el código

1. En la misma planilla: menú **Extensiones → Apps Script**.
2. Se abre una pestaña nueva con un editor de código. Va a tener algo escrito
   que dice `function myFunction()`. **Borrá todo eso.**
3. Abrí el archivo `Codigo.gs` que te pasó Augusto, copiá **todo** el
   contenido y pegalo ahí.
4. Arriba a la izquierda, donde dice *Proyecto sin título*, ponele
   **Expo UFASTA**.
5. Guardá con el icono del disquete, o Ctrl+S.

---

## Paso 3 — Cargar la configuración

En el editor, a la izquierda, tocá el engranaje **Configuración del
proyecto**. Bajá hasta **Propiedades de la secuencia de comandos** y tocá
**Agregar propiedad de secuencia de comandos**.

Cargá las que están en **`1-VALORES.md`**, una por una. El nombre va tal
cual, respetando mayúsculas.

Tocá **Guardar propiedades de la secuencia de comandos**.

> Si falta `URL_BASE`, el mail sale igual pero en texto plano, sin el diseño.
> Se puede agregar después.

---

## Paso 4 — Preparar la planilla y dar los permisos

Volvé a la solapa **Editor** (el icono `<>` a la izquierda).

1. Arriba hay un desplegable con nombres de funciones. Elegí
   **`inicializarPlanilla`**.
2. Tocá **Ejecutar**.

**La primera vez Google te va a pedir permisos.** Es normal y pasa una sola
vez. Seguí esta secuencia:

1. *Revisar permisos* → elegí la cuenta de Grupo Fava.
2. Va a aparecer un cartel que dice **"Google no ha verificado esta
   aplicación"**. Es esperable: la aplicación la estamos haciendo nosotros,
   no está publicada en ninguna tienda.
   → Tocá **Configuración avanzada** (abajo a la izquierda)
   → Tocá **Ir a Expo UFASTA (no seguro)**
3. Te va a pedir permiso para:
   - ver y administrar tus hojas de cálculo → es la planilla de registros
   - enviar correo en tu nombre → son los mails a los visitantes
   - conectarse a un servicio externo → es el anti-robots
4. Tocá **Permitir**.

Cuando termine, volvé a la planilla. Tiene que haber **dos pestañas** abajo:
**Resumen** y **Registros**.

---

## Paso 5 — Confirmar desde qué dirección van a salir los mails

Este paso es el importante y toma diez segundos.

1. En el desplegable de funciones elegí **`verificarConfiguracion`**.
2. Tocá **Ejecutar**.
3. Abajo se abre el **Registro de ejecución**. Vas a ver algo así:

```
=========================================================
  SESION ACTUAL: sistemas@fava.com.ar

  Si hay un disparador creado por esta cuenta, los mails
  van a salir con este "De:".

  Disparadores de procesarMails de ESTA cuenta: 0
    -> Ninguno. Esta cuenta NO manda mails.

  Cuota de mails restante hoy: 1500
=========================================================
```

**Fijate en dos cosas:**

- **`SESION ACTUAL`** tiene que decir la dirección de Grupo Fava. Si dice un
  Gmail personal o cualquier otra, frená acá y avisá: estás en la cuenta
  equivocada y hay que rehacer desde el paso 1.
- **`Cuota de mails restante`** tiene que decir alrededor de **1500**. Si dice
  **100**, la cuenta no es de Google Workspace y no va a alcanzar para los
  visitantes de la expo. Avisá también.

Mandale una captura de esta pantalla a Augusto.

---

## Paso 6 — Encender el envío de mails

1. En el desplegable elegí **`instalarDisparadorDeMails`**.
2. Tocá **Ejecutar**.
3. En el registro tiene que decir:
   `Disparador instalado: procesarMails cada 1 minuto`

Esto es lo que hace que los mails salgan solos. **Sin este paso los datos se
guardan igual, pero no se envía ningún mail.**

> **Importante:** este paso lo tiene que hacer **esta cuenta y ninguna otra**.
> Si otra persona lo corriera desde su propia cuenta, quedarían dos envíos
> activos, saldrían mails desde dos direcciones distintas, y desde acá no se
> ven los de la otra cuenta. Es una particularidad de Google, no un error
> nuestro.

---

## Paso 7 — Publicar

1. Arriba a la derecha, botón azul **Implementar → Nueva implementación**.
2. Tocá el engranaje al lado de *Seleccionar tipo* y elegí
   **Aplicación web**.
3. Completá así:

   | Campo | Valor |
   |---|---|
   | Descripción | `Expo UFASTA` |
   | Ejecutar como | **Yo** (tiene que mostrar la dirección de Grupo Fava) |
   | Quién tiene acceso | **Cualquier usuario** |

   > "Cualquier usuario" suena a mucho, pero es necesario: los visitantes de
   > la expo completan el formulario sin tener cuenta de Google. Lo único que
   > queda expuesto es este formulario, no la planilla ni el correo.

4. Tocá **Implementar**.
5. Copiá la **URL de la aplicación web**. Termina en `/exec`.

---

## Paso 8 — Probar que funciona

1. En el desplegable elegí **`pruebaLocal`** y tocá **Ejecutar**.
2. Andá a la planilla: tiene que haber aparecido una fila nueva con los datos
   de prueba.
3. Esperá un minuto y revisá tu correo: te tiene que llegar el mail de
   confirmación. Si no querés esperar, volvé al editor, elegí
   **`procesarMails`** y tocá **Ejecutar**.
4. En la planilla, la columna **MailEnviado** de esa fila tiene que tener una
   fecha.

Si el mail llegó y se ve bien, está listo.

Borrá esa fila de prueba antes del evento.

---

## Paso 9 — Pasarle el acceso a Augusto

1. Mandale la **URL que termina en `/exec`** del paso 7.
2. En la planilla: **Compartir** → agregá el mail de Augusto como **Editor**.
3. En el editor de Apps Script: **Compartir** (arriba a la derecha) → agregalo
   también como **Editor**.

Con eso él sigue solo y no hace falta molestarte más.

---

## Lo que NO hay que hacer

- **No** correr `instalarDisparadorDeMails` desde otra cuenta.
- **No** mover la planilla ni el proyecto a otra unidad de Drive.
- **No** borrar la columna `MailEnviado` de la planilla ni cambiar el orden de
  las columnas: los contadores de la pestaña Resumen dejan de funcionar.
- **No** cambiar la contraseña de la cuenta antes del evento. Después sí, sin
  problema: todo sigue funcionando igual.

---

## Si algo sale mal

| Qué ves | Qué pasa |
|---|---|
| `SESION ACTUAL` muestra otra dirección | Estás en la cuenta equivocada. Ventana de incógnito y de nuevo desde el paso 1 |
| La cuota dice 100 en vez de 1500 | La cuenta no es de Workspace. Avisá antes de seguir |
| Se guardan filas pero no llegan mails | Faltó el paso 6. Corré `verificarConfiguracion` y fijate si dice 0 disparadores |
| Llegan mails repetidos | Hay dos disparadores. Corré `borrarMisDisparadores` en la cuenta que sobra |
| Querés ver cómo viene | Corré `verPendientes`: dice cuántos faltan, cuántos fallaron y cuánta cuota queda |

Ante cualquier duda, sacá captura del **Registro de ejecución** y mandala. Ahí
está siempre el motivo real.
