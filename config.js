// ============================================================
// SMART LEARN — CONFIGURATION CENTRALISÉE v4.0
// Proxy Apps Script (URLSearchParams — pas de CORS)
// ============================================================

const APP_CONFIG = {
  // URL proxy Apps Script (unique point d'entrée)
  proxyUrl: 'https://script.google.com/macros/s/AKfycbxxQCRDZvKAb9fuXkDslK7LYMXjcIrIi-_EpA8DWT1-tTelSpYcMxPkiSPG5bKheLTY/exec',

  // URL tracker (même proxy)
  trackerUrl: 'https://script.google.com/macros/s/AKfycbxxQCRDZvKAb9fuXkDslK7LYMXjcIrIi-_EpA8DWT1-tTelSpYcMxPkiSPG5bKheLTY/exec',

  timeoutMs: 45000,
  version:   '4.0.0',
  appName:   'SMART LEARN'
};

// ============================================================
// callIA — via proxy Apps Script (URLSearchParams = pas de preflight CORS)
// ============================================================
async function callIA(prompt, system) {
  // Vérification accès monétisation
  if (typeof aAccesComplet !== 'undefined' && !aAccesComplet()) {
    if (typeof afficherBlocageEssaiExpire !== 'undefined') afficherBlocageEssaiExpire();
    throw new Error('ACCES_BLOQUE');
  }

  var timeout = new Promise(function(_, reject) {
    setTimeout(function() { reject(new Error('Timeout 45s')); }, APP_CONFIG.timeoutMs);
  });

  var payload = JSON.stringify({
    userId:             typeof getUserId       !== 'undefined' ? getUserId()            : 'anon',
    action:             'correction_ia',
    prompt:             prompt,
    system:             system,
    estPayant:          typeof isPaid          !== 'undefined' ? isPaid()               : false,
    sessionId:          typeof getSessionId    !== 'undefined' ? getSessionId()         : 'sess',
    joursRestantsEssai: typeof joursRestantsEssai !== 'undefined' ? joursRestantsEssai() : 0,
    source:             document.title || window.location.pathname,
    matiere:            window._currentMatiere || '',
    type:               window._currentType    || ''
  });

  var req = fetch(APP_CONFIG.proxyUrl, {
    method: 'POST',
    body: new URLSearchParams({ data: payload })
  }).then(function(r) {
    if (!r.ok) throw new Error('Proxy HTTP ' + r.status);
    return r.json();
  }).then(function(d) {
    if (d.success && d.content) return d.content;
    throw new Error(d.error || 'Réponse proxy inattendue');
  });

  return Promise.race([req, timeout]);
}

function safeJSON(t) {
  try { return JSON.parse(t.replace(/```json|```/g, '').trim()); }
  catch(e) { return null; }
}

function getUserId() {
  var id = localStorage.getItem('user_id');
  if (!id) {
    id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'user_' + Date.now();
    localStorage.setItem('user_id', id);
  }
  return id;
}

function getSessionId() {
  var sid = sessionStorage.getItem('session_id');
  if (!sid) { sid = 'sess_' + Date.now(); sessionStorage.setItem('session_id', sid); }
  return sid;
}

// Exposer globalement
window.APP_CONFIG   = APP_CONFIG;
window.callIA       = callIA;
window.safeJSON     = safeJSON;
window.getUserId    = getUserId;
window.getSessionId = getSessionId;
