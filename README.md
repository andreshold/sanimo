# Sanimo

Assistant vétérinaire hors ligne, en créole, pour les propriétaires de chiens et de chats en Haïti.
Application Android (Expo SDK 58 / React Native, *development build*) avec trois modèles d'IA embarqués : Oswald (voix → texte), Makandal (compréhension), Fatiman (texte → voix).

> Sanimo ne remplace pas un vétérinaire. Il ne nomme aucune maladie et ne donne aucun médicament.

## Documentation

- [Plan de construction](PLAN-SANIMO.md) — produit, architecture, calendrier, rôles
- [Feuille de route D1 · Application](docs/09-Feuille-de-route-D1-Application.md)
- [App flow](docs/03-App-flow.md) · [TRD](docs/02-TRD.md) · [Données](content-sources/LISEZMOI.md)

## Installation (Windows)

Prérequis : Node 24+, Git, Android Studio (SDK 36), un téléphone Android en débogage USB.

```powershell
$env:RNLLAMA_SKIP_POSTINSTALL = '1'   # évite de télécharger les binaires iOS de llama.rn
& .\tools\setup-windows.ps1            # npm install + NDK/CMake (reprenable)
node tools/llama-android-artifacts.js  # binaires Android de llama.rn (reprenable, SHA-256 vérifié)
```

## Commandes

```bash
npx expo run:android      # build de développement + installation sur le téléphone branché
npx expo start            # serveur de développement (après le premier build)
npx tsc --noEmit          # vérification des types
npx expo lint             # lint
npm test                  # tests Jest (moteur de triage)
npm run content           # content-sources/*.csv → content/*.json (vérifie le contenu)
```

Écran caché de banc d'essai IA (mode dev) : `/dev/bench`, accessible depuis l'accueil.

## Arborescence

```
src/app/        écrans (Expo Router)
src/ai/         contrat et modules IA (D2)
src/triage/     moteur de règles (D3)
src/ui/         thème et composants (charte Sanimo)
src/i18n/       textes ht / fr
content/        contenu validé (JSON)
content-sources/ tableurs sources (CSV) → content/ (JSON généré)
tools/          scripts d'installation et banc d'essai
```
