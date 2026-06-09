# SMART LEARN - Tracker & Configuration

Ce dépôt contient les scripts de tracking et de configuration pour l'application SMART LEARN.

## Fichiers

- `tracker.js` : script à inclure dans les pages HTML pour envoyer les statistiques
- `config.js` : configuration centralisée (API, tracker)
- `apps-script/Code.gs` : script Google Apps Script à déployer
- `admin/index.html` : panel d'administration pour générer des codes d'accès

## Installation

1. Copier `tracker.js` et `config.js` dans la racine du site
2. Déployer `apps-script/Code.gs` comme Web App dans Google Sheets
3. Mettre à jour l'URL dans `tracker.js` et `config.js`