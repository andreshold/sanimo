# Sanimo — Plan de travail v2 (développement avant l'événement, hackathon de 6 h)

| | |
|---|---|
| Version | 0.1 (brouillon) |
| Date | 12 novembre 2026 |
| Remplace | Le calendrier du [Plan d'implémentation](06-Plan-implementation.md) §3–§6 (rôles, lignes de coupe et définition de « terminé » restent valables) |
| Nouvelles règles | Le code se fait **avant** l'événement ; le hackathon dure **6 heures** au lieu de 48 |
| À confirmer | Date et heure exactes de l'événement de 6 h (supposé **27 novembre**), contenu attendu des 6 h, livrables |

---

## 1. Que peut faire l'IA locale ? Les 3 modèles de The Trio Serie

Source : [thetrio.space](https://www.thetrio.space/) et les fiches Hugging Face de `jsbeaudry`, vérifiées le 12 novembre 2026. Les trois dépôts sont **publics**.

| Modèle | Rôle | Base | Fichiers téléphone | Licence | Mesures publiées |
|---|---|---|---|---|---|
| **Oswald** (`Oswald-ASR-0.6-V1-GGUF`) | Oreille : voix créole → texte | Qwen3-ASR 0.6B | GGUF : modèle Q4_K_M 484 Mo + projecteur audio 208 Mo ≈ **690 Mo** (llama.cpp, `llama-mtmd`) | Apache-2.0 | 9,8 % d'erreur de mots sur 875 clips réels, **5,7 % sur le domaine santé** ; 0,21 s par phrase sur MacBook M3 Pro ; ~0,9× temps réel sur Galaxy A16 (« en développement ») |
| **Makandal** (`makandal-multiple-v2-GGUF`) | Esprit : comprend, répond court, **appelle des outils** | Gemma 3 1B | GGUF Q4_K_M **806 Mo** ou Q8_0 1 069 Mo (llama.cpp) | Licence Gemma | Bon outil choisi dans 93 % des 300 tests ; lecture en créole (Belebele) 39 % contre 25 % au hasard ; **vitesse sur téléphone non publiée** ; les auteurs disent : ne pas s'y fier seul pour la santé |
| **Fatiman** (`Fatiman-TTS-v2-onnx`) | Voix : texte créole → parole, 6 voix d'interlocuteurs consentants | Pocket TTS (Kyutai) | ONNX ≈ **240 Mo** (onnxruntime) | CC-BY-4.0 | 2,3 % d'erreur de lecture (meilleure voix) ; sur Galaxy A16 : premier son en 1,2–2 s, mais calcul **1,3 à 1,45× plus lent que la lecture** |

Leur appli mobile (« Klara ») est en **Expo / React Native sur Android** et charge ces mêmes fichiers. Le dépôt public `kreyol-offline` ne contient que la version Mac.

### 1.1 Ce que Sanimo peut faire avec eux

| Capacité | Avec quoi | Réponse |
|---|---|---|
| **Lire / écouter** | Oswald | ✅ Très bon niveau publié, y compris sur la santé. À mesurer sur nos 75 `cas_test` lus à voix haute |
| **Comprendre** | Makandal en **appel d'outil** : `signaler_symptomes(ids)` limité aux 46 identifiants de `symptomes.csv` ; `lexique` en union ; confirmation par l'utilisateur | ✅ probable, ⚠️ à prouver : Makandal n'a jamais vu nos symptômes. Exemples dans le prompt, ou affinage avec `banque_phrases` + `cas_test` (la recette existe : ~65 000 exemples, 107 min sur un GPU) |
| **Évaluer** | **Règles**, pas l'IA | ✅ Inchangé : un signe d'alerte → 🔴. Makandal ne fixe jamais le niveau |
| **Poser les questions** | Règles ; Makandal peut les dire plus naturellement | ✅ |
| **Reformuler** | Makandal (« Ou di m chen an ap vomi depi ayè, se sa ? ») ; repli sur les phrases à trous validées | ✅ pour récapituler ce que l'utilisateur a dit. ⚠️ Jamais pour les consignes médicales : celles-ci restent des textes **validés** |
| **Parler** | Fatiman pour le texte variable ; clips pré-générés (Fatiman) pour les messages fixes et critiques | ✅ La licence CC-BY permet aussi un usage commercial, contrairement à MMS |

**Garde-fous :** Makandal ne sort que des identifiants de la liste fermée et des reformulations courtes ; le niveau vient des règles ; les consignes (toxiques, rage, premiers secours) sont lues telles qu'elles ont été validées ; tout texte généré est montré à l'écran et peut être corrigé.

### 1.2 Conséquences sur l'architecture (décision D10)

1. **PWA ou application Android ?** Oswald et Makandal sont des fichiers **GGUF pour llama.cpp**. Dans un navigateur, Makandal pourrait tourner via llama.cpp en WebAssembly (wllama), lentement ; pour l'**audio d'Oswald** dans un navigateur, aucune voie testée n'est connue. Fatiman (ONNX) peut tourner dans le navigateur avec onnxruntime-web. → **Recommandation : application Android** en **Expo / React Native**, comme Klara : llama.cpp natif (ex. `llama.rn`, prise en charge de l'audio à vérifier) et `onnxruntime-react-native`. L'équipe connaît React ; on garde la PWA comme démo de secours au clavier.
2. **Poids :** ~690 + 806 + 240 ≈ **1,7 Go**, contre ~200 Mo prévus (D4). Il faut un téléchargement unique en Wi-Fi, par modules : voix (Oswald + Fatiman, ~930 Mo) d'abord, Makandal ensuite. **Le parcours doit marcher sans Makandal** (lexique + embeddings).
3. **Mémoire :** les trois modèles ensemble ne tiennent pas sur un téléphone de 2 à 3 Go de RAM. On les **charge l'un après l'autre** (écoute → compréhension → parole), ou on vise un téléphone de 4 Go ou plus pour la démo (le Galaxy A16 des auteurs a 4 Go ou plus).
4. **Licence Gemma :** vérifier sa politique d'usage pour un outil de santé avant toute diffusion publique.
5. **Contacter l'auteur** (`jsbeaudry`) : c'est un projet haïtien. Il peut nous dire comment Klara charge Oswald sur Android, donner des mesures de Makandal sur téléphone, et peut-être s'associer à nous.

---

## 2. Ce qui change avec les nouvelles règles

| Avant | Maintenant |
|---|---|
| Préparation sans code, 48 h pour tout coder | **14 jours pour coder** (12 → 26 nov.), 6 h sur place |
| Lignes de coupe à H12, H20, H24… | Lignes de coupe **datées** (§4) |
| Nuits blanches, rotation de sommeil | Rythme normal ; on teste vraiment sur téléphone |
| Les jeux de données arrivent le jour J | Ils sont prêts ([`content-sources/`](../content-sources/LISEZMOI.md)) : il reste à les relire et les valider |
| Démo « qui marche à peu près » | Démo **testée sur plusieurs téléphones**, vidéo de secours, application déjà installée |

Le jour J n'est plus un sprint de développement : c'est **démo, pitch, et petites corrections**.

---

## 3. Calendrier (12 → 27 novembre)

Rôles inchangés : **A** socle PWA, **B** IA, **C** triage, contenu et voix.

### S0 — Démarrage et tests IA (jeu. 12 → sam. 14 nov.)

| Qui | Tâche | Résultat attendu |
|---|---|---|
| A | Dépôt ; **squelette Expo / React Native** (Android) avec i18n HT/FR et navigation ; build APK d'essai ; en parallèle, PWA légère pour le parcours clavier (secours) | APK installé sur le téléphone de démo, mode avion |
| B | **Banc d'essai Trio sur le téléphone de démo** (llama.cpp en ligne de commande via Termux ou une petite appli Expo) : (1) Oswald sur 20 `cas_test` lus à voix haute ; (2) Makandal avec l'outil `signaler_symptomes` sur les 75 `cas_test` : précision, temps, mémoire ; (3) Fatiman : premier son, fluidité. Contacter l'auteur | Notes D1, D2, **D8 (Makandal oui/non)** et **D10 (PWA ou Android)** avec chiffres |
| C | Moteur de triage : types TS du contenu, conversion CSV → JSON, `regles` v1, tests Vitest sur `cas_test` | 100 % des cas d'alerte en 🔴 dans les tests |
| Tous | Envoyer le créole au locuteur natif, le contenu au vétérinaire ; enregistrer les 75 cas à voix haute (3 voix) | Relectures lancées ; audio de test |

### S1 — Parcours texte complet (dim. 15 → jeu. 19 nov.)

| Qui | Tâche |
|---|---|
| A | Écrans accueil, langue, avertissement, espèce, description clavier, questions, résultat, bouton « Ijans kounye a » ; IndexedDB |
| B | Worker IA : chargement des modèles, embeddings de la banque pré-calculés, lexique en union, détection des négations ; écran « symptômes détectés » |
| C | Questions oui/non, règles de durée, module rage, module toxiques ; textes des clips audio figés |

**Jalon J1 (19 nov.) :** parcours complet au clavier, hors ligne, sur le téléphone de démo.

### S2 — Voix et IA de bout en bout (ven. 20 → lun. 23 nov.)

| Qui | Tâche |
|---|---|
| A | Téléchargement du pack IA (taille affichée, progression, reprise) ; annuaire ; fiche vétérinaire + photo ; synchronisation Supabase (P1) |
| B | Dictée → transcription → symptômes ; réglage du seuil ; optimisation mémoire ; LLM bonus seulement si D8 = oui |
| C | Génération des clips (ElevenLabs ou MMS), relecture à l'écoute ; lecteur audio ; reformulation par modèles de phrases (« Ou di m… ») |

**Jalon J2 (23 nov.) :** parcours de démo **à la voix**, en mode avion, sur le téléphone de démo.

### S3 — Stabilisation (mar. 24 → jeu. 26 nov.)

| Date | Tâche |
|---|---|
| 24 nov. | **Gel des fonctionnalités.** Intégration du contenu validé (statut `validé`) ; tests sur 3 téléphones |
| 25 nov. | README, liste des outils et licences (VetClaw, can-my-dog-eat, CMU), avertissement ; vidéo de secours |
| 26 nov. | Pitch chronométré (2 fois) ; téléphones chargés, application et pack déjà installés |

### Jour J — 6 heures

| Heure | Action |
|---|---|
| H0 – H0:30 | Installation, vérification sur place (réseau, téléphones, projecteur) |
| H0:30 – H4 | Seulement des **corrections** et ce que l'organisation demande sur place ; aucune nouvelle fonction |
| H4 – H5 | Déploiement final, vérification de l'installation depuis l'URL, soumission (dépôt, URL, README, outils) |
| H5 – H6 | Répétition, démo et pitch |

---

## 4. Lignes de coupe

| Date | Condition | Décision |
|---|---|---|
| 14 nov. | Makandal > 10 s par réponse sur le téléphone, ou < 80 % de symptômes retrouvés | **Sans Makandal** : lexique + embeddings ; reformulation par phrases à trous |
| 14 nov. | Oswald impossible à faire tourner sur Android dans les temps | Dictée sur ordinateur seulement ; sur le téléphone, clavier + Fatiman en sortie |
| 14 nov. | Reconnaissance vocale < 60 % de symptômes retrouvés | Dictée gardée mais texte toujours corrigeable ; clavier mis en avant ; la voix porte surtout la **sortie** |
| 19 nov. | J1 non atteint | Tout le monde sur le parcours texte |
| 21 nov. | Pack IA > budget D4 | Un seul modèle ; l'autre composant passe au lexique |
| 23 nov. | J2 non atteint | Démo texte + voix en sortie ; dictée montrée sur ordinateur seulement |
| 24 nov. | Gel | Corrections seulement |

**Jamais coupé :** moteur de règles et tests, parcours hors ligne, lecture vocale du résultat, module rage, avertissement.

---

## 5. Décisions à prendre cette semaine

| ID | Décision | Date |
|---|---|---|
| D1 | Modèle de reconnaissance vocale | 14 nov. |
| D2 | Embeddings ou classifieur | 14 nov. |
| D8 | **Makandal dans la compréhension : oui ou non** (sinon lexique + embeddings) | 14 nov. |
| D10 | **Application Android (Expo) ou PWA** | 14 nov. |
| D3 | ElevenLabs ou MMS pour les clips | 16 nov. |
| D4 | Budget du pack IA | 16 nov. |
| D9 | Confirmer avec l'organisation : date et contenu des 6 h, livrables, déclaration des outils d'IA | 13 nov. |
