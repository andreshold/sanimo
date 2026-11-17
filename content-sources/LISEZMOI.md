# Données Sanimo — extraction v1 (chien et chat)

Extraction du 12 novembre 2026, faite à partir de VetClaw et de sources complémentaires. Voir [docs/07](../docs/07-Plan-VetClaw-creole.md).

Ces fichiers sont des **jeux de données** (autorisés avant le hackathon) et non du code. Format : CSV UTF-8, séparateur `;`. Ils s'ouvrent directement dans Excel ou LibreOffice.

| Fichier | Contenu | Lignes |
|---|---|---|
| `symptomes.csv` | Liste fermée des symptômes, avec signe d'alerte, niveau minimal et question oui/non | 46 |
| `toxiques.csv` | Aliments, médicaments humains, produits et plantes dangereux | 23 |
| `consignes.csv` | À faire / à ne pas faire : général, urgence, toxiques, plaies, chaleur, convulsions, rage | 30 |
| `banque_phrases.csv` | Façons dont un propriétaire décrit chaque symptôme, à l'oral (créole) | 683 |
| `lexique.csv` | Mots-clés et expressions par symptôme (repli toujours actif), avec variantes normalisées | 232 |
| `cas_test.csv` | Récits complets avec symptômes et niveau attendus | 93 |
| `questions.csv` | Questions oui / non, ordre, « m pa konnen » | 55 |
| `regles.csv` | Règles écrites à la main (durée, âge, combinaisons) | 22 |
| `clips.csv` | Textes lus à voix haute propres aux écrans (les autres clips sont générés depuis le contenu) | 17 |

**L'application est entièrement en créole** (décision du 15 nov.) : les colonnes et lignes en français ont été retirées. Seules `note` et `source` restent en français (jamais affichées).

## Lexique
- Au moins 5 termes par symptôme. `variantes_normalisees` donne les formes en minuscules, sans accents, avec *lap* / *chyen* / *zye*.
- Ce sont des **expressions plutôt que des mots seuls**, parce que **« san » veut dire à la fois « sang » et « sans »** en créole (« dyare ak san » contre « manje san pwoblèm »).
- La colonne `note` signale les termes à risque de faux positif (*pis*, *lay*, *tous*, *boule*, *kache*, *bave*…). Le lexique s'ajoute au modèle (union) ; c'est **l'utilisateur qui confirme** les symptômes détectés.
- Les négations (« li pa vomi ») ne sont pas gérées par le lexique seul : c'est à prévoir dans la normalisation (TRD §5.1).

## Cas de test
- 93 cas, tous en créole (à l'origine 75 cas : 45 `alerte`, 23 `non_alerte`, 5 `piege`, 2 `negation` ; 18 ajoutés en phase 1, et les 13 cas écrits en français traduits en créole).
- **Chacun des 27 signes d'alerte a au moins un cas**, et tous les cas d'alerte attendent `ijans`. C'est le jeu qui doit donner 100 % de 🔴 (PRD §5.2).
- Le style est oral : formules d'introduction (« Bonjou, m pa konnen sa pou m fè… »), plusieurs symptômes à la fois, et transcriptions sans accents ni ponctuation (`ct_065`, `ct_066`).
- **Pièges** : chien qui halète après l'effort, bave devant la nourriture, toxique cité mais nié, « san » au sens de « sans ».
- Le `niveau_attendu` des cas non alarmants est **proposé** : il dépend des règles de durée, pas encore écrites, et doit être validé par le vétérinaire. Il reste aussi à **enregistrer ces récits à voix haute** (3 voix ou plus) pour tester la reconnaissance vocale (D1).

## Banque de phrases
Elle sert au modèle de compréhension (embeddings ou classifieur) et au réglage du seuil.

| Colonne | Valeurs |
|---|---|
| `symptome_id` | Renvoie à `symptomes.csv` (les 46 sont couverts) |
| `type` | `base` (formulation écrite à la main, avec plusieurs sujets : *chen an*, *chat la*, *bèt la*…) · `avec_duree` (+ « depi ayè », « sa fè twa jou »…) · `variante_ortho` (sans accents, *lap*, *chyen* : imite une transcription vocale imparfaite) · `negation` |
| `polarite` | `pos` ; `neg` = la phrase **nie** le symptôme (« li pa vomi »). Elle sert à vérifier que le modèle ne la confond pas avec la phrase positive |

- Les phrases de base viennent d'un premier jet par IA. Les mots et tournures suivent le **glossaire et le corpus médical créole CMU** (*vantmennen*, *tata dlo*, *souf kout*, *endispoze*, *depi kilè*…). Aucune phrase CMU n'est reprise telle quelle : elles parlent de médecine humaine.
- **À enrichir** : `oeil_sorti` (5 phrases), `organe_sorti` (8), `plaie_profonde_os` (9), `saignement_important` et `puces_tiques` (10), contre 15 à 30 visés. Il faut aussi ajouter les **vraies formulations** recueillies auprès de propriétaires et les **sorties réelles** de la reconnaissance vocale.
- Les phrases sont générées à partir des formulations de base par un script de préparation de données, gardé hors du dépôt (règle « pas de code avant l'événement »). Les corrections se font directement dans le CSV.

## Colonnes communes
- `id` : identifiant `snake_case` stable, le même dans le contenu, le code et la base (plan 06 §7).
- `especes` : `chien`, `chat` ou `chien,chat` (`humain` pour les consignes rage qui concernent la personne mordue).
- `niveau_min` / `niveau` : `ijans` (🔴), `konsilte` (🟠), `siveye` (🟢). Pour les symptômes non alarmants, le niveau final dépend des règles de durée et d'évolution, qui restent à écrire.
- `*_ht` (`libelle_ht`, `question_ht`, `texte_ht`…) : **premier jet en créole rédigé par une IA (Claude)**. Il doit être **réécrit par un locuteur natif** et l'usage de l'IA est à déclarer dans la liste des outils.
- `source` : compétence VetClaw (`VetClaw:nom-de-la-competence`), `can-my-dog-eat (MIT)`, `Synthèse §x` (notre recherche) ou `Aucune` (fait ajouté, absent de VetClaw).
- `recoupe_avec` : source reconnue qui confirme le fait, ou `à recouper`.
- `statut` : `brouillon` → `relu_ht` (locuteur natif) → `validé` (vétérinaire). Rien ne passe en production sans `validé`.

## Règles appliquées
- Aucune dose, aucune quantité seuil, aucun nom de médicament à donner dans les colonnes affichées.
- Aucun nom de maladie dans les textes visibles. Les termes cliniques (GDV, FLUTD…) restent seulement dans `source` et `note`, pour la traçabilité.
- Décision V1 appliquée : **toute ingestion d'un toxique de la liste → 🔴**, sans calcul selon le poids.

## À trancher avec le vétérinaire (colonne `note`)
- Niveaux discutés : chiot qui vomit et a la diarrhée (🔴 proposé), œil douloureux (🟠 ou 🔴), macadamia, caféine, oignon/ail, huiles essentielles (🔴 ou 🟠).
- Seuils de durée : vomissements répétés, mise bas difficile, ne mange plus.
- Toxiques et plantes propres à Haïti (épis, kleren, pesticides, mort-aux-rats vendues localement, plantes toxiques) : VetClaw ne les couvre pas.
- Contacts : qui prévenir en Haïti après une morsure. Les numéros ASPCA (États-Unis) ne sont pas repris.

## Sources et licences
- **VetClaw** (OpenVet AI), MIT : <https://github.com/OpenVet-Projects/VetClaw>
- **can-my-dog-eat** (Trinityyi), MIT : <https://github.com/Trinityyi/can-my-dog-eat> (aliments toxiques pour le chien)
- Signes d'alerte et rage : notre [synthèse de recherche](../recherche/synthese-recherche.md) (Merck, Cornell, ASPCA, OMS, CDC)
- Aucun texte de l'ASPCA n'est copié : les faits sont reformulés.
- **CMU LTI Haitian Creole Text Data** : Language Technologies Institute, Carnegie Mellon University, © 2010. Phrases médicales du projet NESPOLE!, traduites par Eriksen Translations, Inc. <http://www.speech.cs.cmu.edu/haitian/text/>. Utilisé comme référence de vocabulaire et de tournures ; les phrases de la banque sont **modifiées** (adaptées à l'animal). La licence exige de **mentionner visiblement cette provenance** dans tout travail publié : à reprendre dans le README de Sanimo.
