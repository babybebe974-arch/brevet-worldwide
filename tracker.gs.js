// ============================================================
// SMART LEARN — TRACKER v4.0
// Envoie les stats au proxy Apps Script via URLSearchParams
// ============================================================

(function() {
  var PROXY = 'https://script.google.com/macros/s/AKfycbxxQCRDZvKAb9fuXkDslK7LYMXjcIrIi-_EpA8DWT1-tTelSpYcMxPkiSPG5bKheLTY/exec';

  function track(action, data) {
    try {
      var payload = Object.assign({
        action:    action,
        userId:    localStorage.getItem('user_id') || 'anon',
        sessionId: sessionStorage.getItem('session_id') || 'sess',
        source:    document.title || window.location.pathname,
        timestamp: new Date().toISOString(),
        estPayant: localStorage.getItem('brevet_paid') === 'true'
      }, data || {});

      fetch(PROXY, {
        method: 'POST',
        body: new URLSearchParams({ data: JSON.stringify(payload) })
      }).catch(function() {}); // silencieux
    } catch(e) {}
  }

  // Tracker page view
  track('page_view', { page: window.location.pathname });

  // Exposer globalement
  window.track = track;
})();
