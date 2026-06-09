function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  sheet.appendRow([
    new Date(),           // A : date/heure
    data.userId,          // B : identifiant unique utilisateur
    data.action,          // C : trial_start / correction_ia / oral_session
    data.matiere,         // D : francais, maths, histoire, sciences, oral
    data.type,            // E : question, dictee, redaction, expose_question, culture_question
    data.estPayant,       // F : true/false
    data.note             // G : note (si disponible)
  ]);
  
  return ContentService.createTextOutput("OK");
}

function doGet() {
  return ContentService.createTextOutput("Tracker OK");
}