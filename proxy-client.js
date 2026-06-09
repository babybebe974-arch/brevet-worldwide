// ============================================================
// SMART LEARN — PROXY CLIENT UNIFIÉ (v4.0.0)
// FIX CORS : URLSearchParams (pas de preflight)
// ============================================================

const PROXY_URL = 'https://script.google.com/macros/s/AKfycbxxQCRDZvKAb9fuXkDslK7LYMXjcIrIi-_EpA8DWT1-tTelSpYcMxPkiSPG5bKheLTY/exec';
const PROXY_TIMEOUT_MS = 45000;

// ── Helpers identité ──────────────────────────────────────────
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

function isPaid() {
  if (typeof aAccesComplet !== 'undefined') return aAccesComplet();
  return localStorage.getItem('brevet_paid') === 'true';
}

function getJoursRestantsEssai() {
  if (typeof joursRestantsEssai !== 'undefined') return joursRestantsEssai();
  return 0;
}

function safeJSON(t) {
  try { return JSON.parse(t.replace(/```json|```/g, '').trim()); }
  catch(e) { return null; }
}

// ── Appel proxy (URLSearchParams = pas de preflight CORS) ─────
function _fetchProxy(payload, timeoutMs) {
  timeoutMs = timeoutMs || PROXY_TIMEOUT_MS;
  var timeout = new Promise(function(_, reject) {
    setTimeout(function() { reject(new Error('Timeout ' + (timeoutMs/1000) + 's')); }, timeoutMs);
  });
  var req = fetch(PROXY_URL, {
    method: 'POST',
    body: new URLSearchParams({ data: JSON.stringify(payload) })
  }).then(function(r) {
    if (!r.ok) throw new Error('Proxy HTTP ' + r.status);
    return r.json();
  });
  return Promise.race([req, timeout]);
}

// ── callIA : correction IA ────────────────────────────────────
async function callIA(prompt, system) {
  // Vérification accès avant tout appel
  if (typeof aAccesComplet !== 'undefined' && !aAccesComplet()) {
    if (typeof essaiExpire !== 'undefined' && essaiExpire()) {
      if (typeof afficherBlocageEssaiExpire !== 'undefined') afficherBlocageEssaiExpire();
    } else {
      if (typeof afficherRappelPaiement !== 'undefined') afficherRappelPaiement();
    }
    throw new Error('ACCES_BLOQUE');
  }

  var data = await _fetchProxy({
    userId: getUserId(),
    action: 'correction_ia',
    prompt: prompt,
    system: system,
    estPayant: isPaid(),
    sessionId: getSessionId(),
    joursRestantsEssai: getJoursRestantsEssai(),
    source: document.title || window.location.pathname,
    matiere: window._currentMatiere || '',
    type: window._currentType || ''
  });

  if (data.success && data.content) return data.content;
  throw new Error(data.error || 'Réponse proxy inattendue');
}

// ── validerCodeServeur : validation d'un code d'accès ─────────
async function validerCodeServeur(code) {
  var data = await _fetchProxy({
    userId: getUserId(),
    action: 'valider_code',
    code: code,
    sessionId: getSessionId(),
    source: document.title || window.location.pathname
  }, 10000);

  if (data.success) return data;
  throw new Error(data.error || 'Code invalide');
}

// ── Surcharge isPaid avec le système de monétisation ─────────
window.isPaid = function() {
  if (typeof aAccesComplet !== 'undefined') return aAccesComplet();
  return localStorage.getItem('brevet_paid') === 'true';
};

// Exposer globalement
window.callIA = callIA;
window.validerCodeServeur = validerCodeServeur;
window.getUserId = getUserId;
window.getSessionId = getSessionId;
window.getJoursRestantsEssai = getJoursRestantsEssai;
window.safeJSON = safeJSON;
