const TRACKER_URL = 'https://script.google.com/macros/s/AKfycbxDHkyI8wlinBQ1BRIsg7dcz4AYWbY87SY5UDr6KVu4uHylWQs4fLfdd3a98PEwdL-A/exec';

function getUserId() {
  let id = localStorage.getItem('app_user_id');
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : 'user_' + Date.now() + '_' + Math.random();
    localStorage.setItem('app_user_id', id);
  }
  return id;
}

function isPaid() {
  return localStorage.getItem('code_valide') === 'true';
}

function trackAction(action, matiere, type, note) {
  fetch(TRACKER_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify({
      userId: getUserId(),
      action: action,
      matiere: matiere,
      type: type,
      estPayant: isPaid(),
      note: note || ''
    })
  }).catch(e => console.warn('tracker failed', e));
}

// Première visite : tracer le début de l'essai
if (!localStorage.getItem('trial_started')) {
  trackAction('trial_start', '', '', '');
  localStorage.setItem('trial_started', 'true');
}