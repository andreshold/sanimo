# Sanimo — Document d'exigences produit (PRD)

| | |
|---|---|
| Version | 0.2 (brouillon) |
| Date | 31 octobre 2026 |
| Contexte | Hackathon Ayiti AI 2026, 27–29 novembre, Pétion-Ville, 48 h |
| Équipe | 3 développeurs |
| Livrable hackathon | PWA installable, déployée, démontrable hors ligne, avec IA sur l'appareil et voix en créole |
| Documents liés | TRD (02), App flow (03), UI/UX (04, reporté), Schéma backend (05), Plan d'implémentation (06), [Synthèse de recherche](../recherche/synthese-recherche.md) |

### Changements depuis la v0.1
- Équipe de 3 développeurs.
- **IA locale au centre** : un modèle tourne sur le téléphone, hors ligne. **Voix créole d'abord** : dicter la description, écouter le résultat.
- Ajout de l'annuaire des vétérinaires et de la photo jointe à la fiche.
- Ajout des éleveurs comme persona futur ; problème recentré sur les urgences animales.
- Démo ramenée à 3 minutes, ajout du pitch, feuille de route datée.

---

## 1. Résumé

Sanimo aide les propriétaires de chiens et de chats en Haïti à décider quoi faire quand leur animal semble malade. Le propriétaire **raconte en créole, à voix haute**, ce qu'il observe. Un **modèle d'IA qui tourne sur le téléphone, sans Internet**, comprend la description, pose les questions qui manquent et donne un **niveau d'urgence** :

- 🔴 **Ijans / Urgence** : aller chez un vétérinaire maintenant ;
- 🟠 **Konsilte / Consulter** : voir un vétérinaire dans les 24 à 48 h ;
- 🟢 **Siveye / Surveiller** : surveiller à la maison, avec les signes qui doivent faire changer d'avis.

Le résultat est **lu à voix haute en créole**. Sanimo affiche ensuite les vétérinaires les plus proches (appel en un toucher) et prépare une **fiche pour le vétérinaire**, photo comprise. Un module rage indique quoi faire après une morsure.

Sanimo **ne pose pas de diagnostic** et **ne prescrit aucun traitement**.

---

## 2. Problème

1. **Hésitation face aux urgences.** Sans repères, un propriétaire ne distingue pas un problème bénin d'une urgence vitale, par exemple un chat mâle qui n'urine plus ou un chien au ventre gonflé qui essaie de vomir sans y arriver. Chaque heure de retard peut coûter la vie de l'animal.
2. **Traitements improvisés.** Faute d'information, on donne des remèdes maison ou des médicaments humains, dont certains sont toxiques pour l'animal.
3. **Échanges imprécis avec le vétérinaire.** Le propriétaire arrive sans chronologie ni observations structurées, et ne sait pas toujours où trouver un vétérinaire.
4. **Contenu inaccessible.** L'information de santé animale existe surtout en anglais ou en français écrit, rarement en créole, et presque jamais à l'oral.
5. **Conditions difficiles.** Connexion intermittente, données mobiles coûteuses, téléphones Android d'entrée de gamme.
6. **Risque pour l'humain.** La rage canine reste endémique en Haïti, et la plupart des morsures ne sont jamais déclarées (CDC, 2014).

---

## 3. Adéquation au hackathon

| Critère du jury | Réponse de Sanimo |
|---|---|
| **Problème** | Urgences animales mal reconnues, information absente en créole, rage endémique |
| **Solution** | Description orale en créole → IA sur l'appareil → niveau d'urgence encadré par des signes d'alerte reconnus (Merck, Cornell, ASPCA) |
| **Exécution** | Démo en direct en **mode avion**, sur un vrai téléphone Android, à la voix |
| **Contexte** | Créole parlé d'abord, hors ligne, téléphones d'entrée de gamme, téléchargement unique du modèle |
| **Potentiel** | Éleveurs (bétail, volailles), autres pays créolophones et francophones, application Android native avec caméra |

**Frontières visées :** *Offline, Edge & the Physical World* (principale) et *Kreyòl-Native, Voice-First*.
**Prix spécial visé :** *Best Kreyòl Voice Experience* (ElevenLabs).
**Précédent :** le vainqueur 2025, AgriBot, était une application hors ligne en créole avec un modèle sur l'appareil. Sanimo applique la même logique à la santé animale, avec la voix en plus.

---

## 4. Utilisateurs

### 4.1 Persona principal : Manouchka, propriétaire de chien (Port-au-Prince)
- 28 ans, téléphone Android d'entrée de gamme, forfait de données limité.
- Parle créole, lit difficilement les longs textes, préfère envoyer des messages vocaux.
- Son chien ne mange plus depuis hier et a vomi deux fois. Elle se demande si elle peut attendre lundi.
- **Besoin :** expliquer la situation à voix haute, savoir vite si c'est grave, et où aller.

### 4.2 Persona secondaire : Jean-Robert, propriétaire de chat (province)
- 45 ans, connexion rare, vétérinaire à plusieurs heures de route.
- **Besoin :** fonctionner sans réseau ; savoir si le déplacement est justifié ; trouver le numéro du vétérinaire le plus proche.

### 4.3 Persona tiers : Dr Pierre, vétérinaire
- Reçoit des clients qui décrivent mal les symptômes.
- **Besoin :** une fiche claire, lue en 30 secondes, avec photo : espèce, âge, symptômes, durée, signes d'alerte.

### 4.4 Persona futur : Rosemène, éleveuse (Artibonite)
- Élève des chèvres et des poules ; une maladie peut emporter une partie de son revenu.
- **Besoin :** reconnaître tôt les signes qui exigent un vétérinaire ou un agent de santé animale, et isoler les animaux malades.
- **Hors MVP.** C'est la première extension après les tests avec les propriétaires de chiens et de chats. Elle illustre le critère *Potentiel*.

---

## 5. Objectifs et indicateurs

### 5.1 Objectifs produit
- O1 — Réduire l'hésitation : orienter **toute** situation d'urgence vers 🔴.
- O2 — Rendre l'outil utilisable à l'oral, en créole, sans réseau.
- O3 — Réduire les traitements improvisés : consignes « à faire / à ne pas faire » sûres.
- O4 — Faciliter la consultation : annuaire des vétérinaires et fiche avec photo.
- O5 — Prévenir la rage : conduite à tenir après une morsure.

### 5.2 Indicateurs pour le hackathon

| Indicateur | Cible |
|---|---|
| Scénarios « signes d'alerte » classés 🔴 (jeu de test interne) | **100 %** |
| Symptômes correctement extraits par le modèle local (jeu de test de descriptions en créole) | ≥ 80 % (à mesurer) |
| Temps entre la fin de la description orale et le résultat, hors ligne | < 10 s sur un Android d'entrée de gamme (à mesurer) |
| Fonctionnement complet en mode avion après installation | Oui |
| Poids de l'application sans modèle | < 2 Mo |
| Poids total du pack IA (modèle(s) + voix) | Budget à fixer dans le TRD ; à afficher avant téléchargement |
| Parcours complet disponible en créole (écrit et oral) et en français | 100 % des écrans |

---

## 6. Périmètre

### 6.1 Dans le périmètre (MVP hackathon)
- Espèces : **chien** et **chat**.
- Langues : **créole haïtien** (par défaut, écrit et oral) et **français** (écrit).
- Description **orale** ou écrite, comprise par un **modèle sur l'appareil**.
- Questions complémentaires sur les signes d'alerte et la durée, avec un niveau d'urgence à 3 niveaux.
- Lecture vocale en créole du résultat et des consignes.
- Annuaire statique des vétérinaires, disponible hors ligne, avec appel en un toucher.
- Fiche pour le vétérinaire, avec une photo jointe (non analysée).
- Module rage et morsures.
- PWA installable ; pack IA téléchargé une seule fois ; tout fonctionne ensuite hors ligne.
- Synchronisation anonyme et opportuniste des évaluations, pour l'analyse d'usage.

### 6.2 Hors périmètre
- Diagnostic nommé, posologie, prescription.
- **Analyse** de la photo par IA : prévue pour l'application Android native.
- Comptes utilisateurs, paiements, prise de rendez-vous, téléconsultation.
- Géolocalisation précise et carte ; on utilise une sélection par commune.
- Éleveurs et animaux de rente.

---

## 7. Approche IA

### 7.1 Principe
**L'IA est au centre de l'expérience, les signes d'alerte forment un filet de sécurité.**

```
Voix (créole) ──► Reconnaissance vocale sur l'appareil ──► Texte
Texte ──► Modèle local de compréhension ──► Symptômes détectés + niveau proposé
Symptômes ──► Questions complémentaires (seulement ce qui manque)
Réponses ──► Règles des signes d'alerte ──► Niveau minimal
Niveau final = le plus élevé des deux (modèle, règles)
Résultat ──► Synthèse vocale créole
```

- Le modèle **comprend** la description et **propose** un niveau.
- Les règles, tirées de sources reconnues, imposent un **niveau minimal** : un signe d'alerte confirmé donne toujours 🔴.
- Le modèle peut **relever** un niveau, **jamais l'abaisser** sous celui des règles.
- Le propriétaire **voit et confirme** les symptômes détectés avant le résultat.

### 7.2 Composants

| Composant | Rôle | Exécution | Repli |
|---|---|---|---|
| Reconnaissance vocale créole | Transformer la dictée en texte | Sur l'appareil (candidat : Whisper petit format ou MMS, à tester) | Saisie texte |
| Compréhension (NLU) | Extraire les symptômes et proposer un niveau | Sur l'appareil, petit modèle multilingue affiné ou classifieur (≥ 118 Mo pour un modèle d'embeddings, à optimiser) | Lexique créole/français de symptômes |
| Règles des signes d'alerte | Niveau minimal garanti | Sur l'appareil, déterministe | — (toujours actif) |
| Synthèse vocale créole | Lire le résultat et les consignes | Audio pré-généré pour les messages fixes ; synthèse sur l'appareil pour le reste (candidat : MMS `mms-tts-hat`, licence non commerciale) | Texte seul |
| Modèle en ligne (optionnel) | Améliorer la compréhension quand il y a du réseau | API d'un modèle de langue | Modèle local |

### 7.3 Contraintes connues (recherche)
- WebGPU n'existe que sur une partie des Android (Android 12+, GPU Qualcomm/ARM) : le modèle doit tourner en **WASM/CPU**.
- Gemini Nano dans Chrome est exclu : pas d'Android, pas de créole.
- ElevenLabs Scribe v2 ne prend pas en charge le créole : la dictée ne peut pas passer par lui.
- Même un petit modèle pèse plus de 100 Mo : **téléchargement unique, proposé de préférence en Wi-Fi, avec la taille affichée**. L'application reste utilisable avec le lexique pendant le téléchargement.

### 7.4 Décisions à trancher avant le 21 novembre
- D1 — Reconnaissance vocale créole sur l'appareil : Whisper (quelle taille ?) ou MMS ? Mesurer la qualité et la vitesse.
- D2 — Modèle de compréhension : classifieur affiné sur un jeu de descriptions créoles (à constituer avant l'événement, c'est autorisé) ou embeddings et similarité ?
- D3 — Synthèse vocale : ElevenLabs (audio pré-généré, prix spécial) ou MMS sur l'appareil, ou les deux ?
- D4 — Budget du pack IA : taille maximale acceptable vu le coût des données en Haïti (chiffres à sourcer).
- D5 — Faut-il préparer les données d'entraînement et les audio avant l'événement ? Le règlement autorise les « datasets » ; confirmer avec l'organisation pour les fichiers audio et un éventuel modèle affiné.

---

## 8. Exigences fonctionnelles

Priorité : **P0** = indispensable à la démo · **P1** = important · **P2** = si le temps le permet.

### 8.1 Accueil, langue et installation
| ID | Exigence | Priorité |
|---|---|---|
| F-01 | Choisir la langue au premier lancement : Kreyòl (par défaut) ou Français ; modifiable à tout moment | P0 |
| F-02 | Avertissement court « Sanimo ne remplace pas un vétérinaire », écrit et lu à voix haute ; accepté une fois | P0 |
| F-03 | Inviter à installer l'application (bouton sur Android, instructions sur iOS) | P1 |
| F-04 | Télécharger le pack IA en affichant sa taille et sa progression, avec une recommandation Wi-Fi ; reprise possible après coupure | P0 |
| F-05 | Bouton **« Ijans kounye a »** toujours visible : signes d'urgence, consignes et vétérinaires | P0 |

### 8.2 Description de la situation
| ID | Exigence | Priorité |
|---|---|---|
| F-10 | Choisir l'espèce (chien ou chat), l'âge approximatif et, pour le chat, le sexe | P0 |
| F-11 | **Dicter** la description en créole, avec un gros bouton micro ; le texte transcrit s'affiche et peut être corrigé | P0 |
| F-12 | Saisir la description au clavier, en créole ou en français | P0 |
| F-13 | Le modèle local affiche les symptômes détectés ; le propriétaire confirme ou corrige | P0 |

### 8.3 Questions complémentaires et niveau d'urgence
| ID | Exigence | Priorité |
|---|---|---|
| F-20 | Poser d'abord les questions sur les signes d'alerte non encore couverts par la description ; un « oui » donne immédiatement 🔴 | P0 |
| F-21 | Questions fermées (oui / non / je ne sais pas), une par écran, lues à voix haute | P0 |
| F-22 | Questions adaptées à l'espèce (ex. respiration bouche ouverte : alerte chez le chat, pas chez un chien qui halète) | P0 |
| F-23 | Questions de durée et d'évolution pour départager 🟠 et 🟢 | P0 |
| F-24 | « Je ne sais pas » sur un signe d'alerte → classement prudent (niveau supérieur) | P0 |
| F-25 | Niveau final = le plus élevé entre le niveau proposé par le modèle et le niveau des règles | P0 |
| F-26 | Répondre aux questions à la voix (« wi » / « non ») | P2 |

### 8.4 Résultat
| ID | Exigence | Priorité |
|---|---|---|
| F-30 | Niveau affiché par couleur, icône et texte, avec la raison en langage simple | P0 |
| F-31 | **Lecture vocale en créole** du niveau, de la raison et des consignes | P0 |
| F-32 | Consignes **à faire** et **à ne pas faire** en attendant (ex. ne pas donner de médicament humain) | P0 |
| F-33 | Pour 🟢 : signes qui doivent faire reconsulter | P0 |
| F-34 | Jamais de nom de maladie comme diagnostic, jamais de dose de médicament | P0 |
| F-35 | Depuis le résultat, accès direct aux vétérinaires (🔴 et 🟠) | P0 |

### 8.5 Annuaire des vétérinaires
| ID | Exigence | Priorité |
|---|---|---|
| F-40 | Liste statique de cliniques et vétérinaires (nom, commune, téléphone, horaires et urgences si connus), disponible hors ligne | P1 |
| F-41 | Filtrer par département et commune ; pas de géolocalisation | P1 |
| F-42 | Appeler en un toucher (`tel:`) ou envoyer un message WhatsApp | P1 |
| F-43 | Date de dernière vérification de chaque entrée, et mention « appelez avant de vous déplacer » | P1 |
| F-44 | Mise à jour de la liste au retour du réseau | P2 |

### 8.6 Fiche pour le vétérinaire
| ID | Exigence | Priorité |
|---|---|---|
| F-50 | Fiche résumé : espèce, âge, sexe, description d'origine, symptômes confirmés, durée, signes d'alerte, niveau, date et heure | P0 |
| F-51 | **Joindre une ou plusieurs photos** prises avec l'appareil photo ou depuis la galerie ; photos compressées et stockées sur l'appareil, **non analysées** | P1 |
| F-52 | Fiche disponible en français, quelle que soit la langue de l'utilisateur | P1 |
| F-53 | Partager la fiche et les photos (WhatsApp, SMS) ou les montrer à l'écran | P1 |

### 8.7 Historique
| ID | Exigence | Priorité |
|---|---|---|
| F-60 | Enregistrer chaque évaluation sur l'appareil ; consulter et supprimer | P2 |

### 8.8 Rage et zoonoses
| ID | Exigence | Priorité |
|---|---|---|
| F-70 | Question dédiée : « L'animal a-t-il mordu ou griffé quelqu'un ? » | P0 |
| F-71 | En cas de morsure : laver la plaie à l'eau et au savon **au moins 15 minutes**, puis aller **immédiatement** dans un centre de santé, sans attendre de voir si l'animal tombe malade ; message lu à voix haute | P0 |
| F-72 | Garder l'animal mordeur à l'écart et en observation, et prévenir un vétérinaire, sans retarder les soins de la personne | P0 |
| F-73 | Aucun schéma de vaccination humaine : renvoi vers un centre de santé | P0 |
| F-74 | Fiche éducative : signes de rage chez l'animal, précautions, vaccination des animaux | P1 |

### 8.9 Hors ligne et synchronisation
| ID | Exigence | Priorité |
|---|---|---|
| F-80 | Après installation et téléchargement du pack IA, **tout** fonctionne sans réseau : dictée, compréhension, questions, résultat, voix, annuaire, fiche, rage | P0 |
| F-81 | Indicateur en ligne / hors ligne | P1 |
| F-82 | Évaluations anonymisées mises en file d'attente et envoyées au retour du réseau, sans photo ni audio | P1 |
| F-83 | Mise à jour du contenu au retour du réseau, sans bloquer l'usage | P2 |

---

## 9. Exigences non fonctionnelles (résumé, détaillées dans le TRD)

| Domaine | Exigence |
|---|---|
| Sûreté clinique | Règles des signes d'alerte versionnées et testées ; le modèle ne peut jamais abaisser un niveau ; le propriétaire confirme les symptômes |
| Performance | Android d'entrée de gamme (≈ 2–3 Go de RAM), inférence en WASM/CPU ; résultat en moins de 10 s hors ligne (cible) |
| Données mobiles | Application légère ; pack IA téléchargé une seule fois, taille affichée ; aucun appel réseau obligatoire pendant le parcours |
| Accessibilité | Parcours entièrement utilisable à l'oral ; grands boutons ; niveau jamais signalé par la seule couleur |
| Confidentialité | Pas de compte ni de nom ; audio et photos **restent sur l'appareil** ; seules des données anonymes structurées sont synchronisées |
| Langues | Créole en orthographe standard, relu par un locuteur natif ; toutes les chaînes dans des fichiers de traduction |
| Licences | Vérifier la licence de chaque modèle : MMS est non commercial, donc acceptable pour le prototype mais à remplacer avant toute commercialisation |
| Compatibilité | Chrome Android (cible principale) ; Safari iOS en mode dégradé |

---

## 10. Contenu et sûreté clinique

- **Sources** : Merck Veterinary Manual, Cornell University Hospital for Animals, ASPCA pour les signes d'alerte ; OMS et CDC pour la rage.
- **Validation** : relecture de l'arbre de décision et des consignes par au moins un vétérinaire exerçant en Haïti.
- **Jeu de test** : descriptions de cas en créole et en français, chacune avec le niveau attendu, utilisées pour mesurer le modèle et les règles.
- **Mentions** : « orientation, pas diagnostic » sur l'accueil, le résultat et la fiche.
- **Biais prudent** : en cas de doute, le niveau supérieur est retenu.

---

## 11. Démo (3 minutes)

| Temps | Action |
|---|---|
| 0:00 | Téléphone Android déjà installé, **mode avion activé** et montré au jury |
| 0:15 | Chat mâle. On dicte : « Chat mwen ap eseye pipi depi maten, anyen pa soti, l ap plenn » |
| 0:35 | Le texte transcrit s'affiche ; le modèle détecte la difficulté à uriner et la douleur ; on confirme |
| 0:50 | 🔴 Ijans : la raison et les consignes sont **lues en créole** |
| 1:15 | Toucher « Veterinè » : liste de Pétion-Ville, bouton d'appel |
| 1:30 | Fiche pour le vétérinaire avec photo du chat |
| 1:50 | Second cas, court : « Chen an mòde pitit mwen » → message rage lu à voix haute (laver 15 minutes, centre de santé immédiatement) |
| 2:30 | Fin de démo ; retour au pitch |

---

## 12. Pitch (5 minutes, aligné sur les critères)

| Temps | Contenu | Critère |
|---|---|---|
| 0:00–0:45 | Histoire d'un propriétaire qui attend le lundi alors que son chat est bloqué ; information absente en créole ; vétérinaires loin | **Problème** |
| 0:45–1:15 | Sanimo en une phrase : « Raconte en créole, sans Internet, et sache si c'est grave. » | **Solution** |
| 1:15–4:15 | Démo en direct (section 11) | **Exécution** |
| 4:15–4:35 | Pourquoi ça marche ici : IA sur le téléphone, mode avion, voix créole, téléchargement unique | **Contexte** |
| 4:35–5:00 | Suite : tests auprès des propriétaires, validation vétérinaire, éleveurs, application Android avec analyse photo, autres pays créolophones | **Potentiel** |

La durée du pitch reste à confirmer avec l'organisation ; la démo de 3 minutes s'adapte.

---

## 13. Risques

| Risque | Impact | Mitigation |
|---|---|---|
| Sous-triage d'une urgence | Critique | Règles des signes d'alerte prioritaires ; le modèle ne peut pas abaisser un niveau ; jeu de tests à 100 % |
| Reconnaissance vocale créole médiocre | Élevé | Tests dès la formation ; texte transcrit modifiable ; saisie clavier en repli |
| Modèle trop lourd ou trop lent sur téléphone d'entrée de gamme | Élevé | Mesures avant l'événement ; quantification ; lexique de repli ; téléphone de démo testé |
| Perception de diagnostic | Élevé | Pas de nom de maladie ; mentions répétées ; renvoi vers un vétérinaire |
| Annuaire incomplet ou périmé | Moyen | Date de vérification ; « appelez avant de vous déplacer » ; collecte avant l'événement |
| Données ou modèle préparés avant l'événement jugés non conformes | Moyen | Confirmer avec l'organisation (D5) |
| 48 h insuffisantes | Élevé | Priorités P0/P1/P2 strictes ; rôles répartis entre 3 développeurs ; contenu prêt avant l'événement |
| Backend en pause le jour de la démo (Supabase gratuit) | Faible | Réveiller le projet avant la démo ; l'application fonctionne sans backend |

---

## 14. Hypothèses à valider

- H1 — Les propriétaires préfèrent raconter à l'oral, en créole.
- H2 — Une orientation à 3 niveaux suffit à faire agir.
- H3 — Le téléchargement unique de plus de 100 Mo est acceptable s'il est annoncé et fait en Wi-Fi.
- H4 — La fiche avec photo est jugée utile par les vétérinaires.
- H5 — L'approche s'adapte aux éleveurs avec un nouveau contenu, sans changer l'architecture.

---

## 15. Feuille de route

### 15.1 Avant le hackathon (aucun code du projet)

| Période | Actions | Livrables |
|---|---|---|
| **31 oct – 6 nov** | Début de la formation ; finaliser le PRD ; rédiger TRD et App flow ; contacter 2 ou 3 vétérinaires (relecture et annuaire) | PRD v1, TRD v0.1, App flow v0.1 |
| **7 – 13 nov** | Tester la reconnaissance vocale créole (Whisper, MMS), la synthèse (ElevenLabs, MMS) et la compréhension (modèles de langue, petits modèles) **via les démos et playgrounds existants** ; arbre de décision et consignes FR/HT | Décisions D1–D3 ; arbre de décision v1 |
| **14 – 20 nov** | Constituer le jeu de descriptions créoles et le jeu de test ; collecter l'annuaire ; relecture vétérinaire et native ; schéma backend ; plan 48 h ; poser la question D5 à l'organisation | Jeux de données ; annuaire ; schéma backend ; plan d'implémentation |
| **21 nov** | Fin de la formation obligatoire ; gel des documents | Dossier complet |
| **22 – 26 nov** | Répartir les rôles entre les 3 développeurs ; créer les comptes (hébergement, Supabase, ElevenLabs) ; préparer le téléphone de démo ; écrire et répéter le pitch | Checklist prête ; pitch v1 |

### 15.2 Hackathon

| Date | Actions |
|---|---|
| **Ven. 27 nov** | Socle PWA et hors ligne ; moteur de règles ; intégration du modèle local et de la reconnaissance vocale |
| **Sam. 28 nov** | Parcours complet P0 ; voix ; rage ; annuaire et fiche ; tests sur le téléphone de démo |
| **Dim. 29 nov, avant 16 h** | Finitions P1 ; déploiement ; README et liste des outils ; répétition de la démo en mode avion ; soumission |

### 15.3 Après le hackathon

| Période | Actions |
|---|---|
| Déc. 2026 – janv. 2027 | Tests auprès de propriétaires de chiens et chats ; validation vétérinaire ; mesure sur les téléphones courants |
| 1er semestre 2027 | Application Android native (caméra, analyse photo, modèles plus grands) ; annuaire enrichi |
| Ensuite | Extension aux éleveurs ; autres pays créolophones et francophones |

---

## 16. Questions ouvertes

1. Décisions D1 à D5 (section 7.4).
2. Quels vétérinaires peuvent relire l'arbre et fournir l'annuaire avant le 20 novembre ?
3. Quel est le format exact de la présentation devant le jury (durée, démo en direct ou vidéo) ?
4. Quels livrables supplémentaires l'organisation demandera-t-elle ?
5. Quel coût des données mobiles et quelle part d'Android en Haïti ? À sourcer pour fixer le budget du pack IA (D4).
