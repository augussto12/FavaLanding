/**
 * Landing Fava - receptor del formulario.
 *
 * Configuracion en Propiedades de la secuencia de comandos
 * (Configuracion del proyecto > Propiedades de la secuencia de comandos):
 *
 *   SHEET_ID           id de la planilla destino
 *   HOJA               nombre de la pestaña (por defecto "Registros")
 *   FORM_TOKEN         mismo valor que VITE_FORM_TOKEN del front
 *   TURNSTILE_SECRET   secret key de Cloudflare Turnstile
 *   MAIL_NOMBRE        nombre del remitente, ej. "Grupo Fava"
 *   MAIL_RESPUESTA     direccion de respuesta, ej. contacto@fava.com.ar
 *
 * Ninguno se hardcodea. Despues de cada cambio de codigo hay que crear una
 * VERSION NUEVA en Administrar implementaciones, o la URL /exec sigue
 * sirviendo el codigo viejo. Es el error mas comun de todos.
 */

var CABECERAS = [
  'Fecha',
  'Nombre',
  'Apellido',
  'Email',
  'DNI',
  'Telefono',
  'Localidad',
  'Genero',
  'Consentimiento',
  'Origen',
  'SubmissionId',
];

function prop(clave, porDefecto) {
  var v = PropertiesService.getScriptProperties().getProperty(clave);
  return v === null || v === '' ? porDefecto : v;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

/** Health check: abrir la URL /exec en el navegador tiene que devolver ok. */
function doGet() {
  return json({
    ok: true,
    servicio: 'landing-fava',
    cuotaMails: MailApp.getRemainingDailyQuota(),
  });
}

function doPost(e) {
  try {
    var datos;
    try {
      datos = JSON.parse(e.postData.contents);
    } catch (err) {
      return json({ ok: false, tipo: 'servidor', error: 'JSON invalido' });
    }

    // 1. Token compartido y Turnstile
    if (datos.token !== prop('FORM_TOKEN', '')) {
      return json({ ok: false, tipo: 'servidor', error: 'Token invalido' });
    }
    var secret = prop('TURNSTILE_SECRET', '');
    if (secret && !validarTurnstile(datos.turnstileToken, secret)) {
      return json({
        ok: false,
        tipo: 'servidor',
        error: 'No pudimos verificar que seas una persona',
      });
    }

    // 2. Campos
    var problema = validar(datos);
    if (problema) {
      return json({
        ok: false,
        tipo: 'validacion',
        campo: problema.campo,
        error: problema.error,
      });
    }

    // 3. Idempotencia: el doble tap del que creyo que se colgo.
    var cache = CacheService.getScriptCache();
    var clave = 'sub_' + datos.submissionId;
    if (datos.submissionId && cache.get(clave)) {
      return json({ ok: true, duplicado: true });
    }

    // 4. Guardar. Esto es lo unico que realmente importa.
    guardarFila(datos);
    if (datos.submissionId) cache.put(clave, '1', 600);

    // 5. El mail va despues y aislado: si falla, el contacto ya esta guardado.
    try {
      enviarMail(datos);
    } catch (err) {
      console.error('mail fallido para ' + datos.email + ': ' + err);
    }

    return json({ ok: true });
  } catch (err) {
    console.error(err);
    return json({ ok: false, tipo: 'servidor', error: 'Error inesperado' });
  }
}

/* ------------------------------------------------------------------ */
/* Turnstile                                                           */
/* ------------------------------------------------------------------ */

function validarTurnstile(token, secret) {
  if (!token) return false;
  try {
    var res = UrlFetchApp.fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'post',
        payload: { secret: secret, response: token },
        muteHttpExceptions: true,
      }
    );
    return JSON.parse(res.getContentText()).success === true;
  } catch (err) {
    console.error('turnstile: ' + err);
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Validacion                                                          */
/* ------------------------------------------------------------------ */

function texto(v) {
  return typeof v === 'string' ? v.trim() : '';
}

/**
 * Se revalida todo del lado del servidor: lo que llega del navegador
 * es una sugerencia, no un dato de confianza.
 */
function validar(datos) {
  var nombre = texto(datos.nombre);
  if (nombre.length < 2 || nombre.length > 50) {
    return { campo: 'nombre', error: 'Escribí tu nombre, al menos 2 letras' };
  }

  var apellido = texto(datos.apellido);
  if (apellido.length < 2 || apellido.length > 50) {
    return { campo: 'apellido', error: 'Escribí tu apellido, al menos 2 letras' };
  }

  var email = texto(datos.email).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { campo: 'email', error: 'Revisá el email, le falta algo' };
  }

  var dni = texto(datos.dni).replace(/\D/g, '');
  if (!/^\d{7,8}$/.test(dni)) {
    return { campo: 'dni', error: 'El DNI va sin puntos, entre 7 y 8 números' };
  }

  var tel = normalizarTelefono(texto(datos.telefono));
  if (tel !== '' && !/^\d{10}$/.test(tel)) {
    return {
      campo: 'telefono',
      error: 'El teléfono va con código de área y sin el 15',
    };
  }

  if (datos.consentimiento !== true) {
    return {
      campo: 'consentimiento',
      error: 'Necesitamos tu permiso para guardar los datos',
    };
  }

  return null;
}

function normalizarTelefono(v) {
  var d = String(v || '').replace(/\D/g, '');
  if (d.indexOf('54') === 0) d = d.slice(2);
  if (d.indexOf('9') === 0) d = d.slice(1);
  if (d.indexOf('0') === 0) d = d.slice(1);
  return d.replace(/^(\d{2,4})15(\d{6,8})$/, '$1$2');
}

/* ------------------------------------------------------------------ */
/* Planilla                                                            */
/* ------------------------------------------------------------------ */

function hoja() {
  var libro = SpreadsheetApp.openById(prop('SHEET_ID', ''));
  var nombre = prop('HOJA', 'Registros');
  var h = libro.getSheetByName(nombre);
  if (!h) {
    h = libro.insertSheet(nombre);
    h.appendRow(CABECERAS);
    h.setFrozenRows(1);
  }
  return h;
}

/**
 * LockService serializa los appendRow. Sin esto, dos personas enviando
 * en el mismo segundo pueden pisarse la fila.
 */
function guardarFila(datos) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    hoja().appendRow([
      new Date(),
      texto(datos.nombre),
      texto(datos.apellido),
      texto(datos.email).toLowerCase(),
      // Apostrofo adelante: sin esto Sheets se come el cero de un DNI de 7.
      "'" + texto(datos.dni).replace(/\D/g, ''),
      "'" + normalizarTelefono(texto(datos.telefono)),
      texto(datos.localidad),
      texto(datos.genero),
      datos.consentimiento === true ? 'Sí' : 'No',
      texto(datos.origen),
      texto(datos.submissionId),
    ]);
  } finally {
    lock.releaseLock();
  }
}

/* ------------------------------------------------------------------ */
/* Mail                                                                */
/* ------------------------------------------------------------------ */

function enviarMail(datos) {
  var nombre = texto(datos.nombre);
  var cuerpo =
    'Hola ' +
    nombre +
    ',\n\n' +
    'Recibimos tus datos. Ya estás sumado a las novedades de Grupo Fava.\n\n' +
    'Si no fuiste vos, escribinos respondiendo este mail y te damos de baja.\n\n' +
    'Gracias por acercarte.\n' +
    'Grupo Fava\n';

  var opciones = {
    name: prop('MAIL_NOMBRE', 'Grupo Fava'),
    body: cuerpo,
  };
  var responder = prop('MAIL_RESPUESTA', '');
  if (responder) opciones.replyTo = responder;

  MailApp.sendEmail(
    Object.assign(
      {
        to: texto(datos.email),
        subject: 'Gracias por registrarte en Grupo Fava',
      },
      opciones
    )
  );
}

/* ------------------------------------------------------------------ */
/* Utilidades para correr a mano desde el editor                       */
/* ------------------------------------------------------------------ */

/** Crea la pestaña con las cabeceras. Correr una vez al configurar. */
function inicializarPlanilla() {
  hoja();
  console.log('Planilla lista');
}

/** Cuanto margen de mails queda hoy. Correr el dia previo al evento. */
function verCuotaMails() {
  console.log(MailApp.getRemainingDailyQuota());
}

/** Prueba de punta a punta sin pasar por el navegador. */
function pruebaLocal() {
  var res = doPost({
    postData: {
      contents: JSON.stringify({
        token: prop('FORM_TOKEN', ''),
        submissionId: 'prueba-' + Date.now(),
        turnstileToken: '',
        nombre: 'Prueba',
        apellido: 'Interna',
        email: Session.getActiveUser().getEmail(),
        dni: '12345678',
        telefono: '0223 155123456',
        localidad: '47-Mar del Plata',
        genero: 'Prefiero no decirlo',
        consentimiento: true,
        origen: 'prueba',
      }),
    },
  });
  console.log(res.getContent());
}
