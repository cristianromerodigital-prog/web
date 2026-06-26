// ═══════════════════════════════════════════
// Code.gs — Web App entry point
// ═══════════════════════════════════════════

function doGet(e) {
  const action   = (e && e.parameter && e.parameter.action)   || '';
  const callback = (e && e.parameter && e.parameter.callback) || '';

  let result = null;

  if (action === 'getServicios')   result = getServiciosParaForm();
  if (action === 'getContratos')   result = getContratos();
  if (action === 'getSolicitudes') result = getSolicitudes();
  if (action === 'nextNumber') {
    const tipo = (e.parameter.tipo || 'BODA').toUpperCase();
    result = peekLastNumber(tipo) + 1;
  }
  if (action === 'getDriveFolder') {
    const folderId = (e && e.parameter && e.parameter.folder) || '';
    result = folderId ? getDriveFolderFiles(folderId) : [];
  }

  // Si hay resultado JSON (con o sin JSONP)
  if (result !== null) {
    if (callback) {
      // JSONP — permite llamadas cross-origin desde admin.html externo
      return ContentService
        .createTextOutput(callback + '(' + JSON.stringify(result) + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return _jsonResponse(result);
  }

  if (action === 'form') {
    return HtmlService
      .createHtmlOutputFromFile('FormCliente')
      .setTitle('Solicitud de Servicio — Cristian Romero Digital')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  // Sin action → formulario de solicitud para clientes
  return HtmlService
    .createHtmlOutputFromFile('FormCliente')
    .setTitle('Solicitud de Servicio — Cristian Romero Digital')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function _jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.action === 'getServicios')   return _jsonResponse(getServiciosParaForm());
    if (data.action === 'getContratos')   return _jsonResponse(getContratos());
    if (data.action === 'getSolicitudes') return _jsonResponse(getSolicitudes());
    if (data.action === 'nextNumber') {
      const tipo = (data.tipo || 'BODA').toUpperCase();
      return _jsonResponse(peekLastNumber(tipo) + 1);
    }
    if (data.action === 'guardarSolicitud') {
      return ContentService
        .createTextOutput(JSON.stringify(guardarSolicitud(data.formData)))
        .setMimeType(ContentService.MimeType.JSON);
    }
    if (data.action === 'marcarSolicitudUsada') {
      marcarSolicitudUsada(data.id);
      return ContentService.createTextOutput('{"ok":true}').setMimeType(ContentService.MimeType.JSON);
    }
    if (data.action === 'syncCalendar') {
      return ContentService
        .createTextOutput(JSON.stringify(syncCalendar(data.events || [])))
        .setMimeType(ContentService.MimeType.JSON);
    }
    if (data.action === 'deleteContrato') {
      return ContentService
        .createTextOutput(JSON.stringify(deleteContrato(data.numero)))
        .setMimeType(ContentService.MimeType.JSON);
    }
    const resultado = crearContrato(data);
    return ContentService
      .createTextOutput(JSON.stringify(resultado))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Llamadas desde el HTML client-side via google.script.run
function serverGetServicios() {
  return getServiciosParaForm();
}

function serverCrearContrato(formJson)    { return crearContrato(formJson); }
function serverGetNextNumber(tipo)        { return peekLastNumber(tipo) + 1; }
function serverGetContratos()             { return getContratos(); }
function serverDeleteContrato(numero)     { return deleteContrato(numero); }
function serverGuardarSolicitud(data)     { return guardarSolicitud(data); }
function serverGetSolicitudes()           { return getSolicitudes(); }
function serverMarcarSolicitudUsada(id)   { marcarSolicitudUsada(id); }
