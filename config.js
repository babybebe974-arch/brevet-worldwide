// ============================================================
// SMART LEARN — CONFIGURATION CENTRALISÉE
// API DeepSeek (remplace Claude)
// ============================================================

const APP_CONFIG = {
  // ⚠️ REMPLACEZ PAR VOTRE CLÉ API DEEPSEEK
  deepseekApiKey: 'sk-REMPLACEZ_PAR_VOTRE_CLE_API_DEEPSEEK',

  // URL de l'API DeepSeek
  deepseekUrl: 'https://api.deepseek.com/chat/completions',

  // Modèle
  deepseekModel: 'deepseek-chat',

  // Proxy local de secours (Node.js — décommentez si CORS bloque)
  // fallbackProxy: 'http://localhost:3000/deepseek',
  fallbackProxy: null,

  // URL du tracker Google Sheets
  trackerUrl: 'https://script.google.com/macros/s/AKfycbzgTq0ugkc_Qc40X6592abGBNr7YO5JoBulIblLnS8TMkOjQEeiTsCTF7wmwnqyU9FI/exec',
  
  // Temps maximum d'attente pour l'IA (millisecondes)
  timeoutMs: 45000,
  
  // Version du projet
  version: '3.0.0',
  
  // Nom de l'application
  appName: 'SMART LEARN'
};

// ============================================================
// FONCTION IA CENTRALISÉE — DeepSeek direct
// ============================================================
async function callIA(prompt, system) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('⏱ Timeout 45s — réessaie dans quelques secondes.')), APP_CONFIG.timeoutMs)
  );

  // Appel direct DeepSeek
  const directCall = _callDeepSeek(prompt, system);

  // Fallback proxy si configuré
  const request = APP_CONFIG.fallbackProxy
    ? directCall.catch(() => _callProxy(prompt, system))
    : directCall;
  
  return Promise.race([request, timeout]);
}

async function _callDeepSeek(prompt, system) {
  const r = await fetch(APP_CONFIG.deepseekUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + APP_CONFIG.deepseekApiKey
    },
    body: JSON.stringify({
      model: APP_CONFIG.deepseekModel,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2048
    })
  });

  if (!r.ok) {
    const errData = await r.json().catch(() => ({}));
    throw new Error('DeepSeek HTTP ' + r.status + ': ' + (errData.error?.message || r.statusText));
  }

  const data = await r.json();
  if (data.choices && data.choices[0] && data.choices[0].message) {
    return data.choices[0].message.content;
  }
  throw new Error('Réponse DeepSeek inattendue');
}

async function _callProxy(prompt, system) {
  const r = await fetch(APP_CONFIG.fallbackProxy, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, system })
  });

  if (!r.ok) throw new Error('Proxy HTTP ' + r.status);
  const d = await r.json();
  if (d.success && d.content) return d.content;
  throw new Error(d.error || 'Réponse proxy inattendue');
}

// ============================================================
// FONCTION DE TEST
// ============================================================
async function testConfig() {
  console.log('✅ config.js chargé');
  console.log('📦 Version:', APP_CONFIG.version);
  console.log('🤖 Modèle:', APP_CONFIG.deepseekModel);
  console.log('🌐 API:', APP_CONFIG.deepseekUrl);
  
  try {
    const test = await callIA('Dis "OK"', 'Tu réponds uniquement par OK');
    console.log('🤖 Test API:', test);
  } catch(e) {
    console.warn('⚠️ Test API échoué:', e.message);
  }
}

// Auto-exécution du test si la page est ouverte directement
if (typeof window !== 'undefined' && window.location.pathname.includes('config')) {
  testConfig();
}
