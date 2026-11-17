# Sanimo — Feuille de route D3 · Triage et contenu

| | |
|---|---|
| Version | 1.0 |
| Date | Samedi 14 novembre 2026 |
| Rôle | **D3 — Triage et contenu** (voir [PLAN-SANIMO](../PLAN-SANIMO.md) §5) |
| Livrables finaux | `src/triage/` **testé** · `content/` **validé** · jeu de cas qui tourne à chaque fusion · README · pitch |
| Échéances | Contrat de contenu **sam. 14** · **J1** mer. 18 (moteur branché, 100 % des alertes en 🔴) · Clips figés jeu. 19 · Contenu `validé` sam. 21 · **Gel** mar. 24 · **Démo** ven. 27 |
| Références | [PLAN-SANIMO](../PLAN-SANIMO.md) · [TRD §6](02-TRD.md) · [Données](../content-sources/LISEZMOI.md) · [Feuille de route D1](09-Feuille-de-route-D1-Application.md) · [Plan VetClaw créole](07-Plan-VetClaw-creole.md) · [Synthèse de recherche](../recherche/synthese-recherche.md) |

Ce document découpe le travail D3 en **étapes courtes, vérifiables et dans l'ordre**. Chaque étape a : un objectif, les tâches, la compétence (skill) Claude Code à charger, et une **définition de « terminé »**. On ne passe à l'étape suivante que lorsque la case « terminé » est cochée.

D3 tient la **sûreté** de Sanimo : c'est le moteur de règles, et non l'IA, qui garantit qu'un signe d'alerte donne toujours 🔴, et c'est le contenu, et non l'IA, qui décide de ce que l'application dit. Tout ce que D3 livre doit donc être **testé, traçable (source + statut) et relu**.

> **Situation au 14 nov. :** le contenu est **en avance** (symptômes, lexique, consignes, toxiques et 75 cas déjà extraits dans `donnees/`, devenu `content-sources/`), le code est **en retard** : `src/triage/` ne contient que `types.ts`, `content/` est vide, Jest n'est pas installé, les règles v1 (prévues ven. 13) ne sont pas écrites. Aujourd'hui on fait **les étapes 0, 1 et 2**.

---

## 1. État du contenu (vérifié le 14 nov.)

| Fichier ([PLAN §3](../PLAN-SANIMO.md)) | Visé | Existant dans `content-sources/` | Écart / action |
|---|---|---|---|
| `symptomes` | 40 à 50 | ✅ 46 (27 signes d'alerte, 1 « à valider » : `chiot_vomit_diarrhee`) | Trancher `chiot_vomit_diarrhee` avec le vétérinaire |
| `questions` | 30 à 40 | ⚠️ une question par symptôme, **dans** `symptomes.csv` | Créer `questions.csv` : questions de signes d'alerte + **durée / évolution** + contexte (étape 4) |
| `regles` | 40 à 60 | ❌ | Créer `regles.csv` (étapes 3 et 4) |
| `consignes` | 30 à 50 | ✅ 30 (général 6, plaie 6, toxique 6, rage 5, urgence 3, chaleur 2, convulsions 2) | Ajouter : « si w wè sa, ale kounye a » par symptôme non alarmant, respiration, urinaire |
| `toxiques` | 20 à 30 | ✅ 23 (aliments 11, médicaments humains 4, produits 4, antiparasitaires 2, plante 1, autre 1) | **Toxiques locaux** et plantes avec le vétérinaire (étape 11) |
| `lexique` | ≥ 5 par symptôme | ✅ 393 termes | Compléter `oeil_sorti`, `organe_sorti`, `plaie_profonde_os` |
| `banque_phrases` | — | ✅ 683 phrases en créole, dont des négations (phrases françaises retirées le 15 nov.) | Sert de test au lexique (négations) |
| `cas` | 75 à 100 | ✅ 75 (45 alerte, 23 non alerte, 5 pièges, 2 négations) | Monter à 90+ : cas chat mâle, chiot, « m pa konnen » |
| `veterinaires` | ≥ 15 | ❌ | Appels de vérification à partir du lun. 16 (étape 11) |
| `clips` | 80 à 150 | ❌ | Textes figés jeu. 19 (étape 7) |

**Statuts :** tout est encore `brouillon`. Les textes créoles sont des **premiers jets écrits par une IA** (colonne `brouillon_*_ht`) : ils doivent passer `relu_ht` (locuteur natif) puis `validé` (vétérinaire).

---

## 2. Principes non négociables

1. **Le moteur est une fonction pure** : pas de React, pas de réseau, pas d'aléatoire, pas de date courante. Même entrée → même sortie.
2. **Un signe d'alerte confirmé ou répondu « wi » donne toujours 🔴.** Ce n'est pas une règle parmi d'autres : la règle est **générée automatiquement** à partir de `signe_alerte = oui` dans `symptomes.csv`, pour qu'aucun oubli ne soit possible.
3. **Niveau final = max(niveau des règles, niveau proposé par le modèle).** Le modèle peut relever le niveau, jamais l'abaisser.
4. **Le moteur ne renvoie que des identifiants** (raisons, consignes, questions). Aucun texte n'est fabriqué : tout texte affiché vient de `content/`.
5. **Aucune dose, aucun nom de médicament à donner, aucun nom de maladie** dans un texte affiché. Vérifié automatiquement (étape 5). Seule exception admise : le mot **« rage / raj »** dans le titre du module E40.
6. **Traçabilité** : chaque ligne a une `source` et un `statut`. Seul le contenu `validé` est présenté comme tel dans la démo ; le reste est annoncé « en cours de validation ».
7. **Les identifiants sont figés** à partir du samedi 14 au soir. Renommer un id = prévenir D1 et D2 au point du soir.

---

## 3. Conventions de travail

| Sujet | Règle |
|---|---|
| Branches | `d3/<etape>-<sujet>` (ex. `d3/02-moteur-alertes`) ; une branche par étape |
| Commits | Conventional Commits en français : `feat(triage): règles de durée`, `content: questions v1` |
| Revue | Une PR par étape, relue par D1 ou D2. **Toute PR qui touche `src/triage/` ou `content/` doit avoir le jeu de cas vert** |
| Qualité avant chaque PR | `npm test` · `npm run content` (conversion + vérifications) · `npx tsc --noEmit` · `npx expo lint` |
| Sources | Les tableurs CSV (`content-sources/`) sont la **source de vérité**. Le JSON de `content/` est **généré** et commité, jamais modifié à la main |
| Format CSV | UTF-8, séparateur `;`, une ligne d'en-tête (comme les fichiers actuels de `content-sources/`) |
| Langue | **L'application est entièrement en créole** (décision du 15 nov.) : une seule colonne de texte par élément (`libelle_ht`, `question_ht`, `texte_ht`, `raison_ht`, `nom_ht`, `message_ht`). Les colonnes `note` et `source` restent en français : elles ne sont jamais affichées |
| Point du soir | 15 min à 3 : fait / bloqué / demain |

### Compétences Claude Code utilisées par D3

| Compétence | Sert à |
|---|---|
| `ecc:tdd-workflow` · `ecc:typescript-reviewer` | Moteur écrit test d'abord ; revue TypeScript |
| `ecc:healthcare-cdss-patterns` · `ecc:healthcare-reviewer` | Patrons d'aide à la décision clinique ; **revue de sûreté** du moteur et des consignes |
| `ecc:contract-first` | Contrat `evaluate()` et format JSON avec D1 / D2 |
| `ecc:eval-harness` · `ecc:ai-regression-testing` | Exécuteur du jeu de cas, seuils, non-régression à chaque fusion |
| `ecc:regex-vs-llm-structured-text` | Normalisation et pièges de langue (« san », négations) avec D2 |
| `anthropic-skills:xlsx` | Classeurs de relecture pour le vétérinaire et les locuteurs |
| `ecc:i18n-sync` | ~~Vérifier que chaque texte existe en HT et en FR~~ — sans objet : application en créole seulement |
| `ecc:update-docs` · `ecc:opensource-sanitizer` | README, liste des outils et licences, vérification avant dépôt public |
| `ecc:article-writing` · `anthropic-skills:pptx` · `ecc:frontend-slides` | Texte du pitch et diapositives |
| `ecc:code-review` · `ecc:verification-loop` | Revue avant fusion ; vérification complète avant J1, J2 et le gel |

---

## 4. Contrats avec D1 et D2 (à fixer aujourd'hui)

D1 attend de D3, **pour aujourd'hui (sam. 14)** : le format JSON de `content/` avec un fichier d'exemple, et la signature finale de `evaluate()`. D3 ne doit pas faire attendre D1 : on livre d'abord le **format + un échantillon** (5 symptômes, 5 questions, 3 règles), le volume suit.

### 4.1 Moteur (D1 ↔ D3)

Le contrat existant ([src/triage/types.ts](../src/triage/types.ts)) est gardé. Deux ajouts **facultatifs**, donc sans casser D1 :

```ts
export interface TriageInput {
  species: Species;
  age: AgeGroup;
  sex?: 'male' | 'femelle';
  symptoms: string[];                 // confirmés par l'utilisateur ; ids inconnus ignorés
  answers: Record<string, Answer>;
  modelLevel?: Level;                 // AJOUT : niveau proposé par Makandal, peut seulement relever
}

export interface TriageOutput {
  level: Level | null;                // null tant qu'une question reste à poser
  nextQuestionId: string | null;
  reasons: string[];                  // ids de règles → content/regles.json (texte de la raison)
  adviceIds: string[];                // ids → content/consignes.json, dans l'ordre d'affichage
  rulesVersion: string;               // ex. "2026-11-21.1" — enregistré avec chaque évaluation
  progress: { asked: number; max: number };   // AJOUT : posées / posées + restantes (ProgressSteps sur E23)
}

export function evaluate(input: TriageInput): TriageOutput;
```

**Mode d'emploi pour D1 :** appeler `evaluate()` après E22, puis à chaque réponse sur E23 en ajoutant la réponse dans `answers`. Tant que `nextQuestionId` n'est pas `null`, afficher la question ; sinon aller sur E30 avec `level`, `reasons`, `adviceIds`.

### 4.2 Contenu (D3 → D1, D2)

Un fichier JSON par type dans `content/`, avec types TypeScript dans `src/triage/content-types.ts`. Chaque élément porte son texte (créole haïtien uniquement) et son statut :

```ts
type Text = string;   // créole haïtien (dans le code : `string`)
type Status = 'brouillon' | 'relu_ht' | 'valide';

interface Symptom  { id: string; category: string; species: Species[]; label: Text; alert: boolean; minLevel: Level; questionId: string; status: Status }
interface Question { id: string; text: Text; symptomId?: string; kind: 'alerte' | 'duree' | 'evolution' | 'contexte';
                     species?: Species[]; sex?: 'male' | 'femelle'; age?: AgeGroup[];
                     askedIf: string[]; always: boolean; priority: number; levelIfUnknown: Level; clipId?: string; status: Status }
interface Rule     { id: string; when: Condition[]; level: Level; reason: Text; adviceIds: string[]; source: string; status: Status }
interface Advice   { id: string; context: string; type: 'a_faire' | 'a_ne_pas_faire' | 'signe_retour'; species: string[]; text: Text; clipId?: string; status: Status }
interface Toxic    { id: string; category: string; name: Text; localNames: string[]; species: Species[]; level: Level; message: Text; status: Status }
interface Vet      { id: string; name: string; commune: string; department: string; phone: string; whatsapp?: string; hours: string; emergency24h: boolean; verifiedOn: string; status: Status }
interface Clip     { id: string; screen: string; text: Text; i18nKey?: string; contentRef?: string; words: number; status: Status }   // fichier audio : assets/clips/<id>.mp3
```

| Fichier généré | Lu par |
|---|---|
| `content/symptomes.json` · `questions.json` · `regles.json` · `consignes.json` | Moteur (D3), écrans E22 → E31 (D1) |
| `content/toxiques.json` · `veterinaires.json` | E41, E50 (D1) |
| `content/lexique.json` | `src/ai/lexique.ts` (D2) |
| `content/clips.json` | Génération audio (D2), lecteur (D1) |
| `content/version.json` | `rulesVersion`, date, nombre d'éléments par statut |

### 4.3 Ce que D3 attend des autres

| À obtenir | De | Pour quand |
|---|---|---|
| Accord pour renommer `donnees/` en `content-sources/` | D1 | Sam. 14 |
| Qui installe Jest (D3 aujourd'hui, D1 le réutilise à son étape 5) | D1 | Sam. 14 |
| Interface de `src/ai/lexique.ts` (entrée texte créole → ids) pour l'exécuteur du jeu de cas | D2 | Dim. 15 |
| Taux de rappel des symptômes par Makandal sur le jeu de cas | D2 | Mer. 18 |
| Format des clips (mp3 ? durée max ?) et voix retenue | D2 | Jeu. 19 |

---

## 5. Les étapes

Légende : ⏱ durée estimée · 🧩 compétence · ✅ définition de « terminé »

### Phase 0 — Rattrapage et fondations (sam. 14 nov.)

#### Étape 0 — Rattraper les questions de la semaine ⏱ 1 h
Ces points du [PLAN §12](../PLAN-SANIMO.md) sont à D3 et **en retard** :
1. **Organisateurs du hackathon** : date et heure exactes, contenu des 6 h, livrables attendus, règles de **déclaration des outils d'IA** (les brouillons créoles et le code sont écrits avec Claude : à déclarer).
2. **Vétérinaire relecteur** : confirmer la personne, fixer **deux créneaux** (envoi mer. 18, retours au plus tard sam. 21) et le format (classeur Excel, appel WhatsApp de 1 h).
3. **Locuteurs natifs (2 si possible)** : relecture du créole (dès lundi), **enregistrement des cas** à voix haute (3 voix ou plus, jeu. 19 → sam. 21), écoute des clips (ven. 20).
4. Renommer `donnees/` en `content-sources/` (avec D1) et mettre à jour les liens dans les documents.

✅ Réponses des organisateurs notées dans le PLAN ; vétérinaire et locuteurs confirmés avec dates ; dossier renommé sur `main`.

#### Étape 1 — Contrat de contenu et identifiants figés ⏱ 2 h · 🧩 `ecc:contract-first`
1. Écrire `src/triage/content-types.ts` (§4.2) et compléter `src/triage/types.ts` (§4.1).
2. Produire à la main un **échantillon** `content/` (5 symptômes, 5 questions, 3 règles, 3 consignes) et le pousser : D1 peut brancher ses écrans dessus dès ce soir.
3. Relire les 46 identifiants de symptômes une dernière fois, puis les **figer**.
4. Présenter le contrat aux **décisions de 30 min** du samedi soir.

✅ D1 a validé le format et la signature ; l'échantillon est sur `main` ; `npx tsc --noEmit` passe.

#### Étape 2 — Moteur : signes d'alerte, test d'abord ⏱ 3 h · 🧩 `ecc:tdd-workflow`, `ecc:healthcare-cdss-patterns`
1. Installer Jest : `npx expo install jest-expo jest @types/jest -- --save-dev`, script `"test": "jest"`, `testMatch` sur `src/**/*.test.ts` et `tests/**/*.test.ts`.
2. `src/triage/engine.ts` : `evaluate()` minimal, qui prend les règles en paramètre (`createEvaluate(content)`) pour rester testable sans les fichiers JSON.
3. Premiers tests, **un par signe d'alerte** (27, générés par une boucle sur `symptomes`), pour chaque espèce concernée :
   - symptôme confirmé → `level: 'ijans'`, `nextQuestionId: null`, raison `alerte_<id>` ;
   - question répondue `wi` → même résultat ;
   - symptôme d'une autre espèce (ex. `respiration_bouche_ouverte_chat` pour un chien) → ignoré ;
   - identifiant inconnu → ignoré, sans erreur.

✅ `npm test` vert, 27 signes × espèces couverts ; un signe d'alerte retiré de la liste fait échouer un test.

### Phase 1 — Le cœur, hors ligne au clavier (dim. 15 → mer. 18 nov.)

#### Étape 3 — Moteur complet ⏱ 1 jour · 🧩 `ecc:tdd-workflow`, `ecc:typescript-reviewer`
L'algorithme suit le [TRD §6.2](02-TRD.md), précisé ainsi :

1. **Filtrer** l'entrée : symptômes inconnus ou d'une autre espèce ignorés.
2. **Alerte immédiate** : un symptôme d'alerte confirmé, ou une question d'alerte répondue `wi` → 🔴, plus de question.
3. **Choisir la prochaine question** selon la seule colonne `priorite` du tableur (déterministe), en sautant celles déjà répondues ou dont le symptôme est déjà confirmé ou déjà demandé. Le script de conversion **impose** cet ordre :
   1. questions **de base** (`toujours = oui`, priorité < 100) : chat mâle ou de sexe inconnu → urine, puis respiration, effondrement, toxique ;
   2. questions d'alerte **déclenchées** par un symptôme confirmé (priorité < 300, ex. `vomissements` → `vomit_sang`, `efforts_vomir_sans_resultat`, `vomissements_repetes`) ;
   3. questions de **suivi** : durée, évolution, contexte (priorité ≥ 300).

   **Plafond : 10 questions de suivi** (`MAX_FOLLOWUP_QUESTIONS`). Les questions d'alerte ne sont **jamais** coupées. Si le plafond coupe une question de suivi, le niveau monte au moins à 🟠 (raison `plafond_questions`). *(Décidé le 15 nov. après la revue de sûreté : un plafond global de 8, puis 10, pouvait couper les questions de base.)*
   **Sexe inconnu** : le moteur se comporte comme pour un mâle (questions et règles). **Espèce ou âge invalide** : erreur, jamais un 🟢 silencieux.
4. **« M pa konnen »** sur une question d'alerte → niveau `levelIfUnknown` de la question (🟠 par défaut, 🔴 pour les signes où le doute est dangereux, ex. chat mâle qui ne peut pas uriner) : à valider par le vétérinaire.
5. **Évaluer les règles** ; niveau des règles = le plus élevé ; `minLevel` des symptômes confirmés compte comme une règle.
6. **Aucun symptôme et que des « non »** → 🟢 avec les consignes de surveillance générales (cas à valider).
7. **Niveau final** = max(règles, `modelLevel`). Un `modelLevel` 🔴 arrête aussi les questions.
8. **Consignes** : union des `adviceIds` des règles déclenchées, sans doublon, ordre : à faire → à ne pas faire → signes de retour. Toujours `gen_pas_medicament_humain`.

Tests à ajouter : chaque « m pa konnen », chaque règle de durée, l'ordre des questions, le plafond, `modelLevel` qui relève mais n'abaisse pas, **déterminisme** (même entrée deux fois = même sortie), **monotonie** (ajouter un symptôme ne fait jamais baisser le niveau).

✅ Tests verts ; couverture de `src/triage/` ≥ 90 % ; revue `ecc:healthcare-reviewer` sans point bloquant.

> **Fait le 15 nov.** — 100 % des lignes, 95,7 % des branches couvertes. La revue de sûreté a trouvé un point bloquant (plafond qui coupait les questions de base) et cinq points importants (chat de sexe inconnu, « wi » ignoré après correction du sexe, IA 🔴 qui n'arrêtait pas les questions, chiot qui vomit sans question sur la diarrhée, entrée invalide → 🟢). Tous corrigés et couverts par des tests ; les points cliniques sont ajoutés au §7.

#### Étape 4 — Tableurs v1 et conversion en JSON ⏱ 1 jour · 🧩 `anthropic-skills:xlsx`
1. **`questions.csv`** : `id;type;symptome_id;especes;sexe;age;declenchee_par;toujours;priorite;niveau_si_mpakonnen;question_ht;source;statut;note`. Reprendre les 46 questions de `symptomes.csv` et ajouter les questions de durée / évolution / contexte (30 à 40 au total visées).
2. **`regles.csv`** : `id;priorite;conditions;niveau;raison_ht;consignes;source;statut;note`.
   Syntaxe des conditions, volontairement minimale pour être lisible par le vétérinaire :
   ```
   sym:vomissements & rep:q_vomit_24h=wi                → konsilte
   sym:ne_mange_plus & espece:chat & rep:q_jeun_24h=wi  → konsilte
   sym:diarrhee & age:jenn                              → konsilte
   ```
   `&` seulement (pas de « ou » : écrire deux règles). Les règles `alerte_<id>` et `prudence_<id>` ne s'écrivent **pas** : le script les génère.
3. **Script de conversion** `tools/content/build.mts` (Node 24 exécute le TypeScript directement : `node tools/content/build.mts`), script npm `"content"` :
   - lit les CSV (BOM, guillemets, `;`), produit `content/*.json` et `content/version.json` ;
   - **échoue** si : id en double, référence cassée (symptôme, question ou consigne inconnue), texte vide, niveau invalide, condition illisible ;
   - affiche un **rapport** : nombre d'éléments par fichier et par statut.
4. Consignes et toxiques v1 convertis ; ajouter les consignes « signes de retour » manquantes.

✅ `npm run content` régénère `content/` sans erreur ; une référence cassée volontaire fait échouer le script ; D1 a remplacé l'échantillon par le vrai contenu.

> **Fait le 15 nov.** — 55 questions (dont 9 de durée / évolution), 22 règles écrites à la main + 77 générées (99 au total, version 0.3.0), 8 consignes ajoutées (eau, notes, repos, 5 « signes de retour »). Les colonnes de question ont quitté `symptomes.csv` : `questions.csv` est la seule source. Les seuils de durée sont marqués « Aucune (seuil proposé) » : aucune source ne les fixe encore. Le script produit aussi `content/lexique.json`, `tests/cas/cas.json` et `tests/cas/phrases-niees.json`. Reste pour D1 : brancher E23 / E30 / E31 sur `evaluate()`.

#### Étape 5 — Jeu de cas automatique et contrôle du contenu ⏱ 1 jour · 🧩 `ecc:eval-harness`, `ecc:ai-regression-testing`
1. `cas_test.csv` → `tests/cas/cas.json` (même script). Monter à **90 cas ou plus** : chat mâle, chiot, « m pa konnen », négations, transcriptions sans accents.
2. `tests/cas/moteur.test.ts` — **le moteur seul** : entrée = `symptomes_attendus`, réponses données par un « oracle » (wi si la question porte sur un symptôme attendu, sinon non). Exigence : **100 % des cas d'alerte en 🔴** et 100 % des niveaux attendus des cas `validé`.
3. `tests/cas/chaine.test.ts` — **lexique + moteur** (avec `lexique.ts` de D2) : rappel des symptômes ≥ 80 %, aucun cas d'alerte qui finit sous 🔴, aucune détection sur les phrases `polarite = neg` de la banque. Rapport imprimé par cas raté.
4. `tests/contenu.test.ts` — **contrôle des textes affichés** (tous les champs `ht` et `fr`) :
   - doses et quantités : chiffres suivis de `mg`, `ml`, `g`, `kg`, `comprimé`, `grenn`, `gout`, `kiyè`… → 0 ;
   - liste de **noms de maladies** et de médicaments à donner (parvovirose, leptospirose, gale, FLUTD, paracétamol…) → 0, sauf l'exception « rage / raj » du module E40.
5. Brancher ces tests dans `npm test` : ils tournent **à chaque fusion** qui touche le triage, le contenu ou l'IA.

✅ `moteur.test.ts` 100 % vert ; `chaine.test.ts` donne un chiffre de rappel (noté pour D2 et pour le pitch) ; `contenu.test.ts` à 0.

> **15 nov. — application en créole seulement.** Colonnes françaises retirées des tableurs, `Text` devient une simple chaîne, 161 entrées françaises du lexique et 105 phrases françaises de la banque supprimées, les 13 cas en français traduits en créole (à relire). Contenu passé en version 0.4.0.
>
> **Fait le 15 nov.** — 93 cas (18 ajoutés), colonne `reponses` pour les questions de durée et de doute. Les 93 cas donnent le niveau attendu ; le jeu de cas a révélé un trou (chat mâle, « m pa konnen » sur l'urine → 🟠), corrigé. Le contrôle des textes a trouvé deux noms de maladie (« gale », « kansè ») dans des noms de toxiques, reformulés. **`chaine.test.ts` est en attente** de `src/ai/lexique.ts` (D2), signature `detectWithLexicon(text): string[]` (créole seulement) : la suite s'activera seule.

#### Étape 6 — Corrections, envoi au vétérinaire, jalon J1 ⏱ ½ jour · 🧩 `anthropic-skills:xlsx`
1. Corriger les règles et niveaux d'après les cas ratés.
2. Préparer le **classeur de relecture** (un onglet par fichier : symptômes, questions, règles, consignes, toxiques) avec une colonne « D'accord ? / Correction » ; en tête, la **liste des points à trancher** (§7).
3. Envoyer au vétérinaire et aux locuteurs (onglets HT seulement pour eux).
4. Aider D1 à brancher E23, E30, E31 sur le vrai moteur.

✅ **Jalon J1 (mer. 18 au soir)** — parcours clavier en mode avion sur le téléphone, branché sur le vrai moteur et le vrai contenu ; les 45 cas d'alerte et plus aboutissent à 🔴 ; classeur envoyé.

> **Classeurs prêts le 15 nov.** — `relecture/Sanimo-relecture-veterinaire-v0.5.0.xlsx` (14 points à trancher, puis un onglet par fichier et les cas de test) et `relecture/Sanimo-relecture-creole-v0.5.0.xlsx` (224 textes créoles, dont les 17 clips d’écran ; consignes de relecture en créole). Régénération : `python tools/content/relecture.py` (nécessite `openpyxl`). **Reste à faire par D3** : les envoyer, et aider D1 à brancher le moteur.

### Phase 2 — La voix de bout en bout (jeu. 19 → dim. 22 nov.)

#### Étape 7 — Textes des clips figés ⏱ ½ jour
1. `clips.csv` : `id;ecran;texte_ht;source_contenu;statut`. Un clip par : avertissement (E02), chaque question (E23), chaque niveau (E30), chaque consigne affichée (E31), module rage (E40), message toxiques (E41), écran Ijans (E11). Cible 80 à 150.
2. Phrases **courtes** (une idée par clip, ≤ 15 s lues) ; le texte du clip est **identique** au texte affiché.
3. Remettre la liste à D2 pour la génération avec Fatiman.

✅ `content/clips.json` généré, chaque `clipId` référencé par une question ou une consigne existe ; liste remise à D2 le jeudi 19 à midi.

> **Fait le 15 nov.** — `content/clips.json` : **133 clips** (contenu 0.5.0), 33 mots au plus (≈ 13 s).
> - **116 clips de contenu, générés** (jamais écrits à la main) : `clip_q_*` une par question (E23), `clip_c_*` une par consigne (E31, ou E40 pour la rage), `clip_t_*` un par message de toxique (E41). Le convertisseur remplit `clipId` dans `questions.json`, `consignes.json` et `toxiques.json`.
> - **17 clips d'écran** dans `content-sources/clips.csv` : E02 (avertissement), E03 (pack IA), E10, E20, E21, E22, E30 (un par niveau), E11, E40, E41. Colonne `source_contenu` = `i18n:<clé>` quand le texte est déjà dans `src/i18n/ht.ts`, ou `ecran` pour les 3 textes nouveaux (E11, E40, E41) que D1 affiche depuis `content/clips.json`.
> - `tests/clips.test.ts` vérifie que le texte de chaque clip est **identique** au texte affiché (contenu et `ht.ts`) : si D1 change un texte d'écran, le test casse et le clip doit être régénéré.
> - **Pour D2** : générer `assets/clips/<id>.mp3` pour chaque entrée de `content/clips.json` (champ `text`). Les rejouer à chaque nouvelle version du contenu ; le champ `status` dit ce qui a été relu.
> - **Pour D1** : bouton « Koute » = jouer `assets/clips/<clipId>.mp3` ; clip d'écran = chercher l'id `clip_e<nn>_*` correspondant.
> - Les raisons affichées sur E30 (`reasons`) n'ont pas de clip : seul le sens du niveau est lu. À revoir si le temps le permet.

#### Étape 8 — Créole relu, clips écoutés, cas enregistrés ⏱ 1 jour (surtout coordination)
1. Intégrer les corrections des locuteurs : statut `brouillon` → `relu_ht`.
2. Faire **écouter les clips** générés par D2 à un locuteur : prononciation, débit, mots mal lus → corrections de texte ou d'orthographe phonétique.
3. Faire **enregistrer les cas** à voix haute (3 voix ou plus, téléphone, pièce normale, bruit ambiant réaliste) : `tests/cas/audio/<cas>_<voix>.wav`, **hors du dépôt public** si les personnes ne consentent pas à la publication (demander l'accord par écrit).

✅ Tous les textes HT des écrans P0 en `relu_ht` ; clips refaits si besoin ; au moins 20 cas enregistrés × 3 voix remis à D2.

> **Outils prêts le 16 nov.** — reste la partie humaine (locuteurs, voix, clips audio de D2).
> - **Corrections créoles** : `python -I tools/content/import_creole.py <classeur rempli>.xlsx [autres…] [--dry-run]` reporte « Kreyòl korije » dans les CSV et passe le statut en `relu_ht` (« OK » = texte gardé ; un toxique ne passe en `relu_ht` que si son nom et son message sont relus). Les commentaires vont dans `note`. Deux relecteurs en désaccord, ou un texte modifié depuis l'envoi : ligne ignorée et signalée. Les clips d'écran liés à `src/i18n/ht.ts` y sont corrigés aussi (prévenir D1). Puis `npm run content && npm test`. Testé sur deux faux classeurs.
> - **Enregistrement des cas** : `relecture/Sanimo-anrejistreman-ka-v0.5.0.xlsx`, tout en créole. 24 récits (pièges, négations, un cas par signe d'alerte, quelques cas non alarmants), 4 colonnes de voix, un onglet **Dakò** (accord écrit, publication oui / non). Fichiers `ct_xxx_v1.m4a`. **Les enregistrements ne vont jamais dans le dépôt** (public) : `tests/cas/audio/`, `*.m4a` et `*.wav` sont dans `.gitignore` ; les remettre à D2 directement.
> - **Écoute des clips** : `relecture/Sanimo-ekoute-klip-v0.5.0.xlsx`, 133 lignes (texte, fichier `assets/clips/<id>.mp3`, « Byen pwononse ? », mots mal lus, vitesse, commentaire). À envoyer quand D2 a généré les clips.

#### Étape 9 — Retours du vétérinaire, règles 1.0 ⏱ ½ jour
1. Reporter chaque retour dans les CSV, colonne `note` = décision prise.
2. Statut `validé` pour tout ce que le vétérinaire a accepté ; `rulesVersion` passe à `1.0`.
3. Mettre à jour les `niveau_attendu` des cas non alarmants ; relancer tout le jeu de cas.

✅ Contenu P0 (symptômes, questions, règles, consignes urgence / rage / toxiques) en `validé`, ou liste écrite de ce qui ne l'est pas (annoncé dans la démo).

#### Étape 10 — Test du parcours à la voix ⏱ ½ jour (avec D2)
1. Passer les cas enregistrés dans la chaîne Oswald → Makandal + lexique → moteur.
2. Mesurer : symptômes retrouvés (objectif ≥ 80 %), cas d'alerte ratés (objectif 0), temps fin de parole → symptômes (< 10 s).
3. Ajouter au lexique les **formes réelles** produites par la reconnaissance vocale.

✅ **Jalon J2 (dim. 22 au soir)** — tableau de mesures voix dans `tests/cas/RESULTATS.md` ; aucun cas d'alerte à la voix qui finit sous 🔴 une fois les symptômes confirmés.

### Phase 3 — Compléments et gel (lun. 23 → mar. 24 nov.)

#### Étape 11 — Annuaire et toxiques locaux ⏱ 1 jour (appels commencés dès lun. 16)
1. **Annuaire** `veterinaires.csv` : `id;nom;commune;departement;adresse;telephone;whatsapp;horaires;urgences_24h;especes;date_verification;verifie_par;accord_publication;statut;note`. **≥ 15** cliniques, chacune **appelée** pour vérifier le numéro et demander l'accord d'être listée. Commencer par Port-au-Prince, Pétion-Ville, Delmas, Tabarre, Cap-Haïtien, Les Cayes. Faire **4 à 5 appels par jour** à partir du lundi 16 pour ne pas tout faire le 23.
2. **Toxiques locaux** avec le vétérinaire : kleren, pesticides et raticides vendus sur les marchés, produits de nettoyage courants, plantes toxiques présentes en Haïti. Noms créoles dans `noms_locaux_a_completer`. Aucun ajout sans confirmation du vétérinaire.
3. Contenu rage (E40) : qui contacter en Haïti après une morsure (centre de santé, MSPP) — **numéros vérifiés uniquement**.

✅ ≥ 15 vétérinaires `validé` avec date de vérification ; toxiques locaux ajoutés ou liste « à confirmer » écrite.

#### Étape 12 — README et liste des outils ⏱ ½ jour · 🧩 `ecc:update-docs`, `ecc:opensource-sanitizer`
README v1 ([PLAN §11](../PLAN-SANIMO.md)) :
1. Problème, démo (captures, lien vidéo), installation de l'APK, architecture (schéma du PLAN §2.2), garanties de sûreté (§2 ci-dessus).
2. **Limites honnêtes** : pas de diagnostic, contenu partiellement validé, pack IA de 1,7 Go, Android seulement, mesures sur 3 Go.
3. **Sources cliniques et licences** : Merck, Cornell, ASPCA, OMS, CDC ; VetClaw (MIT) ; can-my-dog-eat (MIT) ; **mention visible obligatoire du corpus CMU** (texte exact dans [content-sources/LISEZMOI.md](../content-sources/LISEZMOI.md)) ; Oswald (Apache-2.0), Makandal (licence Gemma), Fatiman (CC-BY-4.0) ; Expo, `llama.rn`, ONNX Runtime ; **outils d'IA utilisés pendant le développement**.
4. Avertissement « Sanimo pa ranplase yon veterinè ».
5. Passe `ecc:opensource-sanitizer` avant de rendre le dépôt public (pas de numéro personnel, pas d'enregistrement sans accord, pas de clé).

✅ **Gel (mar. 24 au soir)** — README relu par D1 et D2 ; jeu de cas vert ; contenu figé : ensuite, seulement des corrections de texte.

### Phase 4 — Pitch et démo (mer. 25 → jeu. 26 nov.)

#### Étape 13 — Pitch, démo et soumission ⏱ 1,5 jour · 🧩 `ecc:article-writing`, `anthropic-skills:pptx`
1. **Texte du pitch** en 3 minutes, sur le déroulé du [PLAN §10](../PLAN-SANIMO.md). Chiffres à placer, **tous mesurés, aucun inventé** : nombre de symptômes et de règles, % des cas d'alerte en 🔴 (100 %), rappel des symptômes à la voix, temps sur téléphone (de D2), nombre de cas, statut de validation.
2. **5 à 6 diapositives** : problème → démo en mode avion → comment c'est fait (3 modèles créoles + règles) → sûreté (pas de diagnostic, le modèle ne peut pas abaisser le niveau) → limites et suite (validation, terrain, élevage 2027).
3. **Cas de démo** choisis et figés avec D1 : le chat mâle bloqué (🔴), un cas 🟢 (chien qui se gratte), le module rage. Les rejouer 3 fois en mode avion.
4. Réponses préparées aux questions probables du jury : « Et si l'IA se trompe ? », « Qui a validé ? », « 1,7 Go, c'est trop ? », « Pourquoi pas un diagnostic ? ».
5. **Soumission préparée** : lien du dépôt, lien de l'APK, README, liste des outils, vidéo de secours.

✅ Pitch chronométré 2 fois sous 3 min ; diapositives et vidéo de secours sur clé USB et en ligne ; formulaire de soumission prêt à envoyer.

---

## 6. Calendrier de D3 en un coup d'œil

| Date | Étapes | Fin de journée |
|---|---|---|
| **Sam. 14** | 0 · 1 · 2 | Organisateurs, vétérinaire et locuteurs relancés ; contrat + échantillon remis à D1 ; Jest + 27 signes d'alerte testés ; **décisions A1–A4** à 3 |
| **Dim. 15** | 3 | Moteur complet : questions, « m pa konnen », durée, niveau final |
| **Lun. 16** | 4 | Questions, règles, consignes, toxiques en CSV → JSON ; script de conversion ; **premiers appels vétérinaires (annuaire)** |
| **Mar. 17** | 5 | Jeu de cas 90+, tests automatiques « 100 % des alertes en 🔴 », contrôle doses / maladies |
| **Mer. 18** | 6 | Corrections ; classeur envoyé au vétérinaire et aux locuteurs — **Jalon J1** |
| **Jeu. 19** | 7 | Textes des clips figés et remis à D2 ; début des enregistrements de cas |
| **Ven. 20** | 8 | Écoute des clips ; créole relu |
| **Sam. 21** | 9 | Retours du vétérinaire ; statuts `validé` ; règles 1.0 |
| **Dim. 22** | 10 | Test du parcours à la voix avec les cas enregistrés — **Jalon J2** |
| **Lun. 23** | 11 | Annuaire ≥ 15 vérifié ; toxiques locaux |
| **Mar. 24** | 12 | README v1 ; liste des outils et licences — **Gel** |
| **Mer. 25** | 13 | Pitch et diapositives ; démo répétée 3 fois ; vidéo de secours (avec D1) |
| **Jeu. 26** | 13 | Pitch chronométré 2 fois ; soumission prête |

---

## 7. Points à trancher avec le vétérinaire

Repris de [content-sources/LISEZMOI.md](../content-sources/LISEZMOI.md) et complétés par le moteur ; à mettre **en tête** du classeur de relecture.

1. `chiot_vomit_diarrhee` : signe d'alerte (🔴) ou 🟠 ?
2. Œil douloureux et fermé : 🟠 ou 🔴 ?
3. Toxiques à niveau discuté : macadamia, caféine, oignon / ail, huiles essentielles (🔴 ou 🟠).
4. **Seuils de durée** proposés : vomissements 24 h, diarrhée 48 h, chat sans manger 24 h, chien sans manger 48 h, boiterie 24 h, toux ou nez qui coule 1 semaine ; aussi mise bas difficile et « vomit sans arrêt » (combien de fois ?).
5. **« M pa konnen »** : pour quels signes d'alerte le doute doit-il donner 🔴 plutôt que 🟠 ? En particulier respiration, gencives, effondrement, toxique. (Déjà 🔴 : chat mâle ou de sexe inconnu, urine.)
6. Aucun symptôme et que des « non » : 🟢 est-il acceptable ?
7. Chaton qui vomit et a la diarrhée : 🟠 aujourd'hui, alors que le chiot est en 🔴.
8. Jeune animal qui ne boit plus : 🟠 ou 🔴 ?
9. Coup de chaleur : question de base posée à chaque évaluation (climat d'Haïti) ?
10. Liste des questions de base : respiration, effondrement, toxique, urine (chat mâle). À compléter ?
11. Toxiques et plantes propres à Haïti.
12. Qui contacter en Haïti après une morsure.
13. Annuaire : vétérinaires à ajouter.
14. Écran Toxiques (E41), texte lu : produit absent de la liste et doute → aller tout de suite chez le vétérinaire. D'accord ?

Ces 14 points (avec l'annuaire) sont en tête du classeur `relecture/Sanimo-relecture-veterinaire-v0.5.0.xlsx`.

---

## 8. Risques propres à D3

| Risque | Parade |
|---|---|
| Le vétérinaire ne répond pas à temps | Relance jeu. 19 ; démo sur les signes d'alerte **reconnus** (Merck, ASPCA) ; contenu annoncé « en cours de validation » ; le dire dans le pitch |
| Créole des brouillons IA peu naturel | Locuteurs dès lundi ; priorité aux textes **lus à voix haute** (clips, questions, niveaux) |
| Trop de questions, l'utilisateur abandonne | 4 questions de base au plus ; plafond de 10 questions de suivi (les questions d'alerte ne sont jamais coupées) ; mesurer le nombre moyen de questions sur le jeu de cas |
| Un changement de règle casse un cas d'alerte | Jeu de cas obligatoire à chaque fusion ; la règle d'alerte est générée, pas écrite |
| Faux positifs du lexique (« san », *pis*, *lay*, *tous*) | Expressions plutôt que mots seuls ; c'est l'utilisateur qui confirme ; tests sur les phrases niées |
| Annuaire faux ou périmé | Appel de chaque numéro ; date de vérification affichée ; accord de publication |
| Données personnelles (voix enregistrées, numéros) dans le dépôt public | Enregistrements hors du dépôt sans accord écrit ; passe `ecc:opensource-sanitizer` avant publication |
| D3 porte trop de coordination (vétérinaire, locuteurs, organisateurs, pitch) | Appels groupés le matin ; le code du moteur d'abord (jours 14 → 17), la coordination ensuite |

---

## 9. Points à valider avec l'équipe (samedi 14 au soir)

1. Ajouts facultatifs au contrat : `modelLevel` dans l'entrée, `progress` dans la sortie (§4.1).
2. Format JSON de `content/` et `src/triage/content-types.ts` (§4.2).
3. Renommer `donnees/` en `content-sources/` ; le JSON généré est commité dans `content/`.
4. ~~Plafond de 8 questions par évaluation.~~ Remplacé le 15 nov. : questions d'alerte jamais coupées, 10 questions de suivi au plus (étape 3).
5. D3 installe Jest aujourd'hui ; D1 le réutilise.
6. `src/ai/lexique.ts` reste à D2 ; D3 fournit `content/lexique.json` et les tests de négation tirés de la banque de phrases.
