# Sanimo — Plan d'implémentation

| | |
|---|---|
| Version | 0.1 (brouillon) |
| Date | 1er novembre 2026 |
| Basé sur | [PRD v0.2](01-PRD.md) · [TRD v0.1](02-TRD.md) · [App flow v0.1](03-App-flow.md) · [Schéma backend v0.2](05-Backend-schema.md) |
| Équipe | 3 développeurs : **A** (socle et PWA), **B** (IA), **C** (triage, contenu et voix) |
| Échéance | Dimanche 29 novembre, **16 h** |

> **Hypothèse horaire :** le hackathon commence le vendredi 27 novembre à **16 h** (H0) et se termine le dimanche à 16 h (H48). L'heure de début réelle est à confirmer ; décaler tout le plan si besoin.

---

## 1. Vue d'ensemble

| Phase | Dates | Objectif |
|---|---|---|
| **Préparation** (sans code) | 1er – 26 nov. | Tout ce qui n'est pas du code est prêt : décisions IA, contenu, données, annuaire, comptes, pitch |
| **Hackathon** | 27 – 29 nov. | MVP P0 + P1 prioritaires, déployé, démontré en mode avion |
| **Après** | Déc. 2026 → | Tests terrain, validation vétérinaire, retours |

**Règle d'or de la préparation :** on prépare des **tableurs, des textes, des décisions et des comptes**, jamais du code du projet. Tester des modèles dans des démos et playgrounds existants est permis ; écrire des scripts pour Sanimo ne l'est pas.

---

## 2. Rôles

| Rôle | Développeur | Responsabilités pendant le hackathon | Responsabilités en préparation |
|---|---|---|---|
| **Socle et PWA** | A | Projet Vite/React, navigation, i18n, service worker, IndexedDB, file d'envoi, Supabase, déploiement, annuaire, fiche et photos | Comptes et hébergement ; annuaire ; schéma backend ; téléphone de démo |
| **IA** | B | Worker IA, Whisper, embeddings, banque de phrases, lexique, téléchargement du pack, mesures sur téléphone | Tests des modèles (D1, D2) ; banque de phrases ; lexique |
| **Triage, contenu et voix** | C | Moteur de règles et tests, conversion du contenu en JSON, écrans questions / résultat / rage, clips audio et lecteur | Arbre de décision ; consignes FR/HT ; jeu de cas ; textes et génération test des clips (D3) ; pitch |

**Responsable de l'intégration :** A (fusion des branches, déploiement).
**Responsable de la démo et du pitch :** C, avec répétitions à trois.

---

## 3. Préparation (1er – 26 novembre)

### 3.1 Semaine 1 : 1er – 6 novembre

| Tâche | Qui | Livrable |
|---|---|---|
| Suivre la formation obligatoire (les 3) | A, B, C | Présence validée |
| Relire et figer PRD v1, TRD, App flow, schéma | A, B, C | Documents v1 |
| Envoyer les questions à l'organisation : heure de début, format du pitch, livrables, **D5** (données, clips audio, embeddings préparés à l'avance ?) | C | Message envoyé ; réponses consignées |
| Contacter 2 ou 3 vétérinaires : relecture de l'arbre, annuaire, accord pour figurer | A | Liste des contacts, rendez-vous |
| Identifier le **téléphone de démo** (Android d'entrée de gamme, 2–3 Go de RAM) et un téléphone de secours | A | Modèles notés ; versions Android et Chrome |
| Lister les symptômes et signes d'alerte (chien, chat) à partir de Merck, Cornell, ASPCA | C | Tableur `symptomes` v0 (~40 lignes) |

### 3.2 Semaine 2 : 7 – 13 novembre (décisions IA)

| Tâche | Qui | Livrable | Critère |
|---|---|---|---|
| **D1** Tester la reconnaissance vocale créole (Whisper tiny/base/small, MMS) sur 20 phrases enregistrées par 3 voix différentes, via les démos en ligne | B | Note D1 : modèle retenu, taille, qualité | Symptômes retrouvables dans ≥ 80 % des transcriptions |
| **D2** Tester les embeddings multilingues sur 30 paires créole/créole et créole/français (démo en ligne ou playground) | B | Note D2 : modèle et seuil indicatif | Les paires de même sens sont nettement plus proches |
| **D3** Générer 10 phrases créoles avec ElevenLabs et MMS ; faire écouter à 3 locuteurs natifs | C | Note D3 : moteur retenu | Compris sans effort par les 3 |
| Arbre de décision : questions, règles, cas « je ne sais pas » | C | Tableurs `questions` et `regles` v1 | Chaque signe d'alerte mène à 🔴 |
| Consignes à faire / à ne pas faire par niveau et par signe ; module rage | C | Document de textes FR v1 | Sources citées |
| Lexique de symptômes créole/français (mots-clés, variantes d'orthographe) | B | Tableur `lexique` v1 | ≥ 5 variantes par symptôme |

### 3.3 Semaine 3 : 14 – 20 novembre (données)

| Tâche | Qui | Livrable | Volume cible |
|---|---|---|---|
| Banque de phrases de symptômes (créole, français) | B | Tableur `banque_phrases` | 15–30 phrases par symptôme (~800) |
| Jeu de cas de test : description, espèce, symptômes attendus, niveau attendu | C | Tableur `cas_test` | ≥ 60 cas, dont ≥ 25 cas d'alerte |
| Traduction créole de tous les textes, relue par un locuteur natif | C | Document de textes HT v1 | 100 % des textes |
| Textes des clips audio (une ligne par clip) | C | Tableur `clips` | ~150 clips |
| Annuaire : appels de vérification, accords | A | Tableur `veterinaires` | ≥ 15 entrées (Ouest en priorité) |
| Relecture vétérinaire de l'arbre et des consignes | A, C | Commentaires intégrés | 1 vétérinaire au minimum |
| Liste des communes et communes voisines | A | Tableur `communes` | Départements avec entrées d'annuaire |
| **D4** Budget du pack IA ; **D6** choix de l'hébergeur | A, B | Notes D4, D6 | — |

### 3.4 21 novembre : gel

- Fin de la formation.
- Gel des documents et des tableurs (v1). Les modifications suivantes passent par une liste « changements » partagée.

### 3.5 22 – 26 novembre : mise en condition

| Tâche | Qui |
|---|---|
| Créer les comptes : GitHub (organisation, dépôt vide), hébergement, Supabase, ElevenLabs ; partager les accès | A |
| Vérifier que les outils sont installés sur les 3 ordinateurs (Node LTS, Git, éditeur, Chrome) | A, B, C |
| Préparer le téléphone de démo : Chrome à jour, débogage USB activé, espace libre ≥ 1 Go, câble | A |
| Écrire le pitch et la démo (PRD §11–12) ; première répétition à vide | C |
| Revue finale du plan 48 h et des rôles | A, B, C |
| Liste du matériel : ordinateurs, chargeurs, multiprise, téléphones, câbles, routeur mobile de secours | A |

---

## 4. Le hackathon (H0 = vendredi 16 h)

### 4.1 Jalons

| Jalon | Heure | Ce qui doit marcher | Si raté |
|---|---|---|---|
| **J1 Squelette déployé** | H4 (ven. 20 h) | URL HTTPS, PWA installable, navigation vide FR/HT | Tout le monde aide A |
| **J2 Parcours texte sans IA** | H12 (sam. 4 h) | Espèce → description clavier + lexique → questions → résultat avec règles ; tests de règles verts | Ce parcours est le **filet de sécurité** de la démo |
| **J3 IA intégrée** | H24 (sam. 16 h) | Voix → transcription → symptômes détectés sur ordinateur | Voir lignes de coupe §5 |
| **J4 Complet hors ligne sur téléphone** | H32 (dim. 0 h) | Parcours de démo entier, mode avion, téléphone de démo, voix lue | Couper les P1 restants |
| **J5 Gel des fonctionnalités** | H40 (dim. 8 h) | Plus aucune nouvelle fonction ; corrections seulement | — |
| **J6 Soumission** | H47 (dim. 15 h) | Dépôt, URL, README, liste des outils envoyés | **1 h de marge** avant 16 h |

### 4.2 Vendredi 27 (H0 – H8)

| Heure | A — Socle et PWA | B — IA | C — Triage, contenu, voix |
|---|---|---|---|
| H0 – H1 | Réunion de lancement à 3 : rôles, jalons, conventions (branches, nommage) | ← | ← |
| H1 – H4 | Projet Vite + React + TS, Tailwind, routes des écrans, i18n, manifeste, icônes, vite-plugin-pwa ; **déploiement** (J1) | Worker IA vide ; charger Whisper dans le worker ; transcrire un fichier audio de test | Convertir les tableurs en JSON (`symptomes`, `questions`, `regles`, textes) ; types TypeScript du contenu |
| H4 – H8 | Écrans E01, E02, E10, E20, E21 ; stockage Dexie (`settings`, `drafts`) | Enregistrement micro (MediaRecorder → 16 kHz) ; transcription bout en bout sur ordinateur | **Moteur de triage** (fonction pure) + tests unitaires ; script du jeu de cas |

### 4.3 Nuit de vendredi à samedi (H8 – H16)

Rotation de sommeil : **chacun dort au moins 4 h**. Proposition :

| Plage | Éveillés | Dort |
|---|---|---|
| H8 – H12 (0 h – 4 h) | A, C | B |
| H12 – H16 (4 h – 8 h) | B, C | A |
| H16 – H20 (8 h – 12 h) | A, B | C |

| Heure | A | B | C |
|---|---|---|---|
| H8 – H12 | Écrans E22 (mode clavier), E24, E30, E31, E40 branchés sur le moteur | (dort) | Lexique en TS ; branchement lexique → E24 ; **J2** avec A |
| H12 – H16 | (dort) | Embeddings : chargement du modèle, calcul de la banque de phrases, similarité, seuil réglé sur `cas_test` | Écran E41 rage, E11 urgence ; génération des clips audio ; lecteur audio |

### 4.4 Samedi 28 (H16 – H32)

| Heure | A | B | C |
|---|---|---|---|
| H16 – H20 | Écran E03 et téléchargement du pack (progression, reprise) ; cache des modèles | Intégration voix → E23 → embeddings + lexique → E24 ; **J3** | (dort) |
| H20 – H24 | Supabase P0 (tables, RLS) ; file d'envoi ; synchronisation | Premier test **sur le téléphone de démo** : temps de chargement, transcription, mémoire | Lecture vocale sur E30, E40, E41 ; relecture des textes à l'écran |
| H24 – H28 | Annuaire E50, E51 (contenu JSON, filtres, `tel:`, WhatsApp) | Optimisations (taille, quantification, préchauffage) ; repli lexique si mémoire insuffisante | Jeu de cas complet : **100 % des cas d'alerte en 🔴** ; corrections des règles |
| H28 – H32 | Fiche E60 + photos E61 (compression, stockage, partage) | Gestion des erreurs : micro refusé, transcription vide, pack absent | Parcours de démo sur téléphone en mode avion ; **J4** avec A et B |

### 4.5 Nuit de samedi à dimanche (H32 – H40)

| Plage | Éveillés | Dort |
|---|---|---|
| H32 – H36 (0 h – 4 h) | B, C | A |
| H36 – H40 (4 h – 8 h) | A, B | C |

Pendant ces heures : P1 restants (installation E04, indicateur hors ligne, `veterinarians` dans Supabase), corrections, vue de démo du tableau de bord. B dort après J5.

### 4.6 Dimanche 29 (H40 – H48)

| Heure | A | B | C |
|---|---|---|---|
| H40 – H43 | Corrections ; déploiement final ; vérification de l'installation depuis l'URL | (dort jusqu'à H43) | README (problème, démo, architecture, limites, sources, avertissement) ; liste des outils et licences |
| H43 – H45 | Réveiller et vérifier Supabase ; nettoyer les données de test | Vérification finale sur téléphone de démo et de secours | Répétition du pitch et de la démo (2 fois, chronométrées) |
| H45 – H47 | Enregistrement d'une **vidéo de secours** de la démo | Préparation du téléphone (mode avion, luminosité, son, batterie) | Dernière répétition |
| **H47** | **Soumission** : dépôt, URL, README, liste des outils | ← | ← |
| H47 – H48 | Marge | ← | ← |

---

## 5. Lignes de coupe

Décisions prises **à l'heure indiquée**, sans débat :

| Moment | Condition | Décision |
|---|---|---|
| H12 | J2 non atteint | Tout le monde sur le parcours texte jusqu'à ce qu'il marche ; l'IA attend |
| H20 | Whisper inutilisable en créole ou trop lent sur téléphone | Abandon de la dictée ; **clavier + embeddings + lexique** ; la voix reste en sortie (clips) |
| H24 | Embeddings trop lents ou imprécis | **Lexique seul** pour la compréhension ; l'IA vocale porte la démo |
| H28 | Pack IA > budget D4 ou téléchargement instable | Un seul modèle ; l'autre composant passe au lexique |
| H32 | J4 non atteint | Couper annuaire filtré (liste simple), photos (P1), historique |
| H40 | Gel | Plus aucune fonctionnalité, seulement des corrections |

**Ce qui n'est jamais coupé :** le moteur de règles et ses tests, le parcours hors ligne, la lecture vocale du résultat, le module rage, l'avertissement.

---

## 6. Ordre de priorité des fonctionnalités

| Ordre | Fonctionnalité | Priorité PRD | Responsable |
|---|---|---|---|
| 1 | Socle PWA déployé, hors ligne | P0 | A |
| 2 | Moteur de triage + tests | P0 | C |
| 3 | Parcours texte complet (lexique) | P0 | A, C |
| 4 | Résultat lu à voix haute (clips) | P0 | C |
| 5 | Module rage, bouton urgence | P0 | C |
| 6 | Dictée + transcription | P0 | B |
| 7 | Compréhension par embeddings | P0 | B |
| 8 | Téléchargement du pack IA | P0 | A, B |
| 9 | Synchronisation Supabase | P1 | A |
| 10 | Annuaire | P1 | A |
| 11 | Fiche + photos + partage | P1 | A |
| 12 | Installation guidée, indicateur hors ligne | P1 | A |
| 13 | Historique, réponses à la voix, tableau de bord complet | P2 | — |

---

## 7. Méthode de travail

- **Dépôt unique**, branche `main` toujours déployable ; une branche par fonctionnalité ; fusion par A au moins toutes les 4 h.
- **Points d'équipe de 10 minutes** à chaque jalon : fait, bloqué, suite.
- **Tableau de suivi** simple (GitHub Projects ou tableur) avec les colonnes À faire / En cours / Fait.
- **Conventions** : noms de symptômes et de règles en anglais `snake_case`, identiques entre contenu, code et base.
- **Tests** : le jeu de cas tourne avant chaque fusion qui touche au triage ou à l'IA.
- **Outils d'IA de développement** : autorisés, mais à déclarer dans la liste des outils.

---

## 8. Définition de « terminé »

| Critère | Vérification |
|---|---|
| 100 % des cas d'alerte classés 🔴 | Jeu de cas automatique |
| Parcours de démo complet en mode avion, sur le téléphone de démo, 3 fois de suite | Test manuel |
| Installation depuis l'URL publique | Test manuel sur Android |
| Résultat lu en créole sur E40 et E41 | Test manuel |
| Aucun nom de maladie ni dose affichés | Relecture des textes |
| README et liste des outils (avec licences des modèles) | Relecture |
| Soumission faite avant H47 | Confirmation |

---

## 9. Risques pendant le hackathon

| Risque | Signal | Réponse |
|---|---|---|
| Réseau du lieu lent (modèles de 100+ Mo) | Téléchargements longs | Modèles et dépendances déjà en cache sur les ordinateurs dès H0 ; routeur mobile de secours |
| Fatigue, erreurs la nuit | Retards sur jalons | Rotation de sommeil respectée ; pas de fonctionnalité nouvelle après J5 |
| Fusion difficile | Conflits | Fusions fréquentes ; dossiers séparés par rôle (TRD §12) |
| Téléphone de démo défaillant | — | Téléphone de secours préparé ; vidéo de secours |
| Supabase indisponible | Erreurs d'envoi | La démo n'en dépend pas ; montrer la file d'attente locale |
| Contenu non relu par un vétérinaire | — | Le dire dans le pitch comme étape suivante ; citer les sources |

---

## 10. Après le hackathon

| Période | Action |
|---|---|
| Décembre 2026 | Relecture vétérinaire complète ; corrections ; mesures sur 3–5 téléphones courants |
| Janvier 2027 | Tests avec 20–30 propriétaires (Port-au-Prince, une ville de province) ; retours vétérinaires (`vet_feedback`) et suivi à 48 h (`owner_followups`) |
| 1er semestre 2027 | Décision sur l'application Android native (caméra, analyse photo) ; préparation de l'extension aux éleveurs |

---

## 11. Checklist de préparation (résumé)

- [ ] Formation suivie par A, B, C
- [ ] Réponses de l'organisation : heure de début, pitch, livrables, D5
- [ ] D1, D2, D3 tranchées (13 nov.)
- [ ] D4, D6 tranchées (20 nov.)
- [ ] Tableurs : `symptomes`, `questions`, `regles`, `lexique`, `banque_phrases`, `cas_test`, `clips`, `veterinaires`, `communes`
- [ ] Textes FR et HT relus (vétérinaire + locuteur natif)
- [ ] Comptes : GitHub, hébergement, Supabase, ElevenLabs
- [ ] Téléphone de démo et de secours prêts
- [ ] Pitch écrit et répété
- [ ] Matériel listé et emballé
