# Suivi des tâches — Application de coaching sportif

## Instructions pour les agents Claude Code
- Se référer à `docs/cahier-des-charges.md` pour le détail fonctionnel de chaque tâche (les références
  "US-x.x" renvoient aux user stories de la section 8 du cahier des charges).
- Cocher `[x]` une tâche seulement une fois codée **et** testée.
- Respecter l'ordre des phases : ne pas commencer une phase avant que les prérequis de la précédente soient
  cochés (Phase 0 conditionne tout le reste).
- Si une tâche est en cours mais non terminée, ajouter `(en cours)` à côté plutôt que de la cocher.
- Ne pas modifier les décisions d'architecture (stack, hébergement) sans les reporter aussi dans le cahier
  des charges — les deux documents doivent rester cohérents.

---

## Phase 0 — Initialisation du projet
- [x] T0.1 Initialiser le repo (dossiers `frontend/` et `backend/`)
- [x] T0.2 Configurer le projet backend Node.js/Express (squelette, package.json, scripts dev)
- [x] T0.3 Configurer le projet frontend React + Tailwind (Vite recommandé)
- [x] T0.4 Configurer Prisma + connexion à la base Neon (`.env.example`, variables d'environnement)
- [x] T0.5 Migrations initiales à partir du modèle de données (cahier des charges section 4)

## Phase 1 — Authentification & gestion des clients (Epic 1)
- [x] T1.1 Modèle coach + authentification (bcrypt, sessions ou JWT)
- [x] T1.2 API CRUD clients (créer/lister/modifier/archiver) — US-1.1
- [x] T1.3 Frontend : formulaire de création client en une page — US-1.1
- [x] T1.4 Frontend : liste des clients, recherche/filtre, indicateur d'inactivité — US-1.2
- [x] T1.5 API + frontend : duplication profil/programme vers un autre client — US-1.3
  (duplication de **profil** uniquement ; la duplication de **programme** sera complétée en Phase 2
  une fois le CRUD programme disponible)

## Phase 2 — Programme & personnalisation (Epic 2)
- [x] T2.1 Modèle de données : programmes, cycles, semaines_planifiees, jours_entrainement, exercices_programme
  (déjà posé en Phase 0, vérifié conforme)
- [x] T2.2 API CRUD programme (jours, exercices)
- [x] T2.3 Bibliothèque de modèles de split (full body, half body, PPL, bro split) — US-2.1
- [x] T2.4 Algorithme de suggestion de split selon disponibilités/horaires (fonction pure + tests) — US-2.2
- [x] T2.5 Frontend : sélection/application d'un modèle de split, personnalisation des exercices
- [x] T2.6 Frontend : vue calendrier des cycles/semaines (statut normale/deload/test) — US-2.3
- [x] T2.7 Champ lien vidéo/démonstration par exercice — US-2.4
- [x] T2.8 Duplication de programme vers un autre client (reporté de la Phase 1, US-1.3)

## Phase 3 — Nutrition (Epic 3)
- [ ] T3.1 Algorithme BMR/TDEE + objectif calorique/macros (fonction pure + tests unitaires) — US-3.1
- [ ] T3.2 API objectifs_diete (auto/manuel) + journal_diete (CRUD)
- [ ] T3.3 Frontend : affichage/édition des objectifs nutritionnels calculés
- [ ] T3.4 Frontend : journal alimentaire quotidien + moyennes glissantes 7/30 jours
- [ ] T3.5 Frontend : graphique combiné poids + calories — US-3.2

## Phase 4 — Suivi des séances (Epic 4)
- [ ] T4.1 API : log de séance pré-rempli depuis le jour de programme prévu — US-4.1
- [ ] T4.2 Frontend : formulaire de séance (charge/reps réalisées, ressenti, notes)
- [ ] T4.3 Frontend : graphique de progression de charge par exercice — US-4.2

## Phase 5 — Mesures corporelles
- [ ] T5.1 API + frontend : CRUD mesures (poids, tours), graphique d'évolution
- [ ] T5.2 Alerte si absence de mesure récente (seuil configurable, 30 jours par défaut)

## Phase 6 — Tableau de bord & communication (Epic 5, 6)
- [ ] T6.1 Tableau de bord coach (clients actifs, séances de la semaine, relances, deload/test) — US-6.1
- [ ] T6.2 Génération de message pré-rempli partageable WhatsApp/SMS — US-5.1

## Phase 7 — PWA, export, déploiement (Epic 7)
- [ ] T7.1 Manifest PWA + service worker (cache minimal hors-ligne) — US-7.1
- [ ] T7.2 Export des données (CSV/JSON) — US-7.2
- [ ] T7.3 Déploiement backend sur Render
- [ ] T7.4 Déploiement frontend sur Netlify
- [ ] T7.5 Connexion Neon en production + variables d'environnement sécurisées

## Phase 8 — V2/V3 (hors scope initial, ne pas commencer avant validation V1)
- [ ] Historique des versions de programme
- [ ] Notifications/rappels
- [ ] Export PDF d'un programme/bilan
- [ ] Espace client (connexion, saisie autonome)

---

## État global
_Mettre à jour cette ligne à chaque session de travail :_
**Dernière phase active :** Phase 2 — terminée. Prête à démarrer la Phase 3 (Epic 3 : nutrition).

**Notes Phase 0 :**
- Backend : Node/Express (ESM) dans `backend/`, squelette avec route `/health`.
- Frontend : Vite + React + Tailwind CSS v4 (plugin `@tailwindcss/vite`) dans `frontend/`.
- Prisma : v6.19.3 (générateur classique `prisma-client-js`), schéma complet dans
  `backend/prisma/schema.prisma` couvrant toutes les entités de la section 4 du cahier des charges.
  Migration initiale (`prisma/migrations/20260726153909_init`) générée contre un Postgres local
  (Docker), puis appliquée avec succès sur la vraie base **Neon** via `prisma migrate deploy` —
  connexion vérifiée (14 tables + `_prisma_migrations` présentes). `backend/.env` contient
  désormais le vrai `DATABASE_URL` Neon (non commité, cf. `.gitignore`).
- Branche : `feature/phase-0`, mergée sur `main` via PR #1.

**Notes Phase 1 :**
- Auth JWT (bcryptjs + jsonwebtoken) : `POST /api/auth/register`, `POST /api/auth/login`,
  `GET /api/auth/me`. Middleware `requireAuth` dans `backend/src/middleware/auth.js`. `JWT_SECRET`
  ajouté à `.env` / `.env.example`.
- API clients (`backend/src/routes/clients.routes.js`), scopée par coach : CRUD, recherche (`?search=`),
  filtre archivés (`?archive=true`), indicateur d'inactivité calculé depuis `updatedAt`
  (`?seuilJours=`, 30 par défaut), duplication de profil (`POST /clients/:id/duplicate`, vers un
  nouveau client ou en écrasant un client existant via `targetClientId`).
- Frontend : routing `react-router-dom`, `AuthContext` (JWT en `localStorage`), pages
  login/register/liste clients/formulaire client (une page, nom+objectif seuls obligatoires,
  grille de disponibilités optionnelle), modale de duplication avec confirmation avant écrasement.
- Testé de bout en bout (register → login → CRUD → recherche → duplication → archivage) via
  navigateur piloté (claude-in-chrome) et via API (curl) contre la vraie base Neon ; données de
  test nettoyées après chaque vérification.
- Branche : `feature/phase-1`, mergée sur `main` via PR #2.

**Notes Phase 2 :**
- Modèle de données déjà complet depuis la Phase 0 (`Programme`, `Cycle`, `SemainePlanifiee`,
  `JourEntrainement`, `ExerciceProgramme`, `TemplateProgramme`), y compris `lienVideo` (T2.7).
- Algorithme de suggestion de split : fonction pure `suggererSplit()` dans
  `backend/src/lib/splitSuggestion.js`, 9 tests unitaires (`node --test`), table de correspondance
  jours dispo/expérience/horaires conforme à la section 3.3 du cahier des charges (horaires
  irréguliers → toujours full body, quel que soit le nombre de jours).
- Bibliothèque de splits intégrée (`backend/src/lib/splitTemplates.js`, `GET /api/templates/archetypes`)
  couvrant les 4 types (full body, half body, PPL, bro split) avec jours + exercices pré-remplis.
  Bibliothèque de modèles réutilisables entre clients via `TemplateProgramme`
  (`POST/GET/DELETE /api/templates`, sauvegarde depuis un programme existant).
- API programme imbriquée sous `/api/clients/:id/programmes` (liste/création) et
  `/api/programmes/:id` (détail/édition/suppression/duplication), `/api/programmes/:id/cycles`,
  `/api/cycles/:id`, `/api/semaines/:id` — ownership vérifiée à chaque niveau via
  `backend/src/lib/ownership.js` (remonte jusqu'à `client.coachId`).
- Duplication de programme (T2.8) : copie la structure jours/exercices vers un nouveau programme
  chez un autre client (pas de cycles/semaines dupliqués — la planification temporelle ne se
  reporte pas automatiquement).
- Frontend : pages `ProgrammesListPage`, `ProgrammeFormPage` (sélection de split suggéré/archétype/
  modèle sauvegardé, éditeur de jours/exercices avec lien vidéo, enregistrement en tant que modèle),
  `ProgrammeCalendarPage` (cycles + grille de semaines avec statut normale/deload/test éditable).
- Testé de bout en bout (suggestion de split, création depuis archétype, cycles/semaines, changement
  de statut, duplication vers un autre client, sauvegarde en modèle) via navigateur piloté et API
  contre la vraie base Neon ; données de test nettoyées après vérification.
- Branche : `feature/phase-2`, partie de `main` (post-merge PR #2).
