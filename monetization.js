// ============================================================
// SMART LEARN — SYSTÈME DE MONÉTISATION (v4.0.0)
// Essai gratuit 2 jours · 29€/an · Code famille
// ============================================================

const MONETIZATION = {
  prix: 29,
  devise: 'EUR',
  dureeAbonnement: 365,
  essaiJours: 2,
  rappelHeures: 12,
  codeMaitre: 'Entrepotes974NawalWassil',
  paymentWise: 'https://wise.com/pay/r/UeBUFQoUY_B5FYE',
  emailContact: 'smartlearn.mu@gmail.com',
  nomBeneficiaire: 'SMART LEARN',
  STORAGE_KEYS: {
    trialStart: 'brevet_start',
    paidValid: 'brevet_paid',
    lastReminder: 'brevet_last_reminder',
    overlayDismissed: 'brevet_ov_dismiss'
  }
};

// ============================================================
// FONCTIONS D'ÉTAT
// ============================================================

function estEnEssai() {
  var start = localStorage.getItem(MONETIZATION.STORAGE_KEYS.trialStart);
  if (!start) return true;
  var joursEcoules = (Date.now() - parseInt(start)) / (1000 * 60 * 60 * 24);
  return joursEcoules < MONETIZATION.essaiJours;
}

function essaiExpire() {
  var start = localStorage.getItem(MONETIZATION.STORAGE_KEYS.trialStart);
  if (!start) return false;
  var joursEcoules = (Date.now() - parseInt(start)) / (1000 * 60 * 60 * 24);
  return joursEcoules >= MONETIZATION.essaiJours;
}

function aAccesComplet() {
  if (localStorage.getItem(MONETIZATION.STORAGE_KEYS.paidValid) === 'true') return true;
  return estEnEssai();
}

function aAccesPayant() {
  return localStorage.getItem(MONETIZATION.STORAGE_KEYS.paidValid) === 'true';
}

function joursRestantsEssai() {
  var start = localStorage.getItem(MONETIZATION.STORAGE_KEYS.trialStart);
  if (!start) return MONETIZATION.essaiJours;
  var joursEcoules = (Date.now() - parseInt(start)) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(MONETIZATION.essaiJours - joursEcoules));
}

function verifierCodeLocal(code) {
  return code.trim() === MONETIZATION.codeMaitre;
}

// ============================================================
// VALIDATION DE CODE
// ============================================================

function validerCode(codeSaisi, callback) {
  // 1. Code maître local (jamais envoyé au serveur)
  if (verifierCodeLocal(codeSaisi)) {
    localStorage.setItem(MONETIZATION.STORAGE_KEYS.paidValid, 'true');
    if (callback) callback({ success: true, message: '✅ Code famille activé ! Accès complet débloqué.' });
    return;
  }

  // 2. Validation serveur via proxy (URLSearchParams)
  var payload = JSON.stringify({
    userId: (typeof getUserId !== 'undefined') ? getUserId() : 'anon',
    action: 'valider_code',
    code: codeSaisi.trim(),
    sessionId: (typeof getSessionId !== 'undefined') ? getSessionId() : 'sess',
    source: document.title || ''
  });

  var timeout = new Promise(function(_, reject) {
    setTimeout(function() { reject(new Error('Timeout')); }, 10000);
  });

  var PROXY = 'https://script.google.com/macros/s/AKfycbxxQCRDZvKAb9fuXkDslK7LYMXjcIrIi-_EpA8DWT1-tTelSpYcMxPkiSPG5bKheLTY/exec';

  var req = fetch(PROXY, {
    method: 'POST',
    body: new URLSearchParams({ data: payload })
  }).then(function(r) { return r.json(); });

  Promise.race([req, timeout]).then(function(data) {
    if (data && data.success === true) {
      localStorage.setItem(MONETIZATION.STORAGE_KEYS.paidValid, 'true');
      if (callback) callback({ success: true, message: '✅ Code valide ! Accès complet débloqué.' });
    } else {
      if (callback) callback({ success: false, message: '❌ ' + (data && data.error ? data.error : 'Code invalide.') });
    }
  }).catch(function() {
    if (callback) callback({ success: false, message: '❌ Impossible de valider. Vérifiez votre connexion.' });
  });
}

// ============================================================
// OVERLAY BLOQUANT
// ============================================================

function creerOverlayMonetization(type, joursRestants) {
  if (document.getElementById('monet-overlay')) return;
  joursRestants = joursRestants || 0;

  var titre, message;
  if (type === 'expire') {
    titre = '⏰ Essai gratuit terminé';
    message = 'Votre essai gratuit de 2 jours est terminé.';
  } else if (type === 'rappel') {
    titre = '🔔 Essai gratuit — J-' + joursRestants;
    message = joursRestants === 1
      ? 'Dernier jour d\'essai ! Débloquez l\'accès complet pour 1 an.'
      : 'Encore ' + joursRestants + ' jour(s) d\'essai. Débloquez l\'accès pour 1 an.';
  } else {
    titre = '🔒 Accès bloqué';
    message = 'Vous devez débloquer l\'accès complet pour continuer.';
  }

  var canClose = (type === 'rappel');

  var overlay = document.createElement('div');
  overlay.id = 'monet-overlay';
  overlay.innerHTML = '<style>' +
    '#monet-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(9,9,15,0.97);z-index:99999;display:flex;align-items:center;justify-content:center;font-family:"DM Sans","Segoe UI",Arial,sans-serif;backdrop-filter:blur(8px);}' +
    '#monet-overlay.hidden{display:none!important;}' +
    '.monet-card{background:#111118;border:1px solid #2a2a38;border-radius:16px;padding:32px 28px;max-width:480px;width:90%;color:#e8e8f0;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.6);}' +
    '.monet-icon{font-size:48px;margin-bottom:12px;}' +
    '.monet-title{font-size:22px;font-weight:800;margin-bottom:8px;color:#e8c87a;}' +
    '.monet-sub{font-size:14px;color:#9090a8;margin-bottom:20px;line-height:1.6;}' +
    '.monet-price{font-size:38px;font-weight:800;color:#5ecfb1;margin:8px 0;}' +
    '.monet-price small{font-size:16px;color:#9090a8;}' +
    '.monet-input{width:100%;background:#0d0d14;border:1px solid #2a2a38;border-radius:10px;color:#e8e8f0;font-size:15px;padding:12px 16px;text-align:center;margin-bottom:10px;outline:none;box-sizing:border-box;font-family:"DM Mono",monospace;}' +
    '.monet-input:focus{border-color:#5ecfb1;}' +
    '.monet-btn{display:inline-block;padding:11px 24px;border-radius:10px;font-weight:700;font-size:14px;cursor:pointer;border:none;margin:5px;transition:all 0.15s;}' +
    '.monet-btn.gold{background:#e8c87a;color:#09090f;}' +
    '.monet-btn.gold:hover{background:#f0d68a;}' +
    '.monet-btn.teal{background:rgba(94,207,177,0.1);color:#5ecfb1;border:1px solid rgba(94,207,177,0.3);}' +
    '.monet-btn.teal:hover{background:rgba(94,207,177,0.2);}' +
    '.monet-btn.ghost{background:transparent;color:#9090a8;border:1px solid #2a2a38;}' +
    '.monet-btn.ghost:hover{border-color:#9090a8;}' +
    '.monet-pay-btn{display:inline-flex;align-items:center;gap:6px;padding:12px 22px;border-radius:10px;font-weight:700;font-size:14px;cursor:pointer;text-decoration:none;border:none;margin:5px;}' +
    '.monet-pay-btn.wise{background:#9FE870;color:#0a2e0a;}' +
    '.monet-pay-btn.wise:hover{background:#b5f590;}' +
    '.monet-msg{font-size:13px;margin-top:10px;min-height:36px;line-height:1.5;}' +
    '.monet-msg.success{color:#5ecfb1;}' +
    '.monet-msg.error{color:#e87a7a;}' +
    '.monet-divider{border:none;border-top:1px solid #2a2a38;margin:18px 0;}' +
    '.monet-step{font-size:11px;color:#9090a8;margin-bottom:10px;line-height:1.6;}' +
    '.monet-step strong{color:#e8e8f0;}' +
    '</style>' +
    '<div class="monet-card">' +
    '<div class="monet-icon">' + (type === 'expire' ? '⏰' : type === 'rappel' ? '🔔' : '🔒') + '</div>' +
    '<div class="monet-title">' + titre + '</div>' +
    '<div class="monet-sub">' + message + '</div>' +
    '<div class="monet-price">29€ <small>/ an</small></div>' +
    '<div class="monet-step">' +
    '<strong>Comment débloquer :</strong><br>' +
    '1. Payez via Wise ci-dessous<br>' +
    '2. Envoyez votre email à <strong>smartlearn.mu@gmail.com</strong><br>' +
    '3. Recevez votre code d\'activation par retour' +
    '</div>' +
    '<a href="' + MONETIZATION.paymentWise + '" target="_blank" class="monet-pay-btn wise" onclick="activerApresPaiement()">💳 Payer 29€ via Wise</a>' +
    '<hr class="monet-divider">' +
    '<input type="text" class="monet-input" id="monet-code-input" placeholder="Entrez votre code d\'accès" maxlength="40">' +
    '<div>' +
    '<button class="monet-btn teal" id="monet-valider-btn">✓ Valider le code</button>' +
    (canClose ? '<button class="monet-btn ghost" id="monet-close">Continuer l\'essai</button>' : '') +
    '</div>' +
    '<div class="monet-msg" id="monet-msg"></div>' +
    '</div>';

  document.body.appendChild(overlay);

  // Valider le code
  var validerBtn = document.getElementById('monet-valider-btn');
  var msgDiv = document.getElementById('monet-msg');
  var codeInput = document.getElementById('monet-code-input');

  if (validerBtn) {
    validerBtn.onclick = function() {
      var code = codeInput ? codeInput.value.trim() : '';
      if (!code) { msgDiv.className = 'monet-msg error'; msgDiv.textContent = 'Veuillez entrer un code.'; return; }
      validerBtn.disabled = true;
      msgDiv.className = 'monet-msg'; msgDiv.textContent = 'Vérification...';
      validerCode(code, function(result) {
        validerBtn.disabled = false;
        if (result.success) {
          msgDiv.className = 'monet-msg success'; msgDiv.textContent = result.message;
          setTimeout(function() { fermerOverlay(); window.location.reload(); }, 1500);
        } else {
          msgDiv.className = 'monet-msg error'; msgDiv.textContent = result.message;
        }
      });
    };
    // Valider aussi sur Entrée
    if (codeInput) {
      codeInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') validerBtn.click(); });
    }
  }

  var closeBtn = document.getElementById('monet-close');
  if (closeBtn) {
    closeBtn.onclick = function() {
      fermerOverlay();
      localStorage.setItem(MONETIZATION.STORAGE_KEYS.overlayDismissed, Date.now().toString());
    };
  }
}

function fermerOverlay() {
  var overlay = document.getElementById('monet-overlay');
  if (overlay) overlay.remove();
}

function afficherBlocageEssaiExpire() { creerOverlayMonetization('expire'); }
function afficherRappelPaiement() { creerOverlayMonetization('rappel', joursRestantsEssai()); }

function activerApresPaiement() {
  localStorage.setItem('brevet_paiement_en_attente', 'true');
}

// ============================================================
// BANNIÈRES
// ============================================================

function creerBanniereEssai() {
  if (document.getElementById('monet-banner') || aAccesPayant()) return;
  if (!estEnEssai()) return;
  var j = joursRestantsEssai();
  var banner = document.createElement('div');
  banner.id = 'monet-banner';
  banner.innerHTML = '<style>' +
    '#monet-banner{position:sticky;top:0;left:0;right:0;background:#e8c87a;color:#09090f;font-family:"DM Sans","Segoe UI",Arial,sans-serif;font-size:13px;padding:8px 20px;z-index:9998;display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;}' +
    '.monet-banner-text{font-weight:600;}' +
    '.monet-banner-btn{padding:4px 14px;border-radius:7px;font-size:12px;font-weight:700;cursor:pointer;border:none;background:#09090f;color:#e8c87a;}' +
    '.monet-banner-btn:hover{background:#1a1a24;}' +
    '</style>' +
    '<span class="monet-banner-text">🆓 Essai gratuit — <strong>J-' + j + '</strong> ' + (j <= 1 ? 'jour restant' : 'jours restants') + '</span>' +
    '<button class="monet-banner-btn" onclick="afficherRappelPaiement()">💳 Débloquer l\'accès (29€/an)</button>' +
    '';
  document.body.insertBefore(banner, document.body.firstChild);
}

function creerBanniereExpire() {
  if (document.getElementById('monet-banner') || aAccesPayant()) return;
  var banner = document.createElement('div');
  banner.id = 'monet-banner';
  banner.innerHTML = '<style>' +
    '#monet-banner{position:sticky;top:0;left:0;right:0;background:#e87a7a;color:#fff;font-family:"DM Sans","Segoe UI",Arial,sans-serif;font-size:13px;padding:8px 20px;z-index:9998;display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;}' +
    '.monet-banner-text{font-weight:600;}' +
    '.monet-banner-btn{padding:4px 14px;border-radius:7px;font-size:12px;font-weight:700;cursor:pointer;border:none;background:#fff;color:#e87a7a;}' +
    '.monet-banner-btn:hover{background:#f0f0f0;}' +
    '</style>' +
    '<span class="monet-banner-text">⚠️ Essai gratuit terminé — Corrections IA bloquées</span>' +
    '<button class="monet-banner-btn" onclick="afficherBlocageEssaiExpire()">💳 Débloquer 29€/an</button>';
  document.body.insertBefore(banner, document.body.firstChild);
}

// ============================================================
// RAPPELS
// ============================================================

function verifierRappel() {
  if (aAccesPayant()) return;
  if (!estEnEssai()) { creerBanniereExpire(); return; }

  var lastReminder = parseInt(localStorage.getItem(MONETIZATION.STORAGE_KEYS.lastReminder) || '0');
  var heuresDepuis = (Date.now() - lastReminder) / (1000 * 60 * 60);
  var dismissed = parseInt(localStorage.getItem(MONETIZATION.STORAGE_KEYS.overlayDismissed) || '0');
  var minutesDepuisFermeture = (Date.now() - dismissed) / (1000 * 60);

  if (minutesDepuisFermeture < 60) return;
  if (heuresDepuis >= MONETIZATION.rappelHeures || !lastReminder) {
    localStorage.setItem(MONETIZATION.STORAGE_KEYS.lastReminder, Date.now().toString());
    afficherRappelPaiement();
  }
}

function verifierAccesAvantAction(actionCallback) {
  if (!aAccesComplet()) {
    if (essaiExpire()) afficherBlocageEssaiExpire();
    else afficherRappelPaiement();
    return false;
  }
  if (actionCallback && typeof actionCallback === 'function') actionCallback();
  return true;
}

// ============================================================
// INITIALISATION
// ============================================================

function initialiserEssai() {
  if (!localStorage.getItem(MONETIZATION.STORAGE_KEYS.trialStart)) {
    localStorage.setItem(MONETIZATION.STORAGE_KEYS.trialStart, Date.now().toString());
  }
}

function initMonetization() {
  initialiserEssai();
  if (aAccesPayant()) return;
  if (estEnEssai()) {
    creerBanniereEssai();
  } else {
    creerBanniereExpire();
    setTimeout(function() { afficherBlocageEssaiExpire(); }, 500);
  }
}

// Exposer globalement
window.estEnEssai = estEnEssai;
window.essaiExpire = essaiExpire;
window.aAccesComplet = aAccesComplet;
window.aAccesPayant = aAccesPayant;
window.joursRestantsEssai = joursRestantsEssai;
window.validerCode = validerCode;
window.verifierCodeLocal = verifierCodeLocal;
window.afficherBlocageEssaiExpire = afficherBlocageEssaiExpire;
window.afficherRappelPaiement = afficherRappelPaiement;
window.fermerOverlay = fermerOverlay;
window.activerApresPaiement = activerApresPaiement;
window.verifierAccesAvantAction = verifierAccesAvantAction;
window.initMonetization = initMonetization;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMonetization);
} else {
  initMonetization();
}
