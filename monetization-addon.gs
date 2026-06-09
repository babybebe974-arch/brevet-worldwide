// ============================================================
// ADDON MONÉTISATION — À AJOUTER dans Code.gs existant
// NE PAS MODIFIER les fonctions existantes (doPost, appelerDeepSeek, etc.)
// Ajouter ces fonctions à la FIN du fichier Code.gs
// ============================================================

// === GESTION DES CODES D'ACCÈS ===

// Valider un code envoyé par le HTML
// Appelé via doPost avec action = 'valider_code'
// À ajouter dans doPost AVANT la ligne "return createResponse({ success: false, error: 'Action inconnue'"
//
//    if (action === 'valider_code') {
//      return traiterValidationCode(params);
//    }
//

function traiterValidationCode(params) {
  var code = (params.code || '').toString().trim();
  var userId = params.userId || 'anonymous';
  var source = params.source || '';

  if (!code) {
    return createResponse({ success: false, error: 'Code manquant' });
  }

  try {
    var sheet = getOrCreateCodesSheet();
    var data = sheet.getDataRange().getValues();

    for (var i = 1; i < data.length; i++) {
      var codeSheet = (data[i][0] || '').toString().trim();
      var estUtilise = data[i][3]; // colonne Utilise

      if (codeSheet === code) {
        // Marquer comme utilisé + enregistrer userId
        sheet.getRange(i + 1, 4).setValue(true);
        sheet.getRange(i + 1, 5).setValue(new Date().toISOString());
        sheet.getRange(i + 1, 6).setValue(userId);

        console.log('Code valide: ' + code + ' — userId: ' + userId);

        return createResponse({
          success: true,
          message: 'Code valide ! Accès complet débloqué.',
          email: data[i][1] || ''
        });
      }
    }

    // Code non trouvé
    console.log('Code invalide: ' + code);
    return createResponse({ success: false, error: 'Code invalide ou déjà utilisé.' });

  } catch (err) {
    console.error('Erreur validation code:', err);
    return createResponse({ success: false, error: 'Erreur serveur: ' + err.toString() });
  }
}

// Créer ou récupérer la feuille Codes
function getOrCreateCodesSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Codes');
  if (!sheet) {
    sheet = ss.insertSheet('Codes');
    sheet.getRange(1, 1, 1, 7).setValues([[
      'Code', 'Email', 'DateCreation', 'Utilise', 'DateUtilisation', 'UserId', 'Notes'
    ]]);
    // Formatage en-têtes
    sheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#1a1a2e').setFontColor('#ffffff');
    sheet.setColumnWidth(1, 180);
    sheet.setColumnWidth(2, 220);
    sheet.setColumnWidth(3, 160);
    console.log('Feuille Codes créée');
  }
  return sheet;
}

// ============================================================
// FONCTION ADMIN : Générer un code pour un email
// Utilisation : dans Apps Script, sélectionner generateCode
// et modifier l'email en paramètre, puis Exécuter
// ============================================================

function generateCode() {
  // ← MODIFIER L'EMAIL ICI AVANT D'EXÉCUTER
  var email = 'email@exemple.com';
  var notes = ''; // optionnel : nom de l'élève, commentaire

  var code = _genererCode();
  var sheet = getOrCreateCodesSheet();

  sheet.appendRow([code, email, new Date().toISOString(), false, '', '', notes]);

  console.log('=====================================');
  console.log('✅ Code généré pour : ' + email);
  console.log('🔑 Code : ' + code);
  console.log('=====================================');

  return { code: code, email: email };
}

// Générer plusieurs codes d'un coup (pour lot)
function generateCodesPourListe() {
  // ← MODIFIER LA LISTE ICI
  var emails = [
    'eleve1@gmail.com',
    'eleve2@gmail.com',
    'eleve3@gmail.com'
  ];

  var resultats = [];
  for (var i = 0; i < emails.length; i++) {
    var code = _genererCode();
    var sheet = getOrCreateCodesSheet();
    sheet.appendRow([code, emails[i], new Date().toISOString(), false, '', '', '']);
    resultats.push({ email: emails[i], code: code });
    console.log(emails[i] + ' → ' + code);
  }
  return resultats;
}

// Générateur de code 8 caractères alphanum (sans ambiguïtés 0/O, I/l)
function _genererCode() {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var code = '';
  for (var i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ============================================================
// TABLEAU DE BORD ADMIN : voir tous les codes
// ============================================================

function voirTousCodes() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Codes');
  if (!sheet) { console.log('Aucune feuille Codes'); return; }

  var data = sheet.getDataRange().getValues();
  var actifs = 0, utilises = 0;

  console.log('\n=== CODES D\'ACCÈS ===');
  for (var i = 1; i < data.length; i++) {
    var code = data[i][0], email = data[i][1], utilise = data[i][3];
    if (utilise) {
      utilises++;
      console.log('✓ UTILISÉ  | ' + code + ' | ' + email + ' | ' + (data[i][4] || ''));
    } else {
      actifs++;
      console.log('○ ACTIF    | ' + code + ' | ' + email);
    }
  }
  console.log('\nActifs: ' + actifs + ' | Utilisés: ' + utilises + ' | Total: ' + (actifs + utilises));
}

// ============================================================
// MODIFICATION À FAIRE DANS doPost EXISTANT :
// Ajouter AVANT la dernière ligne "return createResponse({ success: false, error: 'Action inconnue'"
//
//   if (action === 'valider_code') {
//     return traiterValidationCode(params);
//   }
//
// ============================================================
