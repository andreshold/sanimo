# Sanimo — Intégrer VetClaw et produire le savoir en créole

| | |
|---|---|
| Version | 0.1 (brouillon) |
| Date | 12 novembre 2026 |
| Source analysée | [OpenVet-Projects/VetClaw](https://github.com/OpenVet-Projects/VetClaw) v0.1.0 (licence MIT, 51 compétences, ~7 200 lignes, en anglais) |
| Documents liés | [PRD](01-PRD.md) · [TRD](02-TRD.md) · [Plan d'implémentation](06-Plan-implementation.md) · [Synthèse de recherche](../recherche/synthese-recherche.md) |

---

## 1. Ce qu'est VetClaw (et ce qu'il n'est pas)

**C'est :** une bibliothèque de « compétences » (`SKILL.md`) : des **consignes de raisonnement en anglais** écrites pour un grand modèle de langue (OpenClaw, Hermes, Claude…). Chaque fichier dit *quand* l'utiliser, *comment raisonner*, *quoi produire*. Plus : un tableau de toxicité par espèce, un index JSON, un schéma de métadonnées et une revue clinique sourcée (`docs/clinical-review-2026.md`).

**Ce n'est pas :**
- **pas des données en créole** : tout est en anglais ;
- **pas un modèle** ni un jeu d'entraînement : ce sont des textes de référence ;
- **pas utilisable tel quel hors ligne sur un téléphone** : ces consignes supposent un gros modèle qui lit 100 à 300 lignes de prompt, souvent avec accès Internet (openFDA, PubMed) ;
- **pas destiné aux propriétaires** : la cible est le vétérinaire. On y trouve des **posologies**, des protocoles de réanimation et des diagnostics nommés, que Sanimo s'interdit (PRD §6.2).

**Conclusion :** VetClaw ne s'exécute pas dans Sanimo. On s'en sert **pendant la préparation** comme **source de savoir**. On en extrait des faits, on les filtre selon les règles de Sanimo, on les traduit en créole, puis on les transforme en **contenu** (règles, questions, consignes, phrases) que nos modèles créoles utilisent sur le téléphone.

```
VetClaw (EN, pour vétérinaires)
   │  1. extraire les faits utiles
   ▼
Fiches de savoir (EN/FR, une idée = une ligne, source citée)
   │  2. filtrer : observable par le propriétaire, ni diagnostic ni dose
   ▼
   │  3. traduire et adapter en créole oral, relu par un locuteur natif
   ▼
Contenu Sanimo (HT/FR) ──┬─► regles.json      → moteur de triage (déterministe)
                         ├─► questions.json   → questions oui/non lues à voix haute
                         ├─► consignes        → textes + clips audio (TTS)
                         ├─► banque_phrases   → embeddings / classifieur créole
                         ├─► lexique          → repli par mots-clés
                         └─► cas_test         → mesure des modèles + tests des règles
```

---

## 2. Tri des 51 compétences pour Sanimo

### 2.1 À utiliser pour le MVP (chien, chat)

| Compétence VetClaw | Ce qu'on en tire | Fichier Sanimo |
|---|---|---|
| `clinical/emergency-triage` | Catégories ROUGE / JAUNE / VERT → 🔴 Ijans / 🟠 Konsilte / 🟢 Siveye ; liste « Do NOT » ; mots-clés d'urgence | `regles`, `consignes`, `lexique` |
| `safety/toxicology-calculator` | Liste des toxiques courants (chocolat, xylitol, raisin, lys, antigel, cannabis, noix de macadamia) | `symptomes` (ingestion), `regles` (→ 🔴), `consignes` |
| `safety/lethal-variance-detection` + `assets/species-drug-safety-matrix.md` | **Médicaments humains mortels** selon l'espèce : paracétamol (chat), perméthrine (chat), 5-FU, lys (chat) | Module « Pa bay medikaman moun » ; règle « médicament humain donné → 🔴 » |
| `safety/nsaid-safety`, `safety/contraindication-checker` | Interdits de l'automédication (anti-inflammatoires humains) | `consignes` (à ne pas faire) |
| `species/feline-medicine` | Spécificités chat : respiration bouche ouverte, chat qui se cache, chat mâle qui n'urine plus, sensibilité aux toxiques | `regles` par espèce, `questions` |
| `species/canine-medicine`, `species/breed-predisposition` | Torsion d'estomac chez les grandes races, coup de chaleur chez les races à nez court | `questions` conditionnelles (taille, race) |
| `species/species-aware-reasoning` | Principe « l'espèce d'abord » | Règle de conception : aucune consigne sans espèce |
| `clinical/pain-assessment` | Signes de douleur visibles par un propriétaire (posture, cachette, refus de bouger, agressivité) | `symptomes`, `banque_phrases` |
| `clinical/wound-management` | Plaies, morsures, saignements : quoi faire en attendant | `consignes` trauma |
| `clinical/vaccination-protocols` | Rage = vaccin essentiel du chien et du chat | Module rage (prévention) |
| `clinical/veterinary-physical-exam` | Gestes simples du propriétaire : couleur des gencives, respiration | `questions` (« Jansiv li blan oswa ble ? ») |
| `clinical/ophthalmology-exam`, `orthopedic-exam`, `dermatology-workup` | Symptômes du niveau 🟠 / 🟢 (œil blessé, boiterie, démangeaisons) | `symptomes`, `regles` |
| `docs/clinical-review-2026.md`, `schema/skill.schema.json` | Format de **traçabilité** : `sources`, `evidence_tier`, `last_reviewed`, `reviewer` | Mêmes colonnes dans nos tableurs |

### 2.2 À garder pour plus tard (persona Rosemène, éleveuse)
`species/ruminant-medicine`, `avian-medicine`, `swine-medicine`, `pharma/withdrawal-times`, `databases/farad-withdrawal` : utiles pour l'extension aux chèvres, porcs et volailles (feuille de route 2027).

### 2.3 À écarter
- **Posologie, traitements de spécialiste** : `anesthesia-*`, `fluid-therapy`, `compounding-guidance`, `veterinary-drug-lookup`, `drug-interaction-checker`, `cardiology-workup`, `laboratory-interpretation`, `dental-grading`, `nutrition-assessment` (à part quelques conseils simples).
- **Recherche et oncologie** : `personalized-oncology-workflow`, `neoantigen-vaccine-design`, `precision-medicine-mrna-design`, tout `literature/*`.
- **API en ligne** : `databases/*`, `sdk/`, `integrations/hermes` : contraires au hors ligne.
- `differential-diagnosis` : produit des diagnostics nommés, interdits.

**Bilan :** environ **15 compétences sur 51**, soit à peu près 1 300 lignes à exploiter. Estimation : 40 à 50 symptômes, 25 à 30 signes d'alerte, 12 à 15 toxiques et médicaments interdits, 60 à 80 consignes.

### 2.4 Mises en garde sur la source
- **Centrée sur les États-Unis** : numéros ASPCA, températures en °F, produits américains. À remplacer par des contacts haïtiens (vétérinaires de l'annuaire, centres de santé pour la rage) et à compléter par les **toxiques locaux** (mort-aux-rats, pesticides agricoles, kleren, plantes locales), qu'un vétérinaire haïtien doit lister.
- **Pas de relecture indépendante des compétences elles-mêmes** : seules les **doses** ont une revue sourcée, et Sanimo ne s'en sert pas. Chaque fait retenu doit être **recoupé** avec Merck, Cornell ou l'ASPCA (déjà cités dans notre recherche), puis validé par un vétérinaire en Haïti.
- **Licence MIT** : réutilisation libre, à condition de garder la mention de copyright. On cite « VetClaw (OpenVet AI), MIT » dans le README et la liste des outils.

### 2.5 Comparaison avec d'autres dépôts (recherche du 12 nov. 2026)
Une recherche approfondie avec vérification croisée n'a trouvé **aucun dépôt meilleur que VetClaw** : aucun jeu de données ouvert et structuré de signes d'alerte ou de triage à 3 niveaux pour chiens et chats, et aucun lexique vétérinaire en créole. Les sources ci-dessous **complètent** VetClaw :

| Source | Apport | Licence | Réserve |
|---|---|---|---|
| [CMU — corpus médical anglais-créole](http://speech.cs.cmu.edu/haitian/text) | ~1 600 phrases médicales EN↔HT : formulations de symptômes et de durées pour la **banque de phrases** | Permissive, attribution | Médecine humaine, vers 2010, alignement à vérifier |
| [Trinityyi/can-my-dog-eat](https://github.com/Trinityyi/can-my-dog-eat) | `foodList.json` : 136 aliments pour chien, dont 21 toxiques | MIT | Chien seulement, sans sources cliniques, arrêté en 2021 |
| [foldaway/toxic-plant-list-scraper](https://github.com/foldaway/toxic-plant-list-scraper) | `toxicPlants.json` (plantes toxiques chien, chat, cheval) | Code MIT, **données ASPCA (tous droits réservés)** | Reformuler les faits, ne pas copier le texte |
| [WHO SMART Immunizations](https://github.com/WorldHealthOrganization/smart-immunizations) | Logique PEP rage (humaine) pour recouper le module rage | CC BY-IGO 3.0 | Brouillon v0.2, pour cliniciens |

**À éviter :** plantsm.art (sans licence) ; VetBERT et PetBERT (diagnostic, données fermées) ; pet-poison-triage sur ClawHub (calculs de doses, aucune source). Le brevet US 10930401 (Petriage, « Pet evaluation and triage system ») est à garder en tête si Sanimo est un jour commercialisé. **Aucune source trouvée pour l'élevage.**

---

## 3. Comment les données deviennent du créole utilisable par nos modèles

L'IA de Sanimo a trois parties (TRD §5). VetClaw, une fois traduit, nourrit chacune d'elles **sans changer d'architecture**.

### 3.1 Étape A : fiches de savoir (anglais → français)
Un tableur `fiches_vetclaw` : **une ligne = un fait** que le propriétaire peut observer ou appliquer.

| id | type | espèce | fait (FR) | niveau | source VetClaw | recoupé avec | statut |
|---|---|---|---|---|---|---|---|
| `cat_open_mouth_breathing` | signe d'alerte | chat | Le chat respire la bouche ouverte | 🔴 | feline-medicine, emergency-triage | Merck | à valider |
| `tox_paracetamol_cat` | toxique | chat | Le paracétamol est mortel pour le chat, même à petite dose | 🔴 | lethal-variance-detection | ASPCA | à valider |
| `dont_induce_vomit` | à ne pas faire | chien, chat | Ne pas faire vomir l'animal sans l'avis d'un vétérinaire | — | toxicology-calculator | ASPCA | à valider |

**Filtre obligatoire** : on supprime toute dose, tout nom de médicament vétérinaire à donner et tout nom de maladie. On garde seulement ce qui se **voit**, se **fait** ou s'**évite** à la maison.

### 3.2 Étape B : adaptation en créole oral
- Premier jet par un modèle de langue ou NLLB-200 (`hat_Latn`), puis **réécriture par un locuteur natif** dans un créole **parlé, simple, au tutoiement** (« Si chat ou ap respire ak bouch li louvri… »).
- **Glossaire commun** fixé avant la traduction pour que les mêmes mots reviennent partout, dans le texte, la voix et la banque de phrases. Exemples à valider : gencives → *jansiv* ; vomir → *vomi* ; convulsions → *kriz* ; ventre gonflé → *vant gonfle* ; uriner → *pipi* ; diarrhée avec sang → *dyare ak san*.
- Orthographe standard (IPN) pour l'affichage, et **variantes courantes** notées à part pour le lexique.

### 3.3 Étape C : six sorties tirées d'une même fiche

| Sortie | Rôle dans Sanimo | Modèle concerné | Volume visé |
|---|---|---|---|
| **Règles** | Niveau minimal garanti (un signe d'alerte → 🔴) | Aucun (déterministe) | 1 règle par signe d'alerte et par toxique |
| **Questions oui/non** | Vérifier les signes d'alerte que la description n'a pas couverts | TTS (lecture) | 30 à 40 |
| **Consignes à faire / à ne pas faire** | Résultat, bouton urgence, module toxiques et rage | TTS (clips pré-générés) | 60 à 80 clips |
| **Banque de phrases** | Façons dont un propriétaire **dit** chaque symptôme, dont des variantes qui imitent les erreurs de transcription | Embeddings ou classifieur créole | 15 à 30 par symptôme (≈ 800 à 1 200) |
| **Lexique** | Repli par mots-clés, toujours actif (union avec le modèle) | Aucun | ≥ 5 variantes par symptôme |
| **Cas de test** | Récits créoles complets avec niveau attendu : mesure D1/D2 et tests des règles | Tous | 60 à 100, dont 100 % des signes d'alerte |

Les compétences VetClaw donnent des **graines** utiles pour la banque de phrases : leurs listes `Keywords` (*collapse, seizure, bloat, ate, swallowed, chewed…*) indiquent ce qu'un propriétaire décrit. On les transpose en récits créoles (« li manje chokola », « li pa ka kanpe », « vant li gonfle epi l ap eseye vomi »).

### 3.4 Branchement sur nos modèles créoles existants

| Modèle | Ce que VetClaw lui apporte | Comment |
|---|---|---|
| **Reconnaissance vocale créole** (Whisper ou modèle déjà adapté) | Vocabulaire vétérinaire | (1) Mesurer sur les cas de test lus à voix haute. (2) Donner le glossaire en *prompt initial* pour orienter la transcription. (3) Si on peut réentraîner : enregistrer la banque de phrases (3 voix ou plus) et affiner sur ce vocabulaire. |
| **Compréhension** (embeddings ou classifieur) | La liste fermée de symptômes et leurs formulations | Embeddings de la banque calculés à la construction et livrés avec le contenu ; ou entraînement d'un classifieur multi-étiquettes sur banque + cas (D2). Sortie : **identifiants de symptômes**, jamais du texte libre. |
| **Synthèse vocale créole** | Les textes des consignes et questions | Clips pré-générés (ElevenLabs ou MMS), écoutés par un locuteur natif (TRD §5.4). |
| **Petit LLM créole génératif** (si vous en avez un) | Option seulement | **Hors du chemin de sécurité.** Il peut reformuler ou expliquer une consigne **déjà validée** (RAG sur les fiches), mais il ne fixe jamais le niveau. Sur Android d'entrée de gamme, c'est probablement trop lourd pour le hackathon. |

**Pourquoi ne pas mettre les compétences VetClaw dans un LLM sur le téléphone ?** Elles demandent un modèle de la taille de GPT-4 ou Claude pour être suivies correctement, elles sont en anglais, elles contiennent des doses, et un petit modèle hors ligne peut inventer des réponses. Le principe de Sanimo (« les modèles proposent, les règles garantissent ») exige du contenu **fermé et relu**.

---

## 4. Calendrier (avant le hackathon, sans code)

> Règle de l'événement : aucun code avant le 27 novembre ; les **jeux de données** sont autorisés. Tout ce qui suit produit des **tableurs et des textes**. L'aide d'un outil d'IA pour extraire ou traduire est à **déclarer** dans la liste des outils et à confirmer avec l'organisation (D5).

| Dates | Étape | Livrable | Responsable |
|---|---|---|---|
| 12–14 nov. | Valider ce tri (§2) ; figer la liste fermée des symptômes | Tableur `symptomes` v1 (identifiants `snake_case`) | C |
| 13–17 nov. | Extraction VetClaw → fiches FR, recoupement Merck/Cornell/ASPCA | **Fait le 12 nov. (v1, chien et chat)** : [`donnees/`](../donnees/LISEZMOI.md), soit 46 symptômes, 23 toxiques et 30 consignes, avec un premier jet créole par IA | C, aidé par l'IA |
| 14–16 nov. | Glossaire créole vétérinaire | `glossaire` (≈ 80 termes) relu par 2 locuteurs | B |
| 15–19 nov. | Traduction et adaptation en créole oral | Colonnes HT de `questions`, `consignes`, textes des clips | C + locuteur natif |
| 15–20 nov. | Banque de phrases, lexique et cas de test en créole | **Banque v1 faite le 12 nov.** : [`banque_phrases.csv`](../donnees/banque_phrases.csv), 788 phrases. **Lexique (393 termes) et cas de test (75) faits le 12 nov.** Restent la relecture par un locuteur natif et l'enregistrement audio des cas | B |
| 17–20 nov. | Tests des modèles sur ces données (playgrounds) : D1 et D2 | Notes D1/D2 avec chiffres | B |
| 18–24 nov. | **Relecture par un vétérinaire haïtien** : signes d'alerte, toxiques locaux, consignes | Colonne `statut = validé` + nom du relecteur | A (contact), C |
| 20 nov. | Réponse de l'organisation sur D5 (données préparées, audios, affinage) | Note D5 | A |
| 21–26 nov. | Gel du contenu v1 ; enregistrements audio de la banque si affinage ASR | Contenu figé, prêt à convertir | Tous |
| 27 nov. (H1–H4) | Tableurs → JSON ; embeddings de la banque ; tests des règles sur `cas_test` | `content/*.json` | C, B |

---

## 5. Critères de réussite

| Critère | Cible |
|---|---|
| Signes d'alerte VetClaw/Merck retenus, traduits et validés | 100 % |
| Cas d'alerte de `cas_test` classés 🔴 par les règles | 100 % |
| Symptômes retrouvés par le modèle de compréhension sur `cas_test` | ≥ 80 % |
| Termes du glossaire compris sans aide par 3 locuteurs | ≥ 90 % |
| Dose, nom de médicament à donner ou diagnostic dans le contenu | 0 |
| Chaque ligne de contenu avec `source` et `statut` | 100 % |

---

## 6. Décisions à prendre

| ID | Question | Proposition |
|---|---|---|
| V1 | Faut-il afficher des **seuils** de toxicité (ex. grammes de chocolat par kg) ? | **Non** : toute ingestion d'un toxique de la liste → 🔴 et appel au vétérinaire. C'est plus simple et plus sûr. |
| V2 | Ajouter un module « **Pa bay medikaman moun** » (paracétamol, ibuprofène, perméthrine) ? | **Oui**, en P1 : il répond au problème n° 2 du PRD (traitements improvisés). |
| V3 | Quels modèles créoles « déjà disponibles » utilise-t-on exactement (nom, taille, licence, tâche) ? | À lister par B : cela fixe le format de la banque de phrases (paires pour embeddings, étiquettes pour classifieur, audio pour ASR). |
| V4 | Toxiques et plantes propres à Haïti | Liste à demander au vétérinaire relecteur ; VetClaw ne les couvre pas. |
