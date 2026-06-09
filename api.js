// ============================================================
// SMART LEARN — API DEEPSEEK CENTRALISÉE
// Remplace tous les appels Claude par DeepSeek
// ============================================================

const DEEPSEEK_CONFIG = {
  // ⚠️ REMPLACEZ PAR VOTRE CLÉ API DEEPSEEK
  apiKey: 'sk-REMPLACEZ_PAR_VOTRE_CLE_API_DEEPSEEK',

  // URL de l'API DeepSeek (endpoint direct)
  apiUrl: 'https://api.deepseek.com/chat/completions',

  // Modèle DeepSeek
  model: 'deepseek-chat',

  // Timeout en ms
  timeoutMs: 45000,

  // Proxy local de secours (Node.js) — décommentez si CORS bloque
  // fallbackProxy: 'http://localhost:3000/deepseek',
  fallbackProxy: null
};

// ============================================================
// FONCTION callIA — appel direct à DeepSeek
// Format compatible avec l'existant : callIA(prompt, system) → string
// ============================================================
async function callIA(prompt, system) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('⏱ Timeout (45s) — réessaie dans quelques secondes.')), DEEPSEEK_CONFIG.timeoutMs)
  );

  // Tentative 1 : appel direct DeepSeek
  const directCall = _callDeepSeekDirect(prompt, system);

  // Si fallback proxy configuré, tentative 2
  const request = DEEPSEEK_CONFIG.fallbackProxy
    ? directCall.catch(() => _callDeepSeekProxy(prompt, system))
    : directCall;

  return Promise.race([request, timeout]);
}

async function _callDeepSeekDirect(prompt, system) {
  const r = await fetch(DEEPSEEK_CONFIG.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + DEEPSEEK_CONFIG.apiKey
    },
    body: JSON.stringify({
      model: DEEPSEEK_CONFIG.model,
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

async function _callDeepSeekProxy(prompt, system) {
  const r = await fetch(DEEPSEEK_CONFIG.fallbackProxy, {
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
async function testAPI() {
  console.log('🧪 Test API DeepSeek...');
  try {
    const result = await callIA('Dis "OK" en français.', 'Tu réponds uniquement par "OK".');
    console.log('✅ API DeepSeek OK :', result.substring(0, 100));
    return true;
  } catch (e) {
    console.error('❌ API DeepSeek échec :', e.message);
    return false;
  }
}

// ============================================================
// INITIALISATION AU CHARGEMENT
// ============================================================
(function() {
  console.log('🚀 api.js chargé — DeepSeek ' + DEEPSEEK_CONFIG.model);
  console.log('🔑 Clé API :', DEEPSEEK_CONFIG.apiKey.substring(0, 10) + '...');
  console.log('🌐 Endpoint :', DEEPSEEK_CONFIG.apiUrl);
  if (DEEPSEEK_CONFIG.fallbackProxy) {
    console.log('🔄 Fallback proxy :', DEEPSEEK_CONFIG.fallbackProxy);
  }
})();
