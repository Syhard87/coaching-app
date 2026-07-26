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
- [ ] T0.1 Initialiser le repo (dossiers `frontend/` et `backend/`)
- [ ] T0.2 Configurer le projet backend Node.js/Express (squelette, package.json, scripts dev)
- [ ] T0.3 Configurer le projet frontend React + Tailwind (Vite recommandé)
- [ ] T0.4 Configurer Prisma + connexion à la base Neon (`.env.example`, variables d'environnement)
- [ ] T0.5 Migrations initiales à partir du modèle de données (cahier des charges section 4)

## Phase 1 — Authentification & gestion des clients (Epic 1)
- [ ] T1.1 Modèle coach + authentification (bcrypt, sessions ou JWT)
- [ ] T1.2 API CRUD clients (créer/lister/modifier/archiver) — US-1.1
- [ ] T1.3 Frontend : formulaire de création client en une page — US-1.1
- [ ] T1.4 Frontend : liste des clients, recherche/filtre, indicateur d'inactivité — US-1.2
- [ ] T1.5 API + frontend : duplication profil/programme vers un autre client — US-1.3

## Phase 2 — Programme & personnalisation (Epic 2)
- [ ] T2.1 Modèle de données : programmes, cycles, semaines_planifiees, jours_entrainement, exercices_programme
- [ ] T2.2 API CRUD programme (jours, exercices)
- [ ] T2.3 Bibliothèque de modèles de split (full body, half body, PPL, bro split) — US-2.1
- [ ] T2.4 Algorithme de suggestion de split selon disponibilités/horaires (fonction pure + tests) — US-2.2
- [ ] T2.5 Frontend : sélection/application d'un modèle de split, personnalisation des exercices
- [ ] T2.6 Frontend : vue calendrier des cycles/semaines (statut normale/deload/test) — US-2.3
- [ ] T2.7 Champ lien vidéo/démonstration par exercice — US-2.4

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
**Dernière phase active :** Phase 0 — non démarrée
