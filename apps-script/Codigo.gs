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
 *   URL_LINKEDIN       LinkedIn de Grupo Fava, para el mail
 *   URL_HALAXIA        busquedas laborales de Halaxia, para el mail
 *
 * Ninguno se hardcodea. Despues de cada cambio de codigo hay que crear una
 * VERSION NUEVA en Administrar implementaciones, o la URL /exec sigue
 * sirviendo el codigo viejo. Es el error mas comun de todos.
 */

var CABECERAS = [
  'Fecha',
  'Nombre',
  'Apellido',
  'DNI',
  'Telefono',
  'Email',
  'Estudios',
  'AnioCarrera',
  'Camino',
  'Consentimiento',
  'Origen',
  'SubmissionId',
  // Vacia = el mail todavia no salio. Fecha = salio. "ERROR: ..." = fallo y
  // no se reintenta solo; para reintentar, vaciar la celda a mano.
  'MailEnviado',
];

/** Tope por corrida del disparador, para no comerse los 6 min de ejecucion. */
var TOPE_MAILS_POR_CORRIDA = 40;
/** Colchon de cuota: si queda menos que esto, se frena y se avisa. */
var RESERVA_CUOTA = 20;

/** Los cuatro caminos de la dinamica del stand. Lista cerrada. */
var CAMINOS = ['Crear', 'Resolver', 'Conectar', 'Hacer crecer'];

var ANIOS = [
  '1º año', '2º año', '3º año', '4º año', '5º año', '6º año',
  'Ya me recibí', 'Todavía no empecé',
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

    // 5. El mail NO se manda aca. Antes se mandaba dentro del request y el
    //    visitante esperaba a que MailApp terminara, con gente atras suyo en
    //    la fila. Ahora la fila queda con MailEnviado vacio y un disparador
    //    por tiempo la levanta en el proximo minuto. Eso ademas da reintento
    //    gratis y deja en la planilla quien recibio el mail y quien no.

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

  var dni = texto(datos.dni).replace(/\D/g, '');
  if (!/^\d{7,8}$/.test(dni)) {
    return { campo: 'dni', error: 'El DNI va sin puntos, entre 7 y 8 números' };
  }

  // En la expo el telefono es obligatorio, a diferencia del formulario viejo.
  var tel = normalizarTelefono(texto(datos.telefono));
  if (!/^\d{10}$/.test(tel)) {
    return {
      campo: 'telefono',
      error: 'El teléfono va con código de área y sin el 15',
    };
  }

  var email = texto(datos.email).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { campo: 'email', error: 'Revisá el email, le falta algo' };
  }

  var estudios = texto(datos.estudios);
  if (estudios.length < 2 || estudios.length > 100) {
    return { campo: 'estudios', error: 'Contanos qué estudiás o estudiaste' };
  }

  if (ANIOS.indexOf(texto(datos.anioCarrera)) === -1) {
    return { campo: 'anioCarrera', error: 'Elegí una opción de la lista' };
  }

  if (CAMINOS.indexOf(texto(datos.camino)) === -1) {
    return { campo: 'camino', error: 'Elegí uno de los cuatro caminos' };
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
      // Apostrofo adelante: sin esto Sheets se come el cero de un DNI de 7
      // y convierte el telefono en notacion cientifica.
      "'" + texto(datos.dni).replace(/\D/g, ''),
      "'" + normalizarTelefono(texto(datos.telefono)),
      texto(datos.email).toLowerCase(),
      texto(datos.estudios),
      texto(datos.anioCarrera),
      texto(datos.camino),
      datos.consentimiento === true ? 'Sí' : 'No',
      texto(datos.origen),
      texto(datos.submissionId),
      // MailEnviado vacio: lo levanta procesarMails() en el proximo minuto.
      '',
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
  var camino = texto(datos.camino);
  var linkedin = prop('URL_LINKEDIN', '');
  var halaxia = prop('URL_HALAXIA', '');

  var lineas = [
    'Hola ' + nombre + ',',
    '',
    'Gracias por acercarte a nuestro stand en la Expo UFASTA.',
    'Ya quedaste participando del sorteo: si salís, te escribimos a este mismo mail.',
    '',
    'Elegiste el camino "' + camino + '". Hay mucho más detrás de FAVA, y buena',
    'parte de eso son las personas que lo hacen posible.',
    '',
    'Grupo Fava es una empresa marplatense fundada en 1909, con 40 sucursales en',
    'la Provincia de Buenos Aires y tres unidades de negocio: Fava Paseo de',
    'Compras, Tarjeta Favacard y Préstamos Muy.',
    '',
  ];

  if (halaxia) {
    lineas.push('Nuestras búsquedas laborales abiertas, en Halaxia:');
    lineas.push('  ' + halaxia);
    lineas.push('');
  }
  if (linkedin) {
    lineas.push('Seguinos en LinkedIn para enterarte de las que vienen:');
    lineas.push('  ' + linkedin);
    lineas.push('');
  }

  lineas.push('Si no fuiste vos quien dejó estos datos, respondé este mail y te damos');
  lineas.push('de baja.');
  lineas.push('');
  lineas.push('Grupo Fava');

  var opciones = {
    name: prop('MAIL_NOMBRE', 'Grupo Fava'),
    body: lineas.join('\n'),
  };
  var responder = prop('MAIL_RESPUESTA', '');
  if (responder) opciones.replyTo = responder;

  MailApp.sendEmail(
    Object.assign(
      {
        to: texto(datos.email),
        subject: 'Gracias por pasar por el stand de Grupo Fava',
      },
      opciones
    )
  );
}

/* ------------------------------------------------------------------ */
/* Cola de mails                                                       */
/* ------------------------------------------------------------------ */

/**
 * Manda los mails que quedaron pendientes. Lo llama un disparador por tiempo
 * cada minuto, NO el request del formulario.
 *
 * Por que separado: mandarlo dentro de doPost hacia que el visitante esperara
 * a MailApp con gente atras en la fila. Aparte, si MailApp fallaba, ese mail
 * se perdia para siempre. Asi la fila queda marcada y se puede reintentar.
 */
function procesarMails() {
  var lock = LockService.getScriptLock();
  // Si la corrida anterior sigue viva, esta se saltea: vuelve en un minuto.
  if (!lock.tryLock(5000)) return;

  try {
    var h = hoja();
    var filas = h.getLastRow() - 1;
    if (filas < 1) return;

    var iMail = CABECERAS.indexOf('MailEnviado');
    var valores = h.getRange(2, 1, filas, CABECERAS.length).getValues();
    var hechos = 0;

    for (var i = 0; i < valores.length && hechos < TOPE_MAILS_POR_CORRIDA; i++) {
      if (String(valores[i][iMail]).trim() !== '') continue;

      var quedan = MailApp.getRemainingDailyQuota();
      if (quedan <= RESERVA_CUOTA) {
        console.error('Cuota de mails casi agotada: quedan ' + quedan);
        break;
      }

      var marca;
      try {
        enviarMail(filaAObjeto(valores[i]));
        marca = new Date();
      } catch (err) {
        // Queda escrito en la planilla: se ve de un vistazo quien no recibio.
        marca = 'ERROR: ' + err;
        console.error('mail fallido en la fila ' + (i + 2) + ': ' + err);
      }
      h.getRange(i + 2, iMail + 1).setValue(marca);
      hechos++;
    }

    if (hechos > 0) console.log('mails enviados en esta corrida: ' + hechos);
  } finally {
    lock.releaseLock();
  }
}

/** Traduce una fila de la planilla a lo que espera enviarMail(). */
function filaAObjeto(fila) {
  var o = {};
  for (var i = 0; i < CABECERAS.length; i++) o[CABECERAS[i]] = fila[i];
  return {
    nombre: String(o.Nombre || ''),
    email: String(o.Email || ''),
    camino: String(o.Camino || ''),
  };
}

/**
 * Instala el disparador de mails. Correr UNA VEZ desde el editor, con la
 * cuenta de Workspace de Fava. Si se corre de nuevo, reemplaza el anterior
 * en vez de duplicarlo.
 */
function instalarDisparadorDeMails() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'procesarMails') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('procesarMails').timeBased().everyMinutes(1).create();
  console.log('Disparador instalado: procesarMails cada 1 minuto');
}

/** Cuantos mails quedan sin mandar. Util para mirar durante el evento. */
function verPendientes() {
  var h = hoja();
  var filas = h.getLastRow() - 1;
  if (filas < 1) {
    console.log('0 pendientes, 0 filas');
    return;
  }
  var iMail = CABECERAS.indexOf('MailEnviado');
  var col = h.getRange(2, iMail + 1, filas, 1).getValues();
  var pend = 0;
  var errores = 0;
  for (var i = 0; i < col.length; i++) {
    var v = String(col[i][0]).trim();
    if (v === '') pend++;
    else if (v.indexOf('ERROR') === 0) errores++;
  }
  console.log(
    filas + ' filas | ' + pend + ' sin mandar | ' + errores + ' con error | ' +
    'cuota restante: ' + MailApp.getRemainingDailyQuota()
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
        dni: '12345678',
        telefono: '0223 155123456',
        email: Session.getActiveUser().getEmail(),
        estudios: 'Contador Público',
        anioCarrera: '3º año',
        camino: 'Resolver',
        consentimiento: true,
        origen: 'prueba',
      }),
    },
  });
  console.log(res.getContent());
}
