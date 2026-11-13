# Sanimo — Document d'exigences techniques (TRD)

| | |
|---|---|
| Version | 0.1 (brouillon) |
| Date | 31 octobre 2026 |
| Basé sur | [PRD v0.2](01-PRD.md) · [Synthèse de recherche](../recherche/synthese-recherche.md) |
| Contrainte majeure | Aucun code avant le 27 novembre : ce document décrit l'architecture, il ne contient pas d'implémentation |

Les éléments marqués **[à vérifier]** n'ont pas été confirmés par la recherche ; ils doivent être testés pendant la formation (7–13 novembre).

---

## 1. Principes d'architecture

1. **Hors ligne d'abord.** Tout le parcours tourne sur le téléphone. Le réseau sert seulement à installer, télécharger le pack IA, mettre à jour le contenu et synchroniser des données anonymes.
2. **Sûreté avant intelligence.** Le moteur de règles est déterministe, testé et toujours actif. Les modèles proposent, les règles garantissent un niveau minimal.
3. **Léger par défaut, lourd en option.** L'application de base est minuscule ; le pack IA se télécharge une fois, de façon explicite et reprenable.
4. **Contenu séparé du code.** Questions, règles, textes, audios et annuaire sont des fichiers de données versionnés, préparables avant l'événement.
5. **Données personnelles sur l'appareil.** Audio, photos et texte libre ne quittent jamais le téléphone.
6. **Simple à livrer en 48 h.** Outils connus de l'équipe, peu de services, un seul dépôt.

---

## 2. Vue d'ensemble

```
┌─────────────────────────── Téléphone (PWA) ───────────────────────────┐
│                                                                        │
│  Interface (React)                                                     │
│     │                                                                  │
│     ├── Moteur de triage ── règles.json ──► niveau minimal             │
│     │        ▲                                                         │
│     │        │ symptômes                                               │
│     ├── Worker IA (transformers.js / ONNX Runtime Web, WASM)           │
│     │        ├── Reconnaissance vocale (Whisper)                       │
│     │        └── Compréhension (embeddings + banque de phrases)        │
│     │                                                                  │
│     ├── Lecteur audio ── clips créoles pré-générés                     │
│     ├── IndexedDB : évaluations, photos, file d'envoi, annuaire        │
│     └── Service worker (Workbox) : cache application, contenu, modèles │
│                                                                        │
└──────────────┬─────────────────────────────────────────────────────────┘
               │ seulement quand le réseau est là
   ┌───────────┴─────────────┬──────────────────────────┐
   ▼                         ▼                          ▼
Hébergement statique     Supabase                  Hébergement des modèles
(application, contenu)   (statistiques anonymes,    (Hugging Face Hub ou
                          annuaire, versions)        stockage objet)
```

---

## 3. Choix techniques

| Couche | Choix proposé | Raison | Alternative |
|---|---|---|---|
| Langage | **TypeScript** | Typage du contenu et des règles, moins d'erreurs en 48 h | JavaScript |
| Interface | **React + Vite** | Connu, rapide à démarrer, bon écosystème PWA | Preact (plus léger), Svelte |
| PWA | **vite-plugin-pwa** (Workbox) | Génère le service worker et le manifeste | Workbox CLI directement |
| Style | **Tailwind CSS** | Rapide, sans fichiers CSS à maintenir | CSS simple |
| Stockage local | **IndexedDB via Dexie** **[à vérifier]** | API simple, requêtes, stockage de Blob (photos) | idb-keyval |
| IA sur l'appareil | **transformers.js** (ONNX Runtime Web), backend **WASM**, WebGPU si disponible | Seule voie viable sur Android d'entrée de gamme ; Gemini Nano exclu | ONNX Runtime Web direct |
| Exécution IA | **Web Worker** dédié | Ne bloque pas l'interface pendant l'inférence | — |
| Backend | **Supabase** (Postgres, connexion anonyme, Edge Functions) | Gratuit suffisant, connexion anonyme native, SQL | Firebase, Cloudflare D1 **[à vérifier]** |
| Hébergement | Hébergement statique HTTPS (Vercel, Netlify ou Cloudflare Pages) | HTTPS obligatoire pour l'installation | — |
| Tests | **Vitest** | Tests du moteur de règles et du jeu de cas | Jest |
| i18n | Fichiers JSON `ht.json` / `fr.json` + petite fonction `t()` | Pas de dépendance lourde | i18next |

---

## 4. PWA et hors ligne

### 4.1 Installabilité
Exigences confirmées pour Chrome Android :
- servie en **HTTPS** ;
- manifeste : `name`, `short_name`, `start_url`, `display: "standalone"`, icônes **192 px et 512 px** (dont une `maskable`), `theme_color`, `background_color`, `lang: "ht"` ;
- `prefer_related_applications` absent.

Comportement :
- **Android** : capter `beforeinstallprompt` et afficher un bouton « Enstale Sanimo » après la première interaction.
- **iOS** : pas d'événement ; afficher des instructions (Partager → Sur l'écran d'accueil).

### 4.2 Stratégies de cache (Workbox)

| Ressource | Stratégie | Remarque |
|---|---|---|
| Coquille de l'application (HTML, JS, CSS, icônes, polices) | **Precache** à l'installation du service worker | Hors ligne dès la première visite |
| Contenu (questions, règles, textes, annuaire) | Precache + **Stale-While-Revalidate** | Mise à jour silencieuse au retour du réseau |
| Clips audio | Precache (pack audio) | Petits fichiers, indispensables au parcours vocal |
| Modèles IA | Cache dédié, téléchargement explicite (voir §5.5) | Jamais téléchargés à l'insu de l'utilisateur |
| Appels Supabase | **Network Only** | Les échecs vont dans la file d'envoi |

### 4.3 Persistance du stockage
- Appeler `navigator.storage.persist()` après l'installation ou après le téléchargement du pack IA.
- Afficher l'espace utilisé (`navigator.storage.estimate()`).
- Si la persistance est refusée : prévenir que le système peut effacer le pack en cas de manque d'espace, et savoir le re-télécharger.
- Rappel : sur Chromium, le quota peut aller jusqu'à 60 % de la taille du disque, mais un téléphone presque plein limite l'espace réel.

### 4.4 Synchronisation
- **File d'envoi** (`outbox`) dans IndexedDB.
- Vidée : à l'ouverture de l'application, sur l'événement `online`, et via **Background Sync** quand le navigateur le permet (Chrome/Edge uniquement).
- Envoi idempotent : chaque élément porte un identifiant unique généré sur l'appareil ; le serveur ignore les doublons.

### 4.5 Mise à jour de l'application
- Nouveau service worker détecté → bandeau « Nouvelle version » ; activation au prochain lancement, jamais en plein parcours.

---

## 5. IA sur l'appareil

### 5.1 Pipeline

```
1. Micro ──► audio 16 kHz mono (MediaRecorder + décodage)
2. Whisper (worker) ──► texte créole
3. Normalisation (minuscules, accents, variantes d'orthographe créole)
4. Découpage en segments (phrases, propositions)
5. Embeddings des segments ──► similarité avec la banque de phrases de symptômes
6. Symptômes au-dessus du seuil ──► liste proposée à l'utilisateur
7. Lexique (mots-clés) ──► ajoute les symptômes manqués (union, jamais intersection)
8. Utilisateur confirme ──► moteur de triage (§6)
```

### 5.2 Reconnaissance vocale

| Point | Proposition |
|---|---|
| Modèle | Whisper multilingue, taille *tiny* ou *base*, quantifié, via transformers.js **[à vérifier : présence et qualité du créole haïtien]** |
| Langue forcée | Créole haïtien (pas de détection automatique) |
| Durée maximale | 30 s par enregistrement |
| Repli | Texte transcrit toujours modifiable ; saisie clavier |
| Exclus | ElevenLabs Scribe v2 (pas de créole) ; MMS ASR multilingue (trop lourd pour un téléphone **[à vérifier]**) |

Critère de décision (D1) : sur 20 phrases créoles enregistrées, la transcription doit permettre de retrouver les symptômes dans au moins 80 % des cas, en moins de 5 s sur le téléphone de démo.

### 5.3 Compréhension

**Approche retenue par défaut : embeddings + banque de phrases (sans entraînement).**
- Modèle : `multilingual-e5-small`, version quantifiée int8 (**118 Mo**) **[à vérifier : qualité sur le créole]**.
- **Banque de phrases** : pour chaque symptôme, 10 à 30 formulations en créole et en français (« li pa ka pipi », « l ap fè efò pou pipi », « il n'arrive pas à uriner »…). C'est un jeu de données, préparable avant l'événement.
- Embeddings de la banque **pré-calculés** pendant le hackathon et livrés avec le contenu.
- Score = similarité cosinus maximale entre un segment et les phrases d'un symptôme ; seuil réglé sur le jeu de test.
- Pas de nom de maladie en sortie : seulement des **symptômes** de la liste fermée.

**Alternative (D2) :** classifieur multi-étiquettes affiné sur les descriptions créoles. Plus précis, mais l'entraînement doit se faire pendant l'événement ou être validé par l'organisation (D5).

**Option en ligne (P2) :** une Edge Function appelle un modèle de langue pour extraire les symptômes quand le réseau est là. Le résultat suit le même format et passe par les mêmes règles.

### 5.4 Synthèse vocale
- Les sorties de Sanimo sont **des textes fixes** (questions, niveaux, raisons, consignes, rage). On les **pré-génère en clips audio** au lieu de faire de la synthèse sur le téléphone.
- Volume estimé : 100 à 200 clips, en Opus ou AAC mono 24–32 kbps, soit **environ 3 à 6 Mo**.
- Génération : ElevenLabs si la qualité créole est bonne (vise le prix spécial) **[à vérifier]**, sinon Meta MMS `mms-tts-hat` (licence non commerciale).
- Chaque clip est relu à l'écoute par un locuteur natif.
- Les éléments dynamiques (ex. la liste des symptômes confirmés) sont lus par concaténation de clips.

### 5.5 Pack IA

| Élément | Taille estimée |
|---|---|
| Whisper tiny/base quantifié | ~40 à ~80 Mo **[à vérifier]** |
| multilingual-e5-small int8 | 118 Mo |
| Embeddings pré-calculés de la banque | < 2 Mo |
| Clips audio | 3 à 6 Mo |
| **Total** | **≈ 165 à 205 Mo** |

- Les clips audio font partie de l'application de base (petits, indispensables).
- Les modèles se téléchargent sur demande : écran qui affiche la taille, conseille le Wi-Fi, montre la progression et reprend après une coupure.
- Pendant le téléchargement, l'application fonctionne déjà avec le lexique et la saisie clavier.
- Budget cible à confirmer (D4) selon le coût des données en Haïti. Si trop lourd : n'utiliser que Whisper, ou que les embeddings, et compter sur le lexique pour l'autre partie.

### 5.6 Performance
- Inférence dans un **Web Worker**.
- Modèles chargés une fois, gardés en mémoire pendant la session ; préchauffage pendant que l'utilisateur choisit l'espèce.
- Détection de WebGPU ; sinon WASM avec plusieurs threads si `crossOriginIsolated` est disponible **[à vérifier : en-têtes COOP/COEP chez l'hébergeur]**.
- Mesures sur le téléphone de démo : temps de chargement des modèles, transcription de 15 s d'audio, extraction, mémoire maximale.

---

## 6. Moteur de triage

### 6.1 Données
- `symptomes.json` : liste fermée de symptômes, avec identifiant, espèces concernées, libellés FR/HT, clip audio, et indicateur « signe d'alerte ».
- `questions.json` : questions fermées, chacune liée à un symptôme ou à une information (durée, évolution, morsure), avec conditions d'affichage (espèce, sexe, âge).
- `regles.json` : règles déclaratives `si <conditions> alors niveau = X, raison = Y`, avec version.

### 6.2 Algorithme
1. Entrée : espèce, âge, sexe, symptômes confirmés (issus du modèle et du lexique), réponses.
2. Poser les questions des **signes d'alerte** non encore couverts. Un « oui » donne 🔴 et passe au résultat.
3. « Je ne sais pas » sur un signe d'alerte → règle prudente définie dans `regles.json`.
4. Poser les questions de durée et d'évolution.
5. Évaluer toutes les règles ; niveau des règles = le plus élevé des règles déclenchées.
6. **Niveau final = max(niveau des règles, niveau proposé par le modèle)**.
7. Sortie : niveau, raisons (identifiants de règles), consignes associées, clips audio.

### 6.3 Garanties
- Le moteur est une **fonction pure**, sans réseau ni aléatoire.
- **Tests unitaires** : chaque signe d'alerte, chaque espèce, chaque cas « je ne sais pas ».
- **Jeu de cas** : descriptions avec niveau attendu ; exigence de **100 %** de 🔴 sur les cas d'alerte ; exécuté à chaque modification.
- La version des règles est enregistrée avec chaque évaluation.

---

## 7. Fonctionnalités annexes

### 7.1 Annuaire des vétérinaires
- `veterinaires.json` livré avec l'application ; copie dans Supabase pour les mises à jour.
- Champs : nom, type (clinique, cabinet, service public), département, commune, adresse, téléphone(s), WhatsApp, horaires, urgences 24 h (oui/non/inconnu), date de vérification.
- Liens `tel:` et `https://wa.me/` ; aucune géolocalisation.

### 7.2 Photos
- `<input type="file" accept="image/*" capture="environment">` : appareil photo ou galerie.
- Compression sur l'appareil (canvas) : côté le plus long 1280 px, JPEG qualité ~0,7, soit environ 150 à 300 Ko.
- Stockage en Blob dans IndexedDB, lié à l'évaluation. **Jamais envoyé au serveur.**
- Limite : 3 photos par évaluation.

### 7.3 Fiche pour le vétérinaire
- Vue imprimable et partageable, en français.
- Partage via **Web Share API** avec fichiers (texte + photos) ; repli : copie du texte et capture d'écran.

---

## 8. Backend (résumé, détaillé dans le document 05)

| Élément | Usage |
|---|---|
| Connexion anonyme Supabase | Une identité anonyme par installation, pour l'insertion seulement |
| Table des évaluations anonymes | Espèce, tranche d'âge, symptômes (identifiants), niveau, version des règles, langue, mode (voix/texte), en ligne/hors ligne, date à l'heure près |
| Table de l'annuaire | Source des mises à jour de l'annuaire |
| Table des versions de contenu | Indique à l'application si un nouveau contenu existe |
| Sécurité (RLS) | Insertion seule pour les anonymes ; aucune lecture des évaluations ; lecture publique de l'annuaire et des versions |
| Edge Function (P2) | Proxy vers un modèle de langue en ligne, clé API côté serveur |
| Tableau de bord démo | Requête SQL ou page simple : nombre d'évaluations par niveau |

**Jamais envoyé :** audio, photos, texte libre, nom, numéro de téléphone, position.

Rappel : le projet Supabase gratuit se met en pause après 7 jours d'inactivité. Le réveiller avant la démo. L'application fonctionne sans backend.

---

## 9. Sécurité et confidentialité

- HTTPS partout ; en-têtes de sécurité de base (CSP stricte autorisant seulement l'hébergement des modèles et Supabase).
- Clé Supabase publique (`anon`) seulement dans l'application ; protection par RLS.
- Clés ElevenLabs et modèle de langue : **jamais** dans l'application ; utilisées hors application (génération des clips) ou derrière une Edge Function.
- Bouton « Effacer mes données » : vide IndexedDB et les caches.
- Mentions dans l'application : quelles données restent sur le téléphone, lesquelles sont envoyées, anonymes.

---

## 10. Compatibilité et appareils

| Plateforme | Niveau de prise en charge |
|---|---|
| Chrome Android 12+ | Complet (cible de démo) |
| Chrome Android 8–11 | Complet en WASM, plus lent **[à mesurer]** |
| Samsung Internet | Installation et hors ligne ; IA **[à vérifier]** |
| Safari iOS 17+ | Installation manuelle, hors ligne ; pas de Background Sync ; IA **[à vérifier]** |
| Ordinateur (Chrome) | Utilisé pour le développement et la démo de secours |

**Téléphone de démo :** un Android d'entrée de gamme réel (2–3 Go de RAM), identifié et testé avant le 27 novembre.

---

## 11. Qualité et tests

| Type | Contenu | Outil |
|---|---|---|
| Unitaires | Moteur de triage, normalisation du texte, lexique | Vitest |
| Jeu de cas | Descriptions créoles et françaises, niveau attendu, symptômes attendus | Script Vitest |
| Modèles | Précision de l'extraction, temps d'inférence | Page de diagnostic interne |
| PWA | Installabilité, hors ligne | Lighthouse, mode avion réel |
| Manuel | Parcours de la démo en mode avion, 3 fois de suite | Téléphone de démo |

**Définition de « terminé » pour la démo :**
- 100 % des cas d'alerte en 🔴 ;
- parcours de démo complet en mode avion ;
- installation depuis l'URL déployée ;
- README et liste des outils à jour.

---

## 12. Livrables du hackathon

- **Dépôt de code** : un seul dépôt, structure ci-dessous.
- **Projet déployé** : URL HTTPS publique.
- **README** : problème, démo, installation, architecture, limites, sources cliniques, avertissement.
- **Liste des outils** : frameworks, modèles (avec licences), services, outils d'IA utilisés pendant le développement.

```
sanimo/
├── app/                  # PWA (React + Vite)
│   ├── src/
│   │   ├── triage/       # moteur de règles (fonction pure) + tests
│   │   ├── ai/           # worker, Whisper, embeddings, lexique
│   │   ├── features/     # accueil, description, questions, résultat, annuaire, fiche, rage
│   │   ├── storage/      # Dexie, file d'envoi
│   │   └── i18n/
│   └── public/           # manifeste, icônes
├── content/              # symptomes, questions, regles, consignes, veterinaires, banque de phrases (JSON)
├── audio/                # clips créoles
├── tests/cases/          # jeu de cas
├── supabase/             # schéma, politiques, Edge Functions
└── README.md
```

---

## 13. Travail préparable avant l'événement (sans code)

| Élément | Format | Responsable |
|---|---|---|
| Liste des symptômes et signes d'alerte | Tableur → JSON le jour J | À attribuer |
| Questions et règles de triage | Tableur ou arbre de décision | À attribuer |
| Consignes à faire / à ne pas faire, module rage | Texte FR/HT relu | À attribuer |
| Banque de phrases de symptômes (créole/français) | Tableur | À attribuer |
| Jeu de cas de test | Tableur | À attribuer |
| Annuaire des vétérinaires | Tableur | À attribuer |
| Textes des clips audio | Tableur | À attribuer |
| Résultats des tests de modèles (D1–D4) | Note | À attribuer |

À confirmer avec l'organisation (D5) : génération des clips audio et calcul des embeddings avant l'événement, ou seulement pendant.

---

## 14. Risques techniques

| Risque | Mitigation |
|---|---|
| Whisper mauvais en créole | Test D1 dès la formation ; texte modifiable ; clavier ; lexique |
| Embeddings peu fiables en créole | Banque de phrases riche ; lexique en union ; seuil réglé ; confirmation par l'utilisateur |
| Modèles trop lents ou trop lourds | Tailles plus petites ; un seul modèle ; lexique seul en dernier recours |
| Pas de multithreading WASM (en-têtes COOP/COEP) | Vérifier l'hébergeur ; accepter un seul thread |
| Coupure pendant le téléchargement du pack | Téléchargement par morceaux, reprise, vérification d'intégrité |
| Effacement des données par le système | Demande de persistance ; re-téléchargement possible |
| Réseau du lieu instable le jour J | Tout préparer en local ; démo en mode avion de toute façon |
| Supabase en pause | Réveil avant la démo ; application indépendante du backend |

---

## 15. Décisions ouvertes

| ID | Décision | Date limite |
|---|---|---|
| D1 | Modèle de reconnaissance vocale | 13 nov. |
| D2 | Embeddings ou classifieur affiné | 13 nov. |
| D3 | ElevenLabs ou MMS pour les clips | 13 nov. |
| D4 | Budget maximal du pack IA | 20 nov. |
| D5 | Ce qui peut être préparé avant l'événement (clips, embeddings, entraînement) | 20 nov. |
| D6 | Hébergeur (en-têtes COOP/COEP, fichiers volumineux) | 20 nov. |
| D7 | Dexie ou idb-keyval | Jour J |
