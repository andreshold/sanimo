# Sanimo — Synthèse de recherche

> Compilé le 31 octobre 2026 à partir de trois passes de recherche approfondie (recherche web + vérification contradictoire à 3 votes par affirmation).
> Les niveaux de confiance indiqués sont ceux de la vérification. Les sujets listés en fin de document **n'ont pas été vérifiés** et ne doivent pas être cités comme acquis.

---

## 1. Hackathon Ayiti AI 2026

| Point | Détail | Confiance |
|---|---|---|
| Dates et lieu | Ven. 27 – dim. 29 novembre 2026, présentiel, Pétion-Ville (lieu exact à annoncer) | Élevée |
| Équipes | 2 à 3 personnes (une équipe de 2 est admise) | Élevée |
| Formation | En ligne, obligatoire, enregistrée, du 31 oct. au 21 nov. | Élevée |
| Règle du code | **Aucun code avant l'événement.** Autorisé à l'avance : idée, recherche, maquettes, architecture, jeux de données, plan de développement | Élevée |
| Livrables | Dépôt de code, projet déployé, README, liste des outils utilisés. « Something working at demo time ». D'autres consignes peuvent suivre | Élevée |
| Échéance | Dimanche 16 h | Élevée |
| Critères (poids égal) | **Problème**, **Solution**, **Exécution**, **Contexte**, **Potentiel** (au-delà du cas initial / d'Haïti) | Élevée |
| Thème | « AI Beyond Ideal Conditions » | Élevée |
| Frontières | Agents for the Real Economy · **Offline, Edge, and the Physical World** · **Kreyòl-Native, Voice-First** · **Resilience, Security, and Public Good** · Learning Without Limits · Open Track | Élevée |
| Prix | Podium 1–3, prix par frontière, prix spéciaux, **Best Kreyòl Voice Experience** (ElevenLabs), cumulable avec le podium. Montants non publiés | Élevée |
| Propriété | Les projets restent la propriété des équipes ; Hall of Fame à partir de 2026 | Élevée |
| Précédent | 2025 : 11 projets. Vainqueur : **AgriBot** (Crusaders), appli mobile hors ligne, modèle IA local de détection des maladies du maïs sur photo, contenu en créole | Élevée |

**Implication :** un questionnaire à règles en saisie texte colle faiblement au thème. Il faut une composante IA visible (sur l'appareil et/ou en créole, idéalement vocale).

Sources : [ayiti.ai](https://ayiti.ai) · [FAQ](https://ayiti.ai/en/faq) · [Themes](https://ayiti.ai/en/themes) · [Projects](https://ayiti.ai/en/projects)

---

## 2. Triage vétérinaire et cadre éthique

### 2.1 Pourquoi un questionnaire structuré
- Une liste de triage structurée (VTL, 5 niveaux, adaptée du triage humain) a classé les urgences rouges correctement dans **95,5 %** des cas contre **44,8 %** pour l'intuition du personnel (orange : 84,3 % vs 24,7 % ; corrélation 0,848 vs 0,519). — Confiance moyenne.
  - Limite : une seule clinique néerlandaise (2012), triage par du personnel formé, pas par des propriétaires.
  - Source : [PubMed 22702436](https://pubmed.ncbi.nlm.nih.gov/22702436/)

### 2.2 Positionnement non diagnostique
- Les lignes directrices AAHA/AVMA 2021 distinguent la **téléorientation / téléconseil** (possible sans relation vétérinaire-client-patient, même pour des non-clients) de la **télémédecine** (qui exige cette relation). — Confiance moyenne.
- Conséquence pour Sanimo : niveau d'urgence + orientation uniquement ; **pas de diagnostic nommé, pas de posologie**, renvoi systématique des urgences vers un vétérinaire.
- Limite : cadre américain, appliqué par analogie ; aucune protection juridique en Haïti.
- Source : [AAHA/AVMA Telehealth Guidelines 2021](https://www.aaha.org/resources/2021-aaha-avma-telehealth-guidelines-for-small-animal-practice)

### 2.3 Signes d'alerte → consultation urgente (chien et chat)
Concordance Merck Veterinary Manual (révisé déc. 2025), Cornell University Hospital for Animals, ASPCA. — Confiance élevée.

| Catégorie | Signes |
|---|---|
| Respiration | Difficulté à respirer, respiration rapide ; respiration bouche ouverte (**anormale chez le chat**, normale chez un chien qui halète) ; gencives bleues, violettes ou pâles |
| Choc / conscience | Gencives pâles, cœur rapide, pouls faible, peu d'urine ; perte de connaissance, incapacité à se lever, paralysie apparente, température anormale |
| Urinaire | Ne peut pas uriner / urine difficilement (cas typique : **chat mâle bloqué**) |
| Abdominal | Efforts de vomir sans résultat + ventre gonflé, distendu ou douloureux (tableau de **dilatation-torsion**) |
| Digestif | Diarrhée sévère avec sang (rouge ou noire et goudronneuse) ; vomissements sévères ou prolongés |
| Neurologique | Convulsions qui durent, tremblements actifs |
| Toxique | Ingestion d'un médicament ou d'une substance toxique |
| Trauma | Accident, chute, plaie avec os exposé, saignement important, brûlure grave, morsure de serpent possible |
| Autres | Coup de chaleur, mise bas difficile, organe prolabé, étouffement, piqûre d'insecte, rythme cardiaque anormal |

Limites : listes d'exemples, pas un protocole de triage complet ; sources nord-américaines → **validation par un vétérinaire en Haïti requise**.

Sources : [Merck — Dog and Cat Emergencies](https://www.merckvetmanual.com/special-pet-topics/emergencies/evaluation-and-initial-treatment-of-dog-and-cat-emergencies) · [Cornell Emergency & Critical Care](https://www.vet.cornell.edu/hospitals/services/emergency-and-critical-care-0) · [ASPCA Emergency Care](https://www.aspca.org/pet-care/general-pet-care/emergency-care-your-pet)

---

## 3. Rage et zoonoses en Haïti

### 3.1 Situation de la rage
- Rage canine **endémique** et fortement sous-détectée : modèles jusqu'à **~130 décès humains/an**, alors que la surveillance passive enregistrait ~2–4 cas canins et ~7 cas humains par an. Haïti est parmi les derniers pays des Amériques avec des décès par rage canine. — Confiance élevée.
- Surveillance active HARSP (2013-2014) : signalements d'animaux enragés ×18 (meilleure **détection**, pas propagation) ; chiens = 90 % des animaux enragés ; seules **31 %** des personnes probablement exposées avaient commencé une prophylaxie post-exposition (PEP) ; ~95 000 morsures estimées en 2014 dont **6,8 %** déclarées. — Confiance élevée.
- Limite : données 2013–2016, quelques communes de l'Ouest. À citer avec leur année, comme estimations.

Sources : [PMC4657989](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4657989/) · [CDC EID 22(11)](https://wwwnc.cdc.gov/eid/article/22/11/16-0826_article) · [MMWR 68(32)](https://www.cdc.gov/mmwr/volumes/68/wr/mm6832a6.htm)

### 3.2 Conduite après morsure (contenu de sensibilisation)
- **Laver la plaie immédiatement à l'eau et au savon (ou à l'eau seule) pendant au moins 15 minutes**, désinfecter, puis consulter. — OMS, confiance élevée.
- Catégories OMS : II (mordillement de peau nue, griffure sans saignement) → lavage + vaccination immédiate ; III (morsure/griffure traversant la peau, contact muqueuse) → + immunoglobulines.
- En zone d'endémie canine (Haïti), la PEP **commence sans attendre** ; l'observation de 10 jours d'un chien/chat/furet sain sert seulement à **l'arrêter** si l'animal reste sain.
- Les schémas de doses diffèrent (OMS/CDC) et dépendent de la disponibilité locale → **Sanimo renvoie vers un centre de santé, sans donner de schéma.**

### 3.3 Signes de rage chez l'animal
- Forme furieuse : agressivité, perte de la peur de l'humain, morsures à la moindre provocation.
- Forme paralytique : démarche instable, paralysie de la gorge et des muscles masticateurs, bave abondante, difficulté à avaler ; mâchoire pendante fréquente chez le chien.
- Les chiens causent jusqu'à 99 % des cas humains dans le monde.

Sources : [OMS — Rage](https://www.who.int/news-room/fact-sheets/detail/rabies) · [OMS 2018 recommandations](https://www.who.int/news/item/15-01-2018-who-announces-new-rabies-recommendations) · [CDC clinical care](https://www.cdc.gov/rabies/hcp/clinical-care/index.html) · [Merck — Rabies in Animals](https://www.merckvetmanual.com/nervous-system/rabies/rabies-in-animals)

---

## 4. PWA hors ligne

| Sujet | Constat | Confiance |
|---|---|---|
| Installabilité (Chrome Android) | HTTPS ; manifeste avec `name`/`short_name`, icônes 192 et 512 px, `start_url`, `display` standalone/fullscreen/minimal-ui ; `prefer_related_applications` absent ou false. Service worker **plus exigé** pour l'installation (Chrome 108+) mais **indispensable au hors-ligne**. Critère d'engagement avant `beforeinstallprompt` | Élevée |
| iOS | Installation par le menu Partager (iOS 16.4+) ; pas de `beforeinstallprompt` → instructions manuelles | Moyenne |
| Stratégies de cache | Workbox : Cache First, Network First, **Stale-While-Revalidate**, Network Only, Cache Only. SWR adapté au contenu du questionnaire. Precache nécessaire pour le hors-ligne dès la première visite | Élevée |
| Quota | Chromium : jusqu'à 60 % de la taille totale du disque par origine | Élevée |
| Persistance | `navigator.storage.persist()` accordé/refusé **sans demande** (Chromium, Safari) selon l'usage ; installation/favoris aident. Sans persistance : éviction LRU de l'origine entière. Safari 17+ supporte l'API Storage complète | Élevée |
| Background Sync | Chrome/Edge seulement ; ni Safari ni Firefox, peu de chances de devenir Baseline → **synchronisation de repli** (ouverture de l'app, événement `online`) | Élevée |

Sources : [web.dev install criteria](https://web.dev/install-criteria) · [MDN Making PWAs installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_Installable) · [Workbox runtime caching](https://developer.chrome.com/docs/workbox/caching-resources-during-runtime) · [MDN Storage quotas](https://developer.mozilla.org/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) · [web.dev persistent storage](https://web.dev/articles/persistent-storage) · [Background Sync (web-features)](https://web-platform-dx.github.io/web-features-explorer/features/background-sync)

---

## 5. IA locale dans le navigateur

| Sujet | Constat | Confiance |
|---|---|---|
| Chrome Prompt API (Gemini Nano) | **À écarter** : pas sur Android/iOS ; exige ≥ 4 Go VRAM ou 16 Go RAM, 22 Go libres ; langues en, ja, es, de, fr seulement (pas de créole) | Élevée |
| WebGPU sur Android | Par défaut depuis Chrome 121, mais seulement Android 12+ avec GPU Qualcomm/ARM → prévoir repli **WASM/CPU** (transformers.js, ONNX Runtime Web) | Moyenne |
| Taille d'un petit modèle | `Xenova/multilingual-e5-small` : 470 Mo fp32, 235 Mo fp16, 205 Mo q4f16, **118 Mo** int8 (minimum) → lourd pour un premier cache sur téléphone bas de gamme | Élevée |

Performances réelles (latence, mémoire) sur les téléphones courants en Haïti : **non mesurées**.

Sources : [Chrome Prompt API](https://developer.chrome.com/docs/ai/prompt-api) · [New in WebGPU 121](https://developer.chrome.com/blog/new-in-webgpu-121) · [Xenova/multilingual-e5-small](https://huggingface.co/Xenova/multilingual-e5-small)

---

## 6. Créole haïtien et voix

| Sujet | Constat | Confiance |
|---|---|---|
| Synthèse vocale Meta MMS | Modèle dédié `facebook/mms-tts-hat` (VITS). Licence **CC-BY-NC 4.0** : OK pour un prototype non commercial, pas pour une commercialisation. Qualité non mesurée | Élevée |
| Reconnaissance vocale ElevenLabs | Scribe v2 **ne liste pas** le créole haïtien → la saisie vocale créole ne peut pas reposer sur Scribe (documentation susceptible d'évoluer) | Moyenne |
| Réfuté | « MMS ASR couvre le créole » n'a pas pu être confirmé par l'article MMS (vote 0-3) | — |

Sources : [facebook/mms-tts-hat](https://huggingface.co/facebook/mms-tts-hat) · [MMS paper](https://arxiv.org/pdf/2305.13516) · [ElevenLabs STT](https://elevenlabs.io/docs/overview/capabilities/speech-to-text) · [ElevenLabs models](https://elevenlabs.io/docs/overview/models)

---

## 7. Backend

| Sujet | Constat | Confiance |
|---|---|---|
| Supabase (gratuit) | Postgres 500 Mo, 1 Go fichiers, 5 Go egress/mois, 50 000 MAU, **connexions anonymes**. 2 projets actifs max ; **pause après 7 jours d'inactivité** (restaurable) → réactiver avant la démo | Élevée |

Source : [supabase.com/pricing](https://supabase.com/pricing)

---

## 8. Non vérifié — à sourcer ou tester soi-même

- Firebase et Cloudflare (Workers, D1, KV) comme alternatives backend.
- Dexie, WebLLM, MediaPipe LLM, petits LLM (0,5–2B) dans le navigateur.
- Créole : Whisper, MMS ASR, NLLB-200 (`hat_Latn`), Google Translate, synthèse vocale ElevenLabs (multilingual / v3), qualité du créole dans GPT, Claude, Gemini, Llama, Aya ; jeux de données (CMU Haitian Creole…).
- Intoxications précises (chocolat, xylitol, raisins, rodenticides, lys pour le chat, paracétamol), parvovirose du chiot.
- Haïti : connectivité et coût des données (DataReportal 2026, Digicel, Natcom), part d'Android (StatCounter), nombre de vétérinaires et facultés vétérinaires, leptospirose et autres zoonoses après 2016.
- Réglementation haïtienne de l'exercice vétérinaire ou des outils d'orientation.

**Actions suggérées :** tester Whisper, MMS et ElevenLabs en créole pendant la formation ; récupérer les chiffres DataReportal 2026 Haïti à la main ; faire relire l'arbre de décision par un vétérinaire haïtien.
