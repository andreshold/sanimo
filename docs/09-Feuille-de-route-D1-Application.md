# Sanimo — Feuille de route D1 · Application

| | |
|---|---|
| Version | 1.0 |
| Date | Vendredi 13 novembre 2026 |
| Rôle | **D1 — Application** (voir [PLAN-SANIMO](../PLAN-SANIMO.md) §5) |
| Livrable final | **APK installable**, tous les écrans E01 → E80, parcours complet en mode avion |
| Échéances | **J1** mer. 18 (parcours clavier) · **J2** dim. 22 (parcours voix) · **Gel** mar. 24 · **Démo** ven. 27 |
| Références | [PLAN-SANIMO](../PLAN-SANIMO.md) · [App flow](03-App-flow.md) · [TRD](02-TRD.md) · [Données](../donnees/LISEZMOI.md) · Charte visuelle v1 |

Ce document découpe le travail D1 en **étapes courtes, vérifiables et dans l'ordre**. Chaque étape a : un objectif, les tâches, la compétence (skill) Claude Code à charger, et une **définition de « terminé »**. On ne passe à l'étape suivante que lorsque la case « terminé » est cochée.

> **Retard à rattraper :** la tâche D1 du jeudi 12 (dépôt + projet Expo) n'est pas encore faite. Aujourd'hui (vendredi 13) on fait **les étapes 0, 1 et 2**, c'est-à-dire jeudi + vendredi. C'est tenable : le poste est déjà presque prêt (voir §1).

---

## 1. État du poste de travail (vérifié le 13 nov.)

| Outil | État | Action |
|---|---|---|
| Node.js 24.18 · npm 11.16 | ✅ | — |
| Git 2.55 | ✅ | — |
| VS Code | ✅ | Extensions : *Expo Tools*, *ESLint*, *Prettier* |
| Android Studio + SDK (platform 36.1, build-tools 36.0) | ✅ installé | — |
| JDK | ⚠️ seulement celui d'Android Studio (`jbr`), pas dans le PATH | Définir `JAVA_HOME` (étape 0) |
| `ANDROID_HOME` / `adb` | ⚠️ non définis, `adb` absent du PATH | Définir les variables (étape 0) |
| Android **NDK + CMake** | ❌ absents | Obligatoires pour `llama.rn` (code C++) → installer (étape 0) |
| EAS CLI | ❌ | Facultatif (on build en local) ; `npm i -g eas-cli` si besoin d'un build cloud de secours |
| Espace disque | ✅ 610 Go libres | — |

**Versions cibles (npm, 13 nov.) :** Expo **SDK 58** (`expo@58.0.x`) · `llama.rn@0.13.x` · `onnxruntime-react-native@1.24.x`. Toujours installer avec `npx expo install` pour garder des versions compatibles.

---

## 2. Charte appliquée à l'application

### 2.1 Couleurs (jetons de design)

| Jeton | Nom charte | Hex | Usage dans l'app |
|---|---|---|---|
| `primary` | Bleu Sanimo | `#0F3D5E` | Titres, en-têtes, logo, barre d'état, bouton principal |
| `care` | Émeraude soin | `#237A5E` | Actions et confirmations, niveau 🟢 **Siveye** |
| `accent` | Ambre | `#E8A33D` | Accents (point du logo, indicateurs), niveau 🟠 **Konsilte** |
| `surface` | Brume | `#F3F6F7` | Fond des écrans |
| `ink` | Encre | `#1B2B36` | Texte courant |
| `danger` | Urgence | `#C0392B` | **Uniquement** l'urgence : bouton « Ijans kounye a », niveau 🔴 **Ijans**, alertes |
| `white` | — | `#FFFFFF` | Cartes, texte sur fonds foncés |

Dérivés à créer une fois pour toutes dans `src/ui/theme.ts` : `primaryTint` (10 % du bleu sur blanc, pour les puces sélectionnées), `border` (`#DDE4E8`), `inkMuted` (`#5B6B76`), et un fond pâle pour chaque niveau (`dangerBg`, `accentBg`, `careBg`).

**Contrastes calculés (WCAG) :**

| Combinaison | Ratio | Verdict |
|---|---|---|
| Blanc sur Bleu `#0F3D5E` | ≈ 11,4 : 1 | ✅ |
| Blanc sur Émeraude `#237A5E` | ≈ 5,2 : 1 | ✅ texte normal |
| Blanc sur Urgence `#C0392B` | ≈ 5,4 : 1 | ✅ texte normal |
| **Blanc sur Ambre `#E8A33D`** | ≈ 2,2 : 1 | ❌ **interdit** |
| Encre sur Ambre | ≈ 6,7 : 1 | ✅ → sur l'ambre, le texte est toujours **Encre** |
| Encre sur Brume | ≈ 13 : 1 | ✅ |

**Décisions proposées (à valider avec l'équipe) :**
1. Le **bouton principal** (« Kòmanse », « Kontinye ») est **Bleu Sanimo**, et les confirmations (« Wi, se sa ») en **Émeraude**. L'ambre n'est pas utilisé pour les gros boutons, pour ne pas être confondu avec le niveau 🟠 Konsilte.
2. Un niveau n'est **jamais** indiqué par la couleur seule : toujours **couleur + icône + mot** (Ijans / Konsilte / Siveye). Utile aussi pour les daltoniens et en plein soleil.
3. Le rouge n'apparaît **sur aucun autre élément** (pas de rouge pour les erreurs de formulaire : utiliser l'Encre + une icône).
4. Mode sombre : **hors périmètre** du hackathon. L'app est forcée en clair (`userInterfaceStyle: "light"`).

### 2.2 Typographie

| Rôle | Police | Graisses | Taille de base |
|---|---|---|---|
| Titres, chiffres, logotype | **Montserrat** | 600 · 700 · 800 (logotype) | H1 28 · H2 22 · H3 18 |
| Texte, boutons, consignes | **Inter** | 400 · 500 · 600 | Corps **17** · petit 15 · bouton 18 |

Paquets : `@expo-google-fonts/montserrat`, `@expo-google-fonts/inter` (embarqués dans l'APK, donc disponibles hors ligne). Respecter la taille de police du système (`allowFontScaling` laissé actif) et tester à 130 %.

### 2.3 Principes d'interface (charte §04 appliquée)

- **Sobre et crédible** : coins arrondis 12 (cartes) / 16 (gros boutons), icônes en traits fins (`lucide-react-native`, épaisseur 1,75), pas de mascotte, pas d'emoji dans l'interface.
- **Pensé pour tous les publics** : cibles tactiles ≥ **56 dp** pour les actions principales (≥ 48 dp partout), une seule action principale par écran, phrases courtes, chaque écran du parcours a un bouton 🔊 « Koute ».
- **Le rouge pour l'urgence** : le bouton « Ijans kounye a » est visible sur l'accueil et dans tout le parcours d'évaluation.
- **Tous les animaux** : illustrations et exemples avec chiens et chats à égalité (élevage en 2027).
- Icône d'application et écran de démarrage : patte + croix sur fond Bleu Sanimo (fichiers SVG/PNG du logo à récupérer auprès de la personne qui a fait la charte).

---

## 3. Conventions de travail

| Sujet | Règle |
|---|---|
| Dépôt | GitHub, branche `main` **toujours installable** |
| Branches | `d1/<etape>-<sujet>` (ex. `d1/03-theme`) ; une branche par étape |
| Commits | Conventional Commits en français : `feat(ui): thème et composants de base` |
| Revue | Une PR par étape, relue par D2 ou D3 avant fusion |
| Qualité avant chaque PR | `npx tsc --noEmit` · `npx expo lint` · `npm test` · essai sur le téléphone |
| Textes | **Aucun texte en dur** dans les écrans : tout passe par `src/i18n/ht.json` et `fr.json` |
| Couleurs, tailles | **Aucune valeur en dur** : tout passe par `src/ui/theme.ts` |
| Contenu médical | D1 **n'écrit aucun texte médical** : il affiche ce que fournit `content/` (D3) |
| Point du soir | 15 min à 3 : fait / bloqué / demain |

### Compétences Claude Code utilisées par D1

| Compétence | Sert à |
|---|---|
| `expo-overview` | Point d'entrée, règles communes (SDK, `npx expo install`) |
| `expo-project-structure` | Arborescence d'un nouveau projet Expo Router |
| `expo-dev-client` | *Development build* (obligatoire pour `llama.rn` et ONNX) |
| `expo-router` | Navigation, groupes `(onboarding)` / `(triage)`, modales |
| `expo-design-system` | Jetons de design, composants, audit des valeurs en dur |
| `expo-native-ui` · `expo-ui` | Écrans, contrôles natifs (interrupteurs, listes de réglages) |
| `mobile-android-design` · `edge-to-edge` | Conventions Android, barres système (edge-to-edge imposé) |
| `expo-animation` | Animation du micro, retours tactiles (haptique) |
| `react-native-best-practices` · `vercel-react-native-skills` | Performance, listes, mémoire |
| `ecc:react-native-patterns` · `ecc:frontend-a11y` · `ecc:accessibility` | Bonnes pratiques et accessibilité |
| `ecc:i18n-sync` | Vérifier que `ht.json` et `fr.json` ont les mêmes clés |
| `ecc:tdd-workflow` · `ecc:react-testing` | Tests Jest des composants et du stockage |
| `eas-app-stores` | Build APK (local ou EAS), signature, version |
| `ecc:code-review` · `ecc:typescript-reviewer` · `ecc:react-reviewer` | Revue avant chaque fusion |
| `ecc:verification-loop` | Vérification complète avant les jalons J1, J2 et le gel |

---

## 4. Contrats avec D2 et D3 (à fixer aujourd'hui)

D1 ne doit **jamais attendre** D2 ou D3. On fixe les interfaces dès le premier jour et D1 travaille avec des **simulations** (*mocks*), remplacées ensuite par les vraies implémentations.

```ts
// src/ai/types.ts — contrat D1 ↔ D2
export type ModelId = 'oswald' | 'makandal' | 'fatiman';
export type ModelState = 'absent' | 'downloading' | 'paused' | 'verifying' | 'ready' | 'loaded' | 'error';

export interface Orchestrator {
  transcribe(wavUri: string): Promise<{ text: string; ms: number }>;          // Oswald
  detectSymptoms(text: string, lang: 'ht' | 'fr'): Promise<{ ids: string[]; source: 'makandal' | 'lexique' | 'union'; ms: number }>;
  recap(text: string, ids: string[]): Promise<string | null>;                // Makandal, null = repli phrase à trous
  speak(text: string): Promise<void>;                                         // Fatiman
  stopSpeaking(): void;
  releaseAll(): Promise<void>;
}

// src/triage/types.ts — contrat D1 ↔ D3 (moteur de règles, fonctions pures)
export type Level = 'ijans' | 'konsilte' | 'siveye';
export type Answer = 'wi' | 'non' | 'mpakonnen';
export interface TriageInput { species: 'chien' | 'chat'; age: 'jenn' | 'adilt' | 'granmoun'; sex?: 'male' | 'femelle'; symptoms: string[]; answers: Record<string, Answer>; }
export interface TriageOutput { level: Level | null; nextQuestionId: string | null; reasons: string[]; adviceIds: string[]; rulesVersion: string; }
export function evaluate(input: TriageInput): TriageOutput;
```

| À obtenir | De | Pour quand |
|---|---|---|
| Format JSON de `content/` (symptômes, questions, consignes, toxiques, vétérinaires, clips) + un premier fichier d'exemple | D3 | Sam. 14 |
| Signature finale de `evaluate()` | D3 | Sam. 14 |
| Format audio attendu par Oswald (WAV PCM 16 kHz mono ?) et liste des fichiers / URL Hugging Face / tailles exactes | D2 | Sam. 14 |
| Liste des clips (`clipId` → texte) | D3 | Jeu. 19 |

---

## 5. Les étapes

Légende : ⏱ durée estimée · 🧩 compétence · ✅ définition de « terminé »

### Phase 0 — Fondations (ven. 13 → sam. 14 nov.)

#### Étape 0 — Préparer le poste ⏱ 1 h · 🧩 `expo-overview`
1. Variables d'environnement Windows (utilisateur) :
   - `JAVA_HOME` = `C:\Program Files\Android\Android Studio\jbr`
   - `ANDROID_HOME` = `C:\Users\<vous>\AppData\Local\Android\Sdk`
   - Ajouter au `Path` : `%ANDROID_HOME%\platform-tools` et `%JAVA_HOME%\bin`
2. Android Studio → *SDK Manager* → *SDK Tools* : cocher **NDK (Side by side)** et **CMake**, installer.
3. Téléphone de démo (≥ 4 Go de RAM) : activer les options développeur et le **débogage USB** ; vérifier `adb devices`. Noter le modèle, la RAM et la version d'Android. Idem pour le téléphone de test (3 Go).
4. Créer l'organisation / le dépôt GitHub `sanimo` et inviter D2 et D3.

✅ `java -version`, `adb devices` répondent ; le téléphone apparaît ; NDK installé ; dépôt créé.

#### Étape 1 — Créer le projet Expo ⏱ 2 h · 🧩 `expo-project-structure`, `expo-router`
1. Créer le projet à côté, puis le fusionner dans le dossier `Sanimo` (qui devient la racine du dépôt) :
   ```bash
   npx create-expo-app@latest sanimo-app --template default
   ```
   Déplacer son contenu à la racine ; renommer `donnees/` en `content-sources/` (accord D3) ; garder `docs/` et `recherche/`.
2. Retirer les écrans d'exemple ; créer l'arborescence du [PLAN-SANIMO §2.5](../PLAN-SANIMO.md) (`app/(onboarding)`, `app/(triage)`, `src/ai`, `src/triage`, `src/audio`, `src/storage`, `src/i18n`, `src/ui`, `content/`, `assets/clips/`).
3. `app.json` : `name: "Sanimo"`, `slug: "sanimo"`, `android.package: "ht.sanimo.app"`, `userInterfaceStyle: "light"`, `orientation: "portrait"`, couleur de démarrage `#0F3D5E`.
4. TypeScript strict, alias `@/` → `src/`, ESLint (`npx expo lint`), Prettier, `.gitignore` (ajouter `*.gguf`, `*.onnx`, `android/`, `ios/`).
5. `README.md` minimal : installation et commandes.

✅ `npx expo start` ouvre un écran vide ; `npx tsc --noEmit` et `npx expo lint` sans erreur ; premier commit poussé sur `main`.

#### Étape 2 — Development build avec les moteurs d'IA ⏱ 3–4 h · 🧩 `expo-dev-client`, `eas-app-stores`
> C'est l'étape **la plus risquée** de D1 : elle débloque D2. À faire en priorité, même avant les écrans.
1. `npx expo install expo-dev-client expo-build-properties`
2. `npx expo install llama.rn onnxruntime-react-native` et ajouter leurs plugins de configuration dans `app.json` (suivre le README de chaque paquet pour la version installée).
3. `expo-build-properties` : `android.minSdkVersion` ≥ 24, architectures **`arm64-v8a` seulement** (APK plus léger, compilation plus rapide), `largeHeap: true` si disponible.
4. Premier build local branché sur le téléphone :
   ```bash
   npx expo run:android --variant debug
   ```
   (Premier build long : 15 à 30 min, le C++ de llama.cpp se compile.)
5. Écran de test caché `app/dev/bench.tsx` : bouton « Charger un GGUF depuis le stockage » → affiche le temps de chargement et la RAM. **Le donner à D2** pour son banc d'essai.
6. Produire aussi un APK installable sans câble :
   ```bash
   cd android && ./gradlew assembleRelease
   ```
   (signature de debug pour l'instant ; la vraie clé est créée à l'étape 15).

✅ APK installé sur le téléphone de démo, s'ouvre **en mode avion** ; `llama.rn` et ONNX s'importent sans planter ; D2 a l'APK de test. Mesurer et noter la **taille de l'APK** (objectif < 60 Mo).

**Plan B (si le build échoue sur Windows après 2 h)** : build cloud `eas build -p android --profile development` (compte Expo gratuit), puis revenir au build local plus tard.

#### Étape 3 — Thème, polices et composants de base ⏱ 4 h · 🧩 `expo-design-system`, `expo-native-ui`, `edge-to-edge`
1. `src/ui/theme.ts` : couleurs du §2.1, espacements (4, 8, 12, 16, 24, 32), rayons (8, 12, 16, 999), typographie du §2.2, ombres légères.
2. Charger Montserrat et Inter avec `expo-font` ; garder l'écran de démarrage (`expo-splash-screen`) jusqu'au chargement.
3. Composants dans `src/ui/` :

| Composant | Rôle |
|---|---|
| `Screen` | Fond Brume, zones sûres (edge-to-edge), défilement, bouton Ijans optionnel |
| `Title`, `Text` | Typographie de la charte uniquement |
| `Button` | Variantes `primary` (bleu), `confirm` (émeraude), `secondary` (contour), `danger` (rouge) ; état chargement ; haptique |
| `IjansButton` | Bouton rouge « Ijans kounye a », toujours au même endroit |
| `LevelBadge` | Niveau : couleur + icône + mot, tailles S / L |
| `Card`, `ChoiceCard` | Choix chien / chat, âge, etc. (grandes cibles) |
| `CheckRow` | Ligne à cocher pour les symptômes |
| `ListenButton` | 🔊 « Koute » : lit le clip de l'écran |
| `ProgressSteps` | Avancement du parcours (1/5…) |
| `Banner` | Bandeau discret (hors ligne, pack IA absent) |

4. Écran caché `app/dev/catalogue.tsx` qui montre tous les composants (sert de référence visuelle et de capture pour l'équipe).

✅ Le catalogue s'affiche sur le téléphone, conforme à la charte ; aucune couleur en dur hors de `theme.ts` (audit `expo-design-system`) ; contrastes du §2.1 respectés.

#### Étape 4 — Navigation et i18n ⏱ 3 h · 🧩 `expo-router`, `ecc:i18n-sync`
1. `i18next` + `react-i18next` + `expo-localization` ; `src/i18n/ht.json` (par défaut) et `fr.json`. Clés par écran : `e10.start`, `e30.level.ijans`…
2. Routes (écrans vides avec titre, bouton suivant et bouton retour). **Avec Expo SDK 58, les routes vivent dans `src/app/`** (et non `app/`) :
   ```
   app/_layout.tsx                 polices, i18n, SQLite, redirection onboarding
   app/(onboarding)/langue.tsx     E01
   app/(onboarding)/avertissement.tsx  E02
   app/(onboarding)/pack-ia.tsx    E03
   app/index.tsx                   E10 Accueil
   app/ijans.tsx                   E11
   app/(triage)/animal.tsx         E20
   app/(triage)/description.tsx    E21
   app/(triage)/symptomes.tsx      E22
   app/(triage)/questions.tsx      E23
   app/(triage)/resultat.tsx       E30
   app/(triage)/consignes.tsx      E31
   app/rage.tsx · toxiques.tsx · veterinaires.tsx · fiche.tsx · istwa.tsx · reglaj.tsx
   ```
3. Redirection : si la langue ou l'avertissement ne sont pas encore acceptés → `(onboarding)`.
4. Bouton retour Android géré dans le parcours (réponses conservées).

✅ On parcourt E01 → E31 et tous les écrans annexes au doigt, en créole et en français ; `ecc:i18n-sync` : aucune clé manquante.

### Phase 1 — Le cœur, hors ligne au clavier (dim. 15 → mer. 18 nov.)

#### Étape 5 — Stockage SQLite et état de session ⏱ 3 h · 🧩 `ecc:tdd-workflow`
1. `expo-sqlite` ; migrations par `PRAGMA user_version`. Tables :

| Table | Colonnes principales |
|---|---|
| `settings` | `key`, `value` (langue, avertissement accepté, lecture auto, voix) |
| `assessments` | `id`, `created_at`, `species`, `age`, `sex`, `input_mode` (voix / texte), `transcript`, `symptoms` (JSON), `answers` (JSON), `level`, `reasons` (JSON), `rules_version`, `photo_uri`, `status` (en cours / terminée) |
| `models` | `id`, `state`, `bytes_done`, `bytes_total`, `path`, `updated_at` |

2. État du parcours en cours : `zustand` (`src/triage/session.ts`), enregistré dans `assessments` à chaque étape → **reprise** proposée sur E10 après une interruption.
3. `deleteAllData()` pour E80 (efface tables, photos, et propose d'effacer les modèles).
4. Tests Jest (`jest-expo`) sur le dépôt et la reprise.

✅ Tests verts ; une évaluation interrompue (application tuée) est proposée en reprise.

#### Étape 6 — E01, E02, E10, E20 ⏱ 3 h · 🧩 `expo-native-ui`, `ecc:frontend-a11y`
- **E01** Langue : deux grandes cartes « Kreyòl » / « Français », Kreyòl présélectionné.
- **E02** Avertissement : texte de D3, bouton 🔊, case « M konprann », accepté une seule fois.
- **E10** Accueil : logo, gros bouton bleu « Kòmanse », bouton rouge « Ijans kounye a », accès rage et toxiques, bandeau d'état du pack IA, reprise d'évaluation.
- **E20** Animal : chien / chat, âge (jenn / adilt / granmoun), sexe pour le chat ; « Lòt bèt » → message hors périmètre + annuaire.

✅ Premier lancement → E01 → E02 → E10 ; deuxième lancement → directement E10. Libellés d'accessibilité présents (TalkBack lit chaque bouton).

#### Étape 7 — E21, E22, E23 au clavier ⏱ 5 h · 🧩 `expo-native-ui`, `react-native-best-practices`
- **E21** Description : grand champ texte multiligne + emplacement du bouton micro (grisé tant que l'étape 10 n'est pas faite).
- **E22** Symptômes détectés : appelle `orchestrator.detectSymptoms()` (simulation lexique au début), liste à cocher, « Ajoute yon lòt sentòm » (recherche dans la liste fermée), récapitulatif (P1) ; « Aucun symptôme » géré.
- **E23** Questions : une question par écran, trois gros boutons **Wi / Non / M pa konnen**, 🔊, barre d'avancement ; alimenté par `evaluate().nextQuestionId`.

✅ Avec la simulation : saisie « chat la ap fòse pou l pipi » → symptôme proposé → questions → arrivée sur E30.

#### Étape 8 — E30, E31, E11 branchés sur le moteur ⏱ 4 h
- **E30** Résultat : grand `LevelBadge` (plein écran en couleur pour Ijans), raisons, 🔊, boutons « Sa pou m fè » → E31 et « Veterinè » → E50.
- **E31** Consignes : sections **Sa pou w fè** / **Sa pou w pa fè** / **Si w wè sa, ale kounye a** ; textes **validés** de `content/` uniquement.
- **E11** Ijans kounye a : signes d'urgence, gestes immédiats, lien vétérinaires ; accessible en un toucher depuis partout.
- Remplacer la simulation par le vrai `evaluate()` de D3 dès qu'il est fusionné.

✅ Les 45 cas d'alerte de `cas_test.csv`, saisis via un test d'intégration, aboutissent à l'écran 🔴 (test automatisé avec D3).

#### Étape 9 — E40 Rage, E41 Toxiques, finitions ⏱ 4 h
- **E40** : gestes pour la personne mordue (laver 15 min, centre de santé), signes chez l'animal, rappel de l'avertissement.
- **E41** : liste par catégorie (aliments, médicaments humains, produits, plantes), recherche, message fixe « Pa janm bay bèt ou medikaman moun ».
- Passe de finition sur tout le parcours (espacements, textes longs en créole, police à 130 %).

✅ **Jalon J1 (mer. 18 au soir)** — parcours complet **au clavier, en mode avion**, sur le téléphone de démo, avec le lexique (ou Makandal si D2 est prêt). `ecc:verification-loop` passé ; APK J1 partagé à l'équipe.

### Phase 2 — La voix de bout en bout (jeu. 19 → dim. 22 nov.)

#### Étape 10 — Micro et enregistrement ⏱ 4 h · 🧩 `expo-animation`
1. Enregistrement **WAV PCM 16 kHz mono**, 30 s maximum. `expo-audio` n'enregistre pas directement en WAV PCM sur Android : utiliser `@siteed/expo-audio-studio` (ou équivalent), **à valider avec D2 le jeu. 19 au matin** selon le format accepté par `llama.rn`.
2. Gros bouton micro (≥ 96 dp) : appui pour démarrer / arrêter, animation d'onde selon le volume, compte à rebours, haptique au début et à la fin.
3. Permission micro : demande au premier usage ; si refusée → clavier mis en avant + lien vers les réglages.
4. États : écoute → « M ap koute… » → transcription → texte modifiable dans E21.

✅ Un enregistrement de 15 s produit un fichier WAV lisible par l'outil de D2 ; refus de permission géré sans blocage.

#### Étape 11 — E03 Téléchargement du pack IA ⏱ 5 h · 🧩 `expo-data-fetching`
1. Manifeste `content/models.json` (de D2) : `id`, URL Hugging Face, taille exacte, empreinte (si disponible), ordre (voix d'abord : Oswald + Fatiman ≈ 930 Mo, puis Makandal ≈ 806 Mo).
2. `expo-file-system` : téléchargement **reprenable** (pause / reprise, reprise après coupure réseau ou fermeture de l'app), fichier `.part` renommé à la fin.
3. Avant de commencer : vérifier l'espace libre (taille × 1,2) ; `@react-native-community/netinfo` → conseil Wi-Fi si données mobiles.
4. Vérification de la **taille exacte** à la fin (empreinte SHA-256 en natif si D2 la fournit) ; sinon suppression et relance.
5. Écran garde le téléphone éveillé pendant le téléchargement (`expo-keep-awake`) ; progression par modèle et globale, Mo/s, temps restant ; **« Kontinye san IA »** toujours visible.
6. Pour la démo et les tests : option cachée « Importer depuis le stockage » (copie des modèles depuis une clé USB / `adb push`).

✅ Coupure du Wi-Fi à 40 % → reprise à 40 % ; app tuée pendant le téléchargement → reprise au relancement ; état visible sur E10 et E80.

#### Étape 12 — Lecteur audio ⏱ 3 h
1. `expo-audio` pour les **clips pré-générés** (`assets/clips/<clipId>.mp3`, livrés par D2/D3) ; repli sur `orchestrator.speak()` (Fatiman) pour le texte variable.
2. Lecture automatique à l'arrivée sur E02, E23, E30, E31, E40 (désactivable dans E80) ; arrêt à la sortie de l'écran ; un seul son à la fois.
3. Si le son est coupé : le texte reste affiché, le bouton 🔊 permet de réécouter.

✅ Chaque écran du parcours principal parle en créole ; aucun chevauchement de sons en allant vite.

#### Étape 13 — Intégration voix → symptômes ⏱ 4 h (avec D2)
1. E21 : WAV → `transcribe()` → texte modifiable → `detectSymptoms()` → E22 ; récapitulatif « Ou di m… se sa ? » lu à voix haute.
2. Indicateurs d'attente honnêtes (« M ap ekri sa w di… », « M ap chèche sentòm yo… ») et temps mesurés en mode dev.
3. États d'erreur de l'App flow §12 : rien entendu, modèle absent, mémoire insuffisante → **repli silencieux** sur le clavier et le lexique.

✅ **Jalon J2 (dim. 22 au soir)** — parcours de démo **entièrement à la voix**, mode avion, résultat lu en créole, sur le téléphone de démo. Fin de la parole → symptômes affichés < 10 s.

### Phase 3 — Compléments et gel (lun. 23 → mar. 24 nov.)

#### Étape 14 — E50, E60, E70, E80 ⏱ 1,5 jour
- **E50** Vétérinaires : liste par commune (sélecteur), urgences 24 h en tête, appel (`tel:`) et WhatsApp (`https://wa.me/509…`) en un toucher via `Linking`, date de vérification affichée.
- **E60** Fiche pour le vétérinaire : résumé **en français** (espèce, âge, symptômes, réponses, niveau, heure), photo (`expo-image-picker`, caméra), PDF (`expo-print`) partagé avec `expo-sharing`. Rappel de l'avertissement.
- **E70** Historique : liste des évaluations (date, animal, `LevelBadge`), détail, suppression.
- **E80** Réglages : langue, lecture automatique, voix, état et taille du pack IA, **Efase done mwen yo**, sources et licences, version.

✅ Un vétérinaire peut recevoir la fiche par WhatsApp avec la photo ; « Effacer mes données » vide bien tout.

**Gel des fonctionnalités : mardi 24 au soir.** Ce qui n'est pas prêt est coupé (annuaire, fiche, historique en priorité), selon [PLAN-SANIMO §7](../PLAN-SANIMO.md).

### Phase 4 — Stabilisation et démo (mer. 25 → jeu. 26 nov.)

#### Étape 15 — APK final ⏱ ½ jour · 🧩 `eas-app-stores`
1. Clé de signature de production (`keytool`), **sauvegardée hors du dépôt** (gestionnaire de mots de passe + clé USB).
2. `versionCode` / `versionName` (1.0.0), icône adaptative et écran de démarrage définitifs.
3. `./gradlew assembleRelease` (ou `eas build -p android --profile preview`), APK < 60 Mo, publié dans une *Release* GitHub ; lien dans le README.
4. Démarrage < 3 s mesuré ; R8/minification activée si aucun plantage.

#### Étape 16 — Tests sur téléphones et démo ⏱ 1 jour · 🧩 `ecc:verification-loop`
- 3 téléphones (démo ≥ 4 Go, test 3 Go, un troisième) : **20 parcours d'affilée sans plantage**, en mode avion.
- Scénario de démo ([PLAN-SANIMO §10](../PLAN-SANIMO.md)) répété 3 fois ; **vidéo de secours** enregistrée (`adb shell screenrecord` ou enregistreur d'écran).
- Veille de la démo : téléphones chargés, APK + modèles installés, mode avion prêt, modèles copiés sur clé USB, câble USB et chargeur dans le sac.

---

## 6. Calendrier de D1 en un coup d'œil

| Date | Étapes | Fin de journée |
|---|---|---|
| **Ven. 13** | 0 · 1 · 2 | Projet sur GitHub, APK de test avec `llama.rn` + ONNX remis à D2 |
| **Sam. 14** | 3 · 4 | Thème, composants, navigation HT/FR ; contrats D2/D3 fixés ; **décisions A1–A4** à 3 |
| **Dim. 15** | 5 · 6 | SQLite, E01 · E02 · E10 · E20 |
| **Lun. 16** | 7 | E21 · E22 · E23 au clavier |
| **Mar. 17** | 8 | E30 · E31 · E11 sur le vrai moteur |
| **Mer. 18** | 9 | E40 · E41 — **Jalon J1** |
| **Jeu. 19** | 10 | Micro WAV 16 kHz |
| **Ven. 20** | 11 | Téléchargement du pack IA |
| **Sam. 21** | 12 | Lecteur audio, clips |
| **Dim. 22** | 13 | Voix de bout en bout — **Jalon J2** |
| **Lun. 23** | 14 | E50 · E60 |
| **Mar. 24** | 14 | E70 · E80 — **Gel** |
| **Mer. 25** | 15 · 16 | APK signé, tests 3 téléphones, vidéo de secours |
| **Jeu. 26** | 16 | Répétitions, téléphones prêts |

---

## 7. Paquets prévus

| Besoin | Paquet |
|---|---|
| Navigation | `expo-router` |
| Build natif | `expo-dev-client`, `expo-build-properties` |
| IA (avec D2) | `llama.rn`, `onnxruntime-react-native` |
| Polices | `expo-font`, `@expo-google-fonts/montserrat`, `@expo-google-fonts/inter` |
| Icônes | `lucide-react-native`, `react-native-svg` |
| i18n | `i18next`, `react-i18next`, `expo-localization` |
| État | `zustand` |
| Stockage | `expo-sqlite`, `expo-file-system` |
| Audio | `expo-audio` (lecture) · `@siteed/expo-audio-studio` (enregistrement WAV, à valider) |
| Réseau, appareil | `@react-native-community/netinfo`, `expo-device`, `expo-keep-awake` |
| Retours tactiles | `expo-haptics` |
| Fiche | `expo-image-picker`, `expo-print`, `expo-sharing` |
| Tests | `jest-expo`, `@testing-library/react-native` |

Tous installés avec `npx expo install <paquet>`.

---

## 8. Risques propres à D1

| Risque | Parade |
|---|---|
| Le build natif `llama.rn` échoue sous Windows (NDK, chemins avec espaces : `Andres Luis`) | Vérifier tôt (étape 2). Si le chemin pose problème : déplacer le dépôt vers `C:\dev\sanimo`. Sinon build cloud EAS |
| Builds natifs lents (15–30 min) | `arm64-v8a` seulement ; ne reconstruire le natif que lorsqu'un paquet natif change ; le reste en rechargement rapide |
| Format audio incompatible avec Oswald | Fixer le format avec D2 avant l'étape 10 ; prévoir une conversion |
| Téléchargement de 1,7 Go interrompu | Reprise + import depuis le stockage pour la démo |
| Textes créoles trop longs pour les boutons | Tester tous les écrans en créole ; boutons sur plusieurs lignes autorisés |
| Dépendance au moteur de D3 ou à l'IA de D2 | Contrats §4 et simulations dès le premier jour |

---

## 9. Points à valider avec l'équipe

1. Bouton principal **bleu** et ambre réservé aux accents + niveau Konsilte (§2.1).
2. Identifiant Android `ht.sanimo.app`.
3. Renommer `donnees/` en `content-sources/` dans le dépôt.
4. Fichiers sources du logo (SVG) pour l'icône et l'écran de démarrage.
