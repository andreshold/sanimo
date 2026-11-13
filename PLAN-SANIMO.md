# Sanimo — Plan de construction

| | |
|---|---|
| Version | 1.0 |
| Date | 12 novembre 2026 |
| Équipe | 3 développeurs : **D1** Application, **D2** IA, **D3** Triage et contenu |
| Événement | Hackathon Ayiti AI, **6 heures**, supposé le **vendredi 27 novembre 2026** (date et heure à confirmer) |
| Règle | Tout le code est écrit **avant** l'événement. Le jour J sert aux corrections, à la soumission et à la démo |
| Temps disponible | 15 jours : jeudi 12 → jeudi 26 novembre |

Ce document se suffit à lui-même : il décrit ce que Sanimo fera, comment il est construit, qui fait quoi et quand.

---

## 1. Le produit

### 1.1 En une phrase
Sanimo aide un propriétaire de **chien ou de chat** en Haïti à savoir **quoi faire, et à quelle vitesse**, quand son animal semble malade. Il **raconte la situation à voix haute en créole**, **sans Internet**, et reçoit un niveau d'urgence, des consignes lues à voix haute et les vétérinaires proches.

### 1.2 Les trois niveaux
| Niveau | Créole | Signification |
|---|---|---|
| 🔴 | **Ijans** | Aller chez un vétérinaire maintenant |
| 🟠 | **Konsilte** | Voir un vétérinaire dans les 24 à 48 h |
| 🟢 | **Siveye** | Surveiller à la maison, avec les signes qui doivent faire changer d'avis |

### 1.3 Ce que Sanimo ne fait jamais
- Il ne **nomme aucune maladie** (pas de diagnostic).
- Il ne donne **aucun médicament ni aucune dose**.
- Il ne laisse **jamais l'IA seule décider du niveau** : des règles écrites et testées garantissent qu'un signe d'alerte donne toujours 🔴.

### 1.4 Fonctionnalités

| Priorité | Fonctionnalité |
|---|---|
| **P0** (indispensable à la démo) | Choix de la langue (Kreyòl par défaut, Français) · avertissement lu à voix haute · description **orale** ou écrite · symptômes détectés et confirmés par l'utilisateur · questions oui/non sur les signes d'alerte manquants · niveau d'urgence par les règles · consignes à faire / à ne pas faire **lues en créole** · bouton **« Ijans kounye a »** toujours visible · module **rage et morsure** · module **toxiques et médicaments humains** · fonctionnement complet **en mode avion** · téléchargement des modèles avec progression et reprise |
| **P1** (important) | Récapitulatif reformulé par l'IA (« Ou di m… se sa ? ») · annuaire des vétérinaires par commune, avec appel et WhatsApp en un toucher · fiche pour le vétérinaire avec photo, partageable · historique des évaluations sur le téléphone · bouton « Effacer mes données » |
| **P2** (si le temps le permet) | Statistiques anonymes envoyées quand le réseau revient · version web de secours au clavier · choix de la voix |
| **Hors périmètre** | Diagnostic, posologie, analyse de photo par IA, comptes utilisateurs, paiement, iPhone, animaux d'élevage (extension prévue en 2027) |

---

## 2. Architecture

### 2.1 Choix principaux

| Sujet | Choix | Pourquoi |
|---|---|---|
| Type d'application | **Application Android** construite avec **Expo / React Native** (*development build*), en TypeScript | Les modèles créoles tournent bien en natif et mal dans un navigateur ; l'équipe connaît React |
| Reconnaissance vocale | **Oswald** (Qwen3-ASR 0.6B affiné sur le créole, GGUF Q4_K_M + projecteur audio, ~690 Mo, Apache-2.0) | 9,8 % d'erreur de mots publiée, 5,7 % sur la santé |
| Compréhension et reformulation | **Makandal** (Gemma 3 1B affiné sur le créole, GGUF Q4_K_M, ~806 Mo, licence Gemma) en **appel d'outil** | Sait appeler des outils (93 % publiés) ; on lui donne l'outil `signaler_symptomes` |
| Synthèse vocale | **Fatiman** (Pocket TTS affiné sur le créole, ONNX, ~240 Mo, CC-BY-4.0) | Prononciation créole très bonne ; fonctionne sur un Galaxy A16 |
| Moteur d'inférence | `llama.rn` (llama.cpp) pour Oswald et Makandal · `onnxruntime-react-native` pour Fatiman | Ce que font les auteurs des modèles dans leur appli Android. **La prise en charge de l'audio d'Oswald par `llama.rn` est à vérifier dès le jour 1** |
| Repli sans IA | **Lexique** de mots-clés créole/français, toujours actif | Le parcours marche même sans modèle chargé |
| Niveau d'urgence | **Moteur de règles** en TypeScript pur, testé | Sûreté et traçabilité |
| Stockage | `expo-sqlite` (évaluations, historique) · `expo-file-system` (modèles, photos) | Hors ligne, robuste |
| Navigation | Expo Router | Standard Expo |
| Tests | Jest (moteur de règles, lexique, jeu de cas) | Rapide, sans téléphone |
| Distribution | **APK** via EAS Build ou build local ; démo sur téléphone préinstallé | Pas besoin du Play Store pour le hackathon |
| Backend | Aucun obligatoire. Supabase en P2 pour les statistiques anonymes | L'application ne dépend d'aucun serveur |

### 2.2 Schéma

```
┌──────────────────────────── Téléphone Android (hors ligne) ────────────────────────────┐
│                                                                                         │
│  Écrans (Expo Router, React Native)                                                     │
│     │                                                                                   │
│     ▼                                                                                   │
│  Orchestrateur de session ─────────────────────────────────────────────┐                │
│     │ 1. micro → WAV 16 kHz                                            │                │
│     ▼                                                                  │                │
│  [Oswald] voix → texte créole ──► texte affiché, corrigeable           │                │
│     │                                                                  │                │
│     ▼ 2.                                                               │                │
│  [Makandal] texte → appel d'outil signaler_symptomes([ids]) ──┐        │                │
│  [Lexique]  texte → ids trouvés par mots-clés ────────────────┴► UNION │                │
│     │                                                                  │                │
│     ▼ 3. l'utilisateur confirme ou corrige les symptômes               │                │
│  [Moteur de règles] → questions oui/non manquantes → niveau + raisons  │                │
│     │                                                                  │                │
│     ▼ 4.                                                               │                │
│  Résultat + consignes validées ──► [Fatiman] voix  ou  clip pré-généré │                │
│                                                                        │                │
│  SQLite : évaluations, historique, réglages · Fichiers : modèles, photos, clips          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
        │ seulement au premier lancement (Wi-Fi conseillé)
        ▼
  Hugging Face : téléchargement des modèles (≈ 1,7 Go en tout, par modules)
```

### 2.3 Gestion de la mémoire
Les trois modèles ensemble ne tiennent pas sur un téléphone d'entrée de gamme. Ils sont **chargés l'un après l'autre** :

| Étape | Modèle en mémoire |
|---|---|
| L'utilisateur parle | Oswald |
| Compréhension, récapitulatif | Makandal (Oswald libéré) |
| Réponse lue | Fatiman (Makandal libéré) ; clips pré-générés pour les messages critiques, qui ne demandent aucun modèle |

Téléphone de démo : Android avec **4 Go de RAM ou plus**. On mesure aussi sur un téléphone de 3 Go pour le dire honnêtement dans le pitch.

### 2.4 Règles de sûreté de l'IA
1. Makandal ne renvoie que des **identifiants** pris dans la liste fermée des symptômes. Tout identifiant inconnu est ignoré.
2. Les symptômes trouvés par Makandal et par le lexique sont **réunis** (jamais d'intersection), puis **montrés à l'utilisateur, qui confirme**.
3. Le **niveau final** = le plus élevé entre les règles et une éventuelle proposition du modèle. Le modèle peut relever le niveau, **jamais l'abaisser**.
4. Les **consignes médicales** sont des textes écrits à l'avance et validés. Makandal ne les réécrit pas.
5. Makandal ne sert à reformuler que le **récapitulatif** de ce que l'utilisateur a dit, et ce texte s'affiche à l'écran.
6. Si un modèle échoue, est absent ou trop lent, on passe **sans bruit** au lexique et au clavier.

### 2.5 Structure du dépôt

```
sanimo/
├── app/                      # écrans (Expo Router)
│   ├── (onboarding)/         # langue, avertissement, pack IA
│   ├── (triage)/             # espèce, description, symptômes, questions, résultat
│   ├── ijans.tsx             # bouton urgence
│   ├── rage.tsx · toxiques.tsx · veterinaires.tsx · fiche.tsx · istwa.tsx · reglaj.tsx
├── src/
│   ├── triage/               # moteur de règles (fonctions pures) + tests
│   ├── ai/                   # oswald.ts, makandal.ts, fatiman.ts, lexique.ts, orchestrateur.ts, telechargement.ts
│   ├── audio/                # enregistrement, lecteur de clips
│   ├── storage/              # SQLite, fichiers
│   ├── i18n/                 # ht.json, fr.json
│   └── ui/                   # composants et thème
├── content/                  # symptomes, questions, regles, consignes, toxiques, veterinaires, lexique (JSON)
├── content-sources/          # tableurs sources (CSV) + script de conversion → content/
├── assets/clips/             # clips audio créoles pré-générés
├── tests/cas/                # jeu de cas (récits + niveau attendu)
├── tools/bench/              # banc d'essai des modèles
└── README.md
```

---

## 3. Le contenu

L'IA comprend ; le **contenu** décide de ce que Sanimo dit. Il est préparé en tableurs, relu, puis converti en JSON.

| Fichier | Contenu | Volume visé | Relecture |
|---|---|---|---|
| `symptomes` | Liste fermée : id, espèces, libellés HT/FR, signe d'alerte oui/non, niveau minimal | 40 à 50 | Vétérinaire |
| `questions` | Questions oui/non liées aux symptômes, conditions (espèce, sexe, âge), texte HT/FR | 30 à 40 | Vétérinaire + locuteur |
| `regles` | Règles « si … alors niveau = X, raison = Y », dont les règles de durée | 40 à 60 | Vétérinaire |
| `consignes` | À faire / à ne pas faire par situation (urgence, plaie, chaleur, convulsions, toxiques, rage) | 30 à 50 | Vétérinaire + locuteur |
| `toxiques` | Aliments, médicaments humains, produits, plantes ; message HT/FR | 20 à 30 | Vétérinaire (ajouter les toxiques locaux) |
| `lexique` | Mots et expressions par symptôme, avec variantes d'orthographe | ≥ 5 par symptôme | Locuteur |
| `cas` | Récits complets en créole et en français, avec symptômes et niveau attendus, dont des pièges | 75 à 100 | Vétérinaire (niveaux) |
| `veterinaires` | Nom, commune, téléphone, WhatsApp, horaires, urgences 24 h, date de vérification | ≥ 15 | Appels de vérification |
| `clips` | Textes des messages fixes à pré-générer en audio | 80 à 150 | Écoute par un locuteur |

**Sources :** Merck Veterinary Manual, Cornell, ASPCA, OMS et CDC (rage), bibliothèque VetClaw (MIT) pour la structure clinique, liste d'aliments toxiques can-my-dog-eat (MIT), corpus médical créole de CMU (vocabulaire). Chaque ligne indique sa source et son statut : `brouillon` → `relu` → `validé`. **Seul le contenu `validé` est montré dans la démo** ; à défaut, la démo l'annonce comme « en cours de validation ».

**Pièges de langue à traiter :** « san » veut dire *sang* et *sans* · les négations (« li pa vomi ») · les variantes d'orthographe (*lap* / *l ap*, *chen* / *chyen*, *je* / *zye*).

---

## 4. Les écrans

| Code | Écran | Contenu | Priorité |
|---|---|---|---|
| E01 | Langue | Kreyòl / Français | P0 |
| E02 | Avertissement | « Sanimo pa ranplase yon veterinè », lu à voix haute, accepté une fois | P0 |
| E03 | Pack IA | Taille, conseil Wi-Fi, progression, reprise, « continuer sans IA » | P0 |
| E10 | Accueil | Gros bouton « Kòmanse », bouton rouge « Ijans kounye a », accès rage et toxiques | P0 |
| E11 | Ijans kounye a | Signes d'urgence, gestes immédiats, vétérinaires | P0 |
| E20 | Animal | Chien / chat, âge (chiot, adulte, âgé), sexe pour le chat | P0 |
| E21 | Description | Gros bouton micro (30 s max), texte transcrit modifiable, clavier | P0 |
| E22 | Symptômes détectés | Liste à cocher, ajout manuel, récapitulatif reformulé lu à voix haute | P0 (récapitulatif P1) |
| E23 | Questions | Une question par écran, oui / non / m pa konnen, lue à voix haute | P0 |
| E30 | Résultat | Niveau en couleur, raisons, bouton écouter | P0 |
| E31 | Consignes | À faire / à ne pas faire, signes qui doivent faire changer d'avis | P0 |
| E40 | Rage et morsure | Gestes pour la personne mordue, signes chez l'animal, centre de santé | P0 |
| E41 | Toxiques | Liste par catégorie, « pa janm bay medikaman moun » | P0 |
| E50 | Vétérinaires | Par commune, appel et WhatsApp | P1 |
| E60 | Fiche vétérinaire | Résumé en français + photo, partage | P1 |
| E70 | Historique | Évaluations passées | P1 |
| E80 | Réglages | Langue, voix, effacer mes données, sources et licences | P1 |

---

## 5. Les rôles

| Rôle | Responsabilités | Livrables |
|---|---|---|
| **D1 — Application** | Projet Expo, development build, navigation, écrans, thème, i18n, SQLite, téléchargement des modèles, micro et lecteur audio, annuaire, fiche et photo, historique, build APK, téléphone de démo | APK installable, tous les écrans |
| **D2 — IA** | Banc d'essai sur téléphone, intégration d'Oswald, Makandal et Fatiman, outil `signaler_symptomes` et prompt, chargement / libération des modèles, mesures de vitesse et de mémoire, replis, génération des clips | Module `src/ai/` fiable, rapport de mesures |
| **D3 — Triage et contenu** | Tableurs de contenu, conversion en JSON, moteur de règles et tests, lexique, jeu de cas, contenus rage et toxiques, coordination avec le vétérinaire et le locuteur natif, README, pitch | `src/triage/` testé, `content/` validé, pitch |

**Personnes extérieures à mobiliser dès cette semaine :** un **vétérinaire** en Haïti (règles, niveaux, toxiques locaux, annuaire), un ou deux **locuteurs natifs** (relecture du créole, enregistrement des cas de test), l'**auteur des modèles Trio** (aide pour Android, mesures).

**Rituels :** point de 15 min chaque soir (fait / bloqué / demain) ; branche `main` toujours installable ; une branche par tâche ; revue par un autre développeur avant fusion ; le jeu de cas tourne à chaque fusion qui touche le triage ou l'IA.

---

## 6. Calendrier détaillé

### Phase 0 — Fondations et décisions (jeu. 12 → sam. 14 nov.)

| Jour | D1 Application | D2 IA | D3 Triage et contenu |
|---|---|---|---|
| **Jeu. 12** | Dépôt GitHub, `create-expo-app`, TypeScript, Expo Router, ESLint ; choix du téléphone de démo (≥ 4 Go) et d'un téléphone de 3 Go | Télécharger les 3 modèles ; écrire à l'auteur des modèles | Liste fermée des symptômes v1 ; contacter vétérinaire et locuteurs |
| **Ven. 13** | Development build avec `llama.rn` et `onnxruntime-react-native` ; APK installé sur le téléphone | **Banc d'essai** : Makandal (texte → outil) et Fatiman (texte → audio) dans l'APK de test ; temps et mémoire | Règles v1 (signes d'alerte) ; jeu de cas v1 (40 récits) |
| **Sam. 14** | Navigation et écrans vides E01 → E31 ; thème ; i18n HT/FR | **Oswald** sur téléphone (audio via `llama.rn`, sinon autre voie) ; 20 cas lus à voix haute ; rapport de mesures | Moteur de règles : types, premiers tests Jest |

**Décisions du samedi 14 au soir** (à 3, 30 min) :

| ID | Décision | Critère |
|---|---|---|
| A1 | Oswald sur le téléphone | ≥ 80 % des symptômes retrouvables dans les transcriptions, < 5 s pour 15 s d'audio |
| A2 | Makandal pour la compréhension | ≥ 80 % des symptômes trouvés sur le jeu de cas, < 8 s par description |
| A3 | Fatiman en direct ou clips seulement | Premier son < 3 s, lecture fluide |
| A4 | Taille du pack et ordre de téléchargement | Mesures réelles |

### Phase 1 — Le cœur, hors ligne au clavier (dim. 15 → mer. 18 nov.)

| Jour | D1 Application | D2 IA | D3 Triage et contenu |
|---|---|---|---|
| **Dim. 15** | E01, E02, E10, E20 fonctionnels ; SQLite (réglages, évaluations) | Module `makandal.ts` : chargement, prompt système, outil `signaler_symptomes`, validation des ids | Moteur : niveau minimal, questions manquantes, règles de durée ; tests |
| **Lun. 16** | E21 au clavier, E22 (cases à cocher), E23 | `lexique.ts` : normalisation (accents, *lap*, négations, « san ») ; union avec Makandal | Questions, consignes et toxiques v1 en tableur → JSON ; script de conversion |
| **Mar. 17** | E30, E31 branchés sur le moteur ; E11 Ijans | Orchestrateur : texte → symptômes → moteur ; repli si Makandal absent | Jeu de cas complet (75+) ; test automatique « 100 % des alertes en 🔴 » |
| **Mer. 18** | E40 rage, E41 toxiques ; corrections | Mesure de précision sur tout le jeu de cas ; ajustement du prompt | Corrections des règles ; envoi du contenu au vétérinaire |

**Jalon J1 (mer. 18 au soir) :** parcours complet **au clavier**, en **mode avion**, sur le téléphone de démo, avec Makandal ou le lexique. Tests verts.

### Phase 2 — La voix de bout en bout (jeu. 19 → dim. 22 nov.)

| Jour | D1 Application | D2 IA | D3 Triage et contenu |
|---|---|---|---|
| **Jeu. 19** | Enregistrement micro (WAV 16 kHz, 30 s max), gros bouton, animation d'écoute | `oswald.ts` : audio → texte, libération mémoire | Textes des clips figés (questions, niveaux, consignes, rage) |
| **Ven. 20** | E03 téléchargement des modèles : progression, reprise après coupure, vérification de taille, stockage | `fatiman.ts` : texte → audio en flux ; génération des **clips** pré-enregistrés | Écoute des clips par un locuteur ; corrections |
| **Sam. 21** | Lecteur audio (clips + Fatiman) sur E02, E23, E30, E31, E40 | Récapitulatif reformulé par Makandal (E22) ; chargement l'un après l'autre des modèles | Retours du vétérinaire intégrés ; statuts `validé` |
| **Dim. 22** | Intégration voix → E21 → E22 ; états d'erreur (micro refusé, rien entendu, modèle absent) | Mesures sur 3 Go et ≥ 4 Go ; optimisation (threads, quantification, contexte) | Test du parcours à la voix avec les cas enregistrés |

**Jalon J2 (dim. 22 au soir) :** parcours de démo **entièrement à la voix**, en mode avion, résultat lu en créole.

### Phase 3 — Compléments et gel (lun. 23 → mar. 24 nov.)

| Jour | D1 Application | D2 IA | D3 Triage et contenu |
|---|---|---|---|
| **Lun. 23** | E50 annuaire (`tel:`, WhatsApp) ; E60 fiche + photo + partage | Robustesse : 20 parcours d'affilée sans plantage ; temps affichés | Annuaire vérifié (≥ 15) ; contenu toxiques locaux |
| **Mar. 24** | E70 historique, E80 réglages (effacer mes données, sources, licences) | Corrections ; « continuer sans IA » vérifié | README v1 ; liste des outils et licences |

**Gel des fonctionnalités : mardi 24 au soir.** Ensuite, uniquement des corrections.

### Phase 4 — Stabilisation et démo (mer. 25 → jeu. 26 nov.)

| Jour | Tous |
|---|---|
| **Mer. 25** | Tests sur 3 téléphones ; scénario de démo répété 3 fois en mode avion ; corrections ; **vidéo de secours** de la démo ; build APK final signé |
| **Jeu. 26** | Pitch chronométré (2 fois) ; téléphones chargés, APK et modèles installés, mode avion prêt ; README et soumission préparés ; copie des modèles sur clé USB |

### Jour J — 6 heures

| Heure | Action |
|---|---|
| H0 – H0:30 | Installation, vérification des téléphones, du son et du projecteur |
| H0:30 – H3:30 | Corrections uniquement, et ce que l'organisation demande sur place |
| H3:30 – H4:30 | Dernier build si nécessaire ; soumission : dépôt, lien de l'APK, README, liste des outils |
| H4:30 – H6 | Répétition, puis démo et pitch |

---

## 7. Lignes de coupe

Décidées à la date prévue, sans débat :

| Date | Si… | Alors… |
|---|---|---|
| Sam. 14 | Oswald ne tourne pas sur Android | Dictée seulement sur ordinateur ; au téléphone, clavier + voix en sortie |
| Sam. 14 | Makandal < 80 % ou > 8 s | Compréhension par le **lexique seul** ; récapitulatif par phrases à trous |
| Sam. 14 | Fatiman trop lent | **Clips pré-générés seulement** |
| Mer. 18 | J1 non atteint | Tout le monde sur le parcours clavier |
| Dim. 22 | J2 non atteint | Démo : voix en sortie, dictée montrée sur un seul cas préparé |
| Mar. 24 | Gel | Annuaire, fiche, historique coupés s'ils ne sont pas prêts |

**Jamais coupé :** moteur de règles et ses tests, parcours en mode avion, résultat lu en créole, modules rage et toxiques, avertissement.

---

## 8. Qualité

### 8.1 Tests

| Quoi | Comment | Seuil |
|---|---|---|
| Moteur de règles | Tests Jest : chaque signe d'alerte, chaque espèce, chaque « m pa konnen » | 100 % verts |
| Jeu de cas | Script : récit → symptômes (lexique, puis Makandal) → niveau | **100 % des cas d'alerte en 🔴** ; ≥ 80 % des symptômes trouvés |
| Reconnaissance vocale | Cas lus par 3 voix → transcription → symptômes | ≥ 80 % des symptômes retrouvés |
| Parcours | Mode avion, téléphone de démo, 3 fois d'affilée | Aucun plantage |
| Contenu | Recherche automatique de doses et de noms de maladies dans les textes affichés | 0 |

### 8.2 Objectifs de performance (téléphone de démo)

| Mesure | Objectif |
|---|---|
| Fin de la parole → symptômes affichés | < 10 s |
| Réponse → premier son | < 3 s (clip : immédiat) |
| Démarrage de l'application | < 3 s |
| APK sans modèles | < 60 Mo |
| Plantage sur 20 parcours | 0 |

---

## 9. Risques

| Risque | Probabilité | Parade |
|---|---|---|
| L'audio d'Oswald n'est pas pris en charge par `llama.rn` | Moyenne | Test le **jour 2** ; aide de l'auteur ; autre voie (module natif llama.cpp) ; sinon coupe du 14 |
| Makandal lent ou imprécis sur nos symptômes | Moyenne | Lexique toujours actif ; exemples dans le prompt ; affinage en dernier recours |
| Mémoire insuffisante | Moyenne | Chargement l'un après l'autre ; téléphone de démo ≥ 4 Go |
| Pack de 1,7 Go trop lourd pour les utilisateurs | Certaine | Le dire dans le pitch ; téléchargement en Wi-Fi par modules ; application utilisable sans IA |
| Contenu non validé par un vétérinaire | Moyenne | Contact dès le 12 ; démo sur les signes d'alerte reconnus (Merck, ASPCA) ; le dire honnêtement |
| Licence Gemma et usage santé | Faible | Lire la politique d'usage avant toute diffusion publique |
| Téléphone de démo en panne | Faible | Deuxième téléphone prêt, vidéo de secours |
| Retard d'un développeur | Moyenne | Lignes de coupe ; contenu et règles indépendants de l'IA |

---

## 10. Démo (3 minutes)

1. **(20 s)** Le problème : une urgence animale mal reconnue, aucune information en créole, pas de réseau.
2. **(15 s)** Le téléphone passe en **mode avion** devant le jury.
3. **(60 s)** Une propriétaire parle : « Chat mwen an ap fòse pou l pipi men anyen pa soti depi maten an. » → texte → symptômes détectés → une question lue à voix haute → **🔴 Ijans**, consignes lues en créole, vétérinaire le plus proche.
4. **(30 s)** Un cas 🟢 pour montrer que Sanimo ne panique pas pour rien.
5. **(20 s)** Le bouton rage : quoi faire après une morsure.
6. **(35 s)** Comment c'est fait : 3 modèles créoles sur le téléphone, des règles qui garantissent les urgences, pas de diagnostic ; la suite : validation vétérinaire, tests sur le terrain, extension aux éleveurs.

---

## 11. Livrables

- Dépôt GitHub public, `main` propre.
- **APK** téléchargeable (lien dans le README).
- README : problème, démo, installation, architecture, limites, sources cliniques, avertissement.
- **Liste des outils et licences :** Expo / React Native, `llama.rn`, ONNX Runtime ; Oswald (Apache-2.0), Makandal (licence Gemma), Fatiman (CC-BY-4.0) ; VetClaw (MIT) ; can-my-dog-eat (MIT) ; corpus créole CMU (mention obligatoire de la provenance) ; outils d'IA utilisés pendant le développement.
- Vidéo de secours de la démo.

---

## 12. Questions à régler cette semaine

| Question | Qui | Pour quand |
|---|---|---|
| Date, heure et contenu exacts des 6 h ; livrables ; déclaration des outils d'IA | D3 | Ven. 13 |
| Comment l'appli Klara charge Oswald sur Android ; mesures de Makandal sur téléphone | D2 (auteur des modèles) | Ven. 13 |
| Téléphone de démo (≥ 4 Go) et de test (3 Go) | D1 | Jeu. 12 |
| Vétérinaire relecteur et créneau de relecture | D3 | Sam. 14 |
| Locuteurs natifs pour la relecture et les enregistrements | D3 | Sam. 14 |

---

## 13. Après le hackathon

| Période | Étape |
|---|---|
| Décembre 2026 | Validation vétérinaire complète ; mesures sur 5 téléphones courants ; réduction du pack |
| Janvier 2027 | Tests avec 20 à 30 propriétaires (Port-au-Prince et province) |
| 1er semestre 2027 | Play Store ; extension aux chèvres, porcs et volailles ; affinage de Makandal sur nos données |
