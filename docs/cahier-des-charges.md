# Cahier des charges — Application de suivi coaching sportif
Version production (Claude Code)

## 1. Contexte et objectifs

Un coach sportif indépendant a besoin d'un outil pour gérer plusieurs clients en simultané :
profils, programmes d'entraînement personnalisés, planification dans le temps, suivi réel des séances,
suivi nutritionnel (avec calcul automatique des besoins caloriques) et suivi des mesures corporelles.

Un prototype fonctionnel existe déjà sous forme d'artefact Claude (HTML/CSS/JS autonome, stockage clé-valeur).
Ce document définit ce qu'il faudrait construire pour en faire une **vraie application** complète : accessible
depuis plusieurs appareils, avec une base de données réelle, des algorithmes de calcul nutritionnel, une
planification pluri-hebdomadaire des programmes, et des types de séances adaptés au profil et aux contraintes
de chaque client.

**Objectif de cette phase :** servir de brief complet à Claude Code pour développer l'application de façon
structurée, plutôt que d'improviser fonctionnalité par fonctionnalité.

## 2. Utilisateurs

- **Utilisateur principal :** le coach — gère ses clients, construit les programmes, consulte les suivis.
- **Utilisateur secondaire (optionnel, phase 2) :** le client final — pourrait avoir un accès en lecture seule
  à son propre programme et à son historique, et pourrait saisir lui-même ses mesures/séances/repas.

## 3. Fonctionnalités

### 3.1 Gestion des clients — profil étendu
- Créer / modifier / archiver une fiche client
- Champs d'identité et de santé : nom, âge, sexe, taille (cm), poids initial (kg), objectif (prise de masse /
  perte de poids / remise en forme / performance), date de début, notes santé, indicateur "suivi médical en
  cours"
- Champs pour l'adaptation du programme :
  - **Niveau d'activité générale** (sédentaire, légèrement actif, modérément actif, très actif) — utilisé
    dans le calcul des besoins caloriques
  - **Profession et horaires de travail** (ex. horaires de bureau, travail posté/3x8, horaires irréguliers)
  - **Disponibilités hebdomadaires** : jours de la semaine + créneaux (matin / midi / soir / indisponible),
    saisis une fois et réutilisés pour construire un programme réaliste
  - **Expérience sportive** (débutant / intermédiaire / confirmé)
- Recherche et filtre dans la liste de clients

### 3.2 Calcul automatique des besoins nutritionnels
L'application calcule une proposition de base, que le coach peut toujours ajuster manuellement — l'algorithme
assiste la décision, il ne la remplace pas.

**Étape 1 — Métabolisme de base (BMR)**, formule de Mifflin-St Jeor (référence actuelle la plus fiable) :
- Homme : `BMR = 10 × poids(kg) + 6,25 × taille(cm) − 5 × âge + 5`
- Femme : `BMR = 10 × poids(kg) + 6,25 × taille(cm) − 5 × âge − 161`

**Étape 2 — Dépense énergétique totale (TDEE)** = BMR × facteur d'activité :
| Niveau d'activité | Facteur |
|---|---|
| Sédentaire | 1,2 |
| Légèrement actif (1-3 séances/sem.) | 1,375 |
| Modérément actif (3-5 séances/sem.) | 1,55 |
| Très actif (6-7 séances/sem.) | 1,725 |
| Extrêmement actif (sport + métier physique) | 1,9 |

**Étape 3 — Objectif calorique**, au choix du coach selon le profil du client :
| Objectif | Ajustement | Usage typique |
|---|---|---|
| Perte de poids — déficit léger | TDEE − 250 kcal/j | Perte plus lente (~0,25 kg/sem.), plus durable, adapté aux profils sensibles |
| Perte de poids — déficit modéré | TDEE − 500 kcal/j | Rythme classique (~0,5 kg/sem.) |
| Prise de masse — surplus léger | TDEE + 250 kcal/j | Prise "propre", minimise le gain de gras |
| Prise de masse — surplus modéré | TDEE + 500 kcal/j | Prise plus rapide, notamment pour profils en insuffisance pondérale |
| Maintien / remise en forme | TDEE ± 0 | Stabilisation, recomposition corporelle |

**Étape 4 — Répartition des macronutriments**, calculée à partir des calories cibles :
- Protéines : 1,6 à 2,2 g/kg de poids de corps (haut de fourchette conseillé dans les deux objectifs, pour
  préserver la masse musculaire)
- Lipides : 0,8 à 1 g/kg
- Glucides : le reste des calories cibles

Le résultat (calories + macros) pré-remplit les objectifs nutritionnels du client (voir 3.5), modifiables à
tout moment.

### 3.3 Création de programme — types de séances et personnalisation
- Un programme est structuré en **jours d'entraînement**, chacun avec une liste d'exercices (nom, séries,
  reps, charge cible, temps de repos, notes)
- **Types de split disponibles**, sélectionnables en un clic (modèles pré-remplis, puis personnalisables) :
  - **Full body** : tout le corps à chaque séance — adapté aux emplois du temps chargés (2-3 jours/semaine)
  - **Half body / Upper-Lower** : alternance haut du corps / bas du corps — 4 jours/semaine
  - **PPL (Push / Pull / Legs)** : poussée, tirage, jambes — 3, 5 ou 6 jours/semaine selon répétition du cycle
  - **Bro split** : un groupe musculaire par séance (pecs, dos, jambes, épaules, bras) — 5 jours/semaine, profil expérimenté
- **Suggestion automatique du split** en fonction des disponibilités déclarées par le client (voir 3.1) :

| Jours disponibles/semaine | Split suggéré par défaut |
|---|---|
| 2 jours | Full body |
| 3 jours | Full body (ou Half body si expérimenté) |
| 4 jours | Half body (Upper/Lower) |
| 5 jours | PPL + 2 jours, ou Bro split (selon expérience) |
| 6 jours | PPL × 2 (cycle complet répété) |

  La suggestion tient aussi compte des horaires de travail (ex. horaires postés irréguliers → proposer un
  split flexible type Full body plutôt qu'un PPL strict qui suppose une régularité).
  Cette suggestion reste modifiable à tout moment par le coach.
- Bibliothèque de **modèles de programme** réutilisables entre clients (par type de split)

### 3.4 Planification temporelle — semaines et mois
- Un programme est découpé en **cycles** (ou "blocs", ex. "Bloc 1 — Hypertrophie, 4 semaines")
- Chaque cycle contient plusieurs **semaines planifiées**, avec un statut :
  - Semaine normale
  - Semaine de **deload** (charge réduite, récupération)
  - Semaine de **test** (évaluation, 1RM ou séance de référence)
- **Progression automatique proposée** d'une semaine à l'autre (ex. +2,5 à +5 % de charge), ajustable
  manuellement séance par séance
- Vue **calendrier / planning** : le coach voit en un coup d'œil où en est chaque client dans son cycle
  (semaine 3 sur 8, prochain deload dans 2 semaines, etc.)
- Possibilité de dupliquer une semaine ou un cycle complet pour l'adapter rapidement à un autre client

### 3.5 Suivi réel des séances
- Log d'une séance : date, jour de programme concerné (ou séance libre), charge/reps réellement réalisées
  par exercice, ressenti (RPE), notes
- Vue de **progression par exercice** dans le temps (graphique charge/reps)
- Historique complet, filtrable par période, par cycle, par semaine

### 3.6 Suivi nutritionnel (diète)
- Objectifs nutritionnels par client : calculés automatiquement (voir 3.2) ou saisis manuellement
- Journal alimentaire quotidien (calories, macros, eau, notes de repas)
- Moyennes glissantes (7/30 jours), écart par rapport aux objectifs cibles
- Graphique d'évolution des calories et du poids en parallèle (pour visualiser la cohérence entre les deux)

### 3.7 Suivi des mesures corporelles
- Poids, tours de bras/taille/poitrine/cuisse, notes
- Graphiques d'évolution, mis en regard du cycle d'entraînement en cours
- Alertes si un client n'a pas de mesure récente (> 30 jours par exemple)

### 3.8 Tableau de bord coach
- Vue d'ensemble : nombre de clients actifs, séances loguées cette semaine, clients à relancer,
  clients en semaine de deload/test cette semaine
- Notifications/rappels (phase 2)

### 3.9 (Phase 2 — optionnel) Espace client
- Connexion sécurisée pour chaque client
- Consultation de son programme du jour/de la semaine, saisie de ses propres séances/repas/mesures
- Notifications de rappel de séance

## 4. Modèle de données (structure indicative)

- `coaches` (id, nom, email, mot_de_passe_hash)
- `clients` (id, coach_id, nom, âge, sexe, taille_cm, poids_initial, objectif, date_début, notes_santé,
  suivi_médical, niveau_activité, profession, expérience_sportive)
- `disponibilites` (id, client_id, jour_semaine, créneau [matin/midi/soir], disponible)
- `programmes` (id, client_id, nom, type_split, fréquence, version)
- `cycles` (id, programme_id, nom, ordre, durée_semaines)
- `semaines_planifiees` (id, cycle_id, numéro_semaine, statut [normale/deload/test], notes)
- `jours_entrainement` (id, semaine_id ou programme_id, nom, ordre)
- `exercices_programme` (id, jour_id, nom, séries, reps, charge_cible, repos, notes)
- `seances` (id, client_id, date, jour_id, ressenti, notes)
- `exercices_realises` (id, seance_id, nom, charge_réalisée, reps_réalisées, notes)
- `objectifs_diete` (id, client_id, méthode_calcul [auto/manuel], tdee_calculé, type_objectif_calorique,
  calories_cible, protéines_cible, glucides_cible, lipides_cible)
- `journal_diete` (id, client_id, date, calories, protéines, glucides, lipides, eau, repas, notes)
- `mesures` (id, client_id, date, poids, bras, taille, poitrine, cuisse, notes)
- `templates_programme` (id, coach_id, nom, type_split, contenu_json)

## 5. Architecture technique (décisions figées)

| Composant | Choix retenu | Pourquoi |
|---|---|---|
| Langage | JavaScript / TypeScript partout | Un seul langage frontend + backend, écosystème le mieux supporté par l'hébergement gratuit, et le plus performant avec Claude Code |
| Frontend | React + Tailwind | Écosystème mature, composants réutilisables pour les graphiques/formulaires |
| Backend | Node.js (Express) | S'intègre nativement avec React, léger à héberger gratuitement |
| Base de données | PostgreSQL hébergé sur **Neon** (palier gratuit permanent) | Gratuit, scale-to-zero sans perte de données, gère bien les relations (clients → programmes → cycles → séances) |
| ORM | Prisma | Évite d'écrire du SQL à la main, migrations versionnées |
| Authentification | Email/mot de passe (bcrypt) + sessions ou JWT | Simple à mettre en place pour un usage mono-coach au départ |
| Hébergement frontend | **Netlify** (gratuit) | Généreux en bande passante, tolérant à l'usage commercial (contrairement à Vercel Hobby) |
| Hébergement backend | **Render** (gratuit, service web) | Déploiement simple depuis Git, pas de carte bancaire requise |
| Distribution | **PWA** (Progressive Web App), pas de store | Installable sur l'écran d'accueil iOS/Android, gratuit, sans délai de validation ni frais d'App Store |
| Graphiques | Recharts | Cohérent avec les visualisations déjà construites dans le prototype |

**Coût mensuel visé : 0 €**, avec un compromis connu et accepté : le backend Render gratuit se met en veille
après 15 minutes d'inactivité (premier chargement de la journée un peu plus lent, ~30-60s). À réévaluer vers
un petit forfait payant (5-25 €/mois) si l'app devient un outil quotidien critique.

**Ce que Claude Code peut faire concrètement :** initialiser le projet (frontend React + backend Node/Express),
écrire le schéma Prisma et les migrations, implémenter les algorithmes de calcul nutritionnel et de suggestion
de split (fonctions pures, testables unitairement), développer les routes API, construire les écrans React
(profil, création de programme avec sélection de split, planning calendaire, journal de séances, diète,
mesures), configurer le manifest PWA, écrire les tests, et préparer le déploiement sur Netlify/Render/Neon —
le tout en s'appuyant sur ce cahier des charges comme fil conducteur.

## 6. Contraintes non-fonctionnelles

- **Données de santé sensibles** : les notes médicales et données nutritionnelles/mesures sont des données
  personnelles sensibles. Prévoir un chiffrement des données au repos et un accès restreint par authentification
  dès la V1, même en mono-utilisateur.
- **RGPD (si clients français/UE)** : possibilité pour un client d'obtenir ou de faire supprimer ses données
  s'il a un accès direct (phase 2).
- **Les algorithmes sont assistifs, pas prescriptifs** : toute valeur calculée automatiquement (calories,
  macros, split suggéré, progression de charge) doit rester visible comme *proposition*, modifiable par le
  coach avant validation — l'application ne doit jamais appliquer une recommandation sans validation humaine.
- **Sauvegardes régulières** de la base de données.
- **Responsive** : utilisable aussi bien sur ordinateur qu'en mobilité (le coach est rarement derrière un bureau).

## 7. Phasage proposé

1. **V1 — Usage mono-coach, cœur de métier complet** : gestion clients (profil étendu), calcul nutritionnel
   automatique, création de programme avec choix de split et suggestion automatique selon disponibilités,
   planification en cycles/semaines, suivi réel des séances, journal alimentaire, suivi des mesures — le tout
   avec une vraie base de données et un déploiement accessible depuis plusieurs appareils.
2. **V2 — Confort d'usage** : historique des versions de programme, rappels/notifications, export PDF d'un
   programme ou d'un bilan pour l'envoyer au client.
3. **V3 — Espace client** : connexion client, saisie autonome, notifications.

## 8. User stories & analyse UX

### Méthodologie
Pour se mettre à la place d'un coach utilisateur, analyse d'avis et comparatifs professionnels sur les
plateformes existantes (Trainerize, TrueCoach, PT Distinction, My PT Hub), afin de repérer les frictions
réelles plutôt que des problèmes hypothétiques.

### Points de friction identifiés sur le marché
- Coût qui grimpe avec le nombre de clients, modules nutrition/automatisation facturés en supplément
- Interfaces pensées pour le marché anglophone US/UK, pas d'adaptation française, support lent
- Absence d'intégration WhatsApp native — canal n°1 des coachs francophones avec leurs clients
- Chaque plateforme est forte sur un axe (entraînement ou nutrition), rarement homogène sur les deux
- App à la marque du coach payante en supplément ou indisponible selon la plateforme
- Bugs/régressions documentés après rachat de certaines plateformes, synchronisations tierces peu fiables
- Aucune portabilité réelle des données entre plateformes (pas d'export/migration automatisé)

### Comment l'application y répond dès la conception
- Outil personnel, pas de coût par client
- Conçu en français dès le départ
- Nutrition et entraînement nativement intégrés (pas un module séparé, voir 3.2 à 3.7)
- Données hébergées sur une base propre (Neon/PostgreSQL) : export possible à tout moment

### Epic 1 — Gestion des clients & onboarding
- **US-1.1** — En tant que coach, je veux créer une fiche client complète en moins de deux minutes, afin de
  ne pas perdre de temps administratif à l'arrivée d'un nouveau client.
  *Critère : formulaire en une page, seuls nom + objectif obligatoires à la création.*
- **US-1.2** — En tant que coach, je veux repérer en un coup d'œil les clients sans mise à jour récente,
  afin de savoir qui relancer sans ouvrir chaque fiche.
  *Critère : indicateur visuel si aucune activité depuis un seuil configurable.*
- **US-1.3** — En tant que coach, je veux dupliquer un profil ou un programme vers un autre client, afin de
  gagner du temps quand plusieurs clients partagent un objectif proche.
  *Critère : bouton "dupliquer vers", confirmation avant écrasement.*

### Epic 2 — Création de programme & personnalisation
- **US-2.1** — En tant que coach, je veux choisir un split (full body / half body / PPL / bro split) depuis
  un modèle, afin de ne pas reconstruire un programme depuis zéro.
- **US-2.2** — En tant que coach, je veux une suggestion de split basée sur les disponibilités/horaires du
  client, afin de proposer un programme réaliste (voir 3.3).
- **US-2.3** — En tant que coach, je veux planifier un programme sur plusieurs semaines avec deload/test
  intégrés, afin de piloter la progression dans la durée (voir 3.4).
- **US-2.4** — En tant que coach, je veux attacher un lien vidéo/note à un exercice, afin que le client
  comprenne le mouvement sans ambiguïté.

### Epic 3 — Suivi nutritionnel
- **US-3.1** — En tant que coach, je veux des objectifs caloriques/macros calculés automatiquement par
  client, afin de ne pas refaire le calcul à la main (voir 3.2).
- **US-3.2** — En tant que coach, je veux voir poids et calories sur un même graphique, afin de vérifier la
  cohérence entre suivi alimentaire et résultats réels.

### Epic 4 — Suivi des séances & progression
- **US-4.1** — En tant que coach, je veux logger une séance directement depuis le programme du jour, afin
  de ne pas ressaisir la liste d'exercices.
- **US-4.2** — En tant que coach, je veux visualiser la progression de charge par exercice, afin d'ajuster
  le programme si un client stagne.

### Epic 5 — Communication coach-client
- **US-5.1** — En tant que coach, je veux générer un message pré-rempli (résumé séance/mesures) prêt à
  envoyer par WhatsApp/SMS, afin de rester sur le canal que mes clients utilisent déjà.

### Epic 6 — Tableau de bord
- **US-6.1** — En tant que coach, je veux un tableau de bord regroupant entraînement, nutrition et mesures,
  afin d'avoir une vue d'ensemble sans naviguer entre modules cloisonnés (voir 3.8).

### Epic 7 — Accès mobile & fiabilité
- **US-7.1** — En tant que coach, je veux consulter/modifier une fiche client même en connexion instable
  (salle de sport), afin de ne pas être bloqué en plein cours.
- **US-7.2** — En tant que coach, je veux exporter mes données à tout moment, afin de ne jamais dépendre
  d'un éditeur tiers pour récupérer mon travail.

### Priorisation V1
| Priorité | Epics |
|---|---|
| Indispensable | Epic 1, Epic 2, Epic 3, Epic 4 |
| Fort impact UX | Epic 6, Epic 5 (US-5.1) |
| Peut attendre la V2 | Epic 7 (offline avancé), reste d'Epic 5 |

## 9. Décisions prises

- **Stack :** React (frontend) + Node.js/Express (backend) — un seul langage, JavaScript/TypeScript.
- **Hébergement :** Netlify (frontend) + Render (backend) + Neon (base PostgreSQL) — paliers gratuits.
- **Distribution :** application web (PWA), pas de publication sur App Store / Google Play.
- **Budget visé :** 0 €/mois pour démarrer, avec passage à un forfait payant si l'usage le justifie plus tard.
- **Portée V1 :** usage mono-coach (voir phasage section 7), mais avec l'intégralité des fonctionnalités
  métier (nutrition automatisée, splits personnalisés, planification pluri-hebdomadaire) — l'ouverture à
  plusieurs coachs n'est pas prévue avant une phase ultérieure.

Ce cahier des charges est prêt à être donné tel quel à Claude Code pour démarrer le développement.
