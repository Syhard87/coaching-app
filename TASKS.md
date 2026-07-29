# Suivi des tâches — Application de coaching sportif

## Instructions pour les agents Claude Code
- Se référer à `docs/cahier-des-charges.md` (version définitive) pour le détail fonctionnel de chaque
  tâche — c'est la référence unique du projet, elle intègre le tri explicite des fonctionnalités
  (section 10, Roadmap) pour éviter toute discussion répétée sur le périmètre.
- Cocher `[x]` une tâche seulement une fois codée **et** testée contre la vraie base Neon.
- Respecter l'ordre des phases.
- Committer, pousser et ouvrir une PR à la fin de chaque phase — ne pas enchaîner directement sur la
  phase suivante sans validation humaine.
- Mettre à jour la ligne "État global" en bas de ce fichier à chaque session.

---

## Phases 0 à 9 — ✅ Terminées, déployées en production
Authentification, gestion clients, création de programme (splits, cycles, GIF de démonstration via
`free-exercise-db`), suivi des séances et progression, nutrition (calcul automatique Mifflin-St Jeor),
mesures corporelles, tableau de bord, PWA + export de données, prospection (page publique + pipeline).
Détail complet de l'implémentation : historique Git (PRs #1 à #9) et notes de chaque phase conservées dans
les commits — non reproduites ici pour ne pas alourdir ce fichier.

**Déployé sur** : Netlify (frontend), Render (backend), Neon (base de données).

## Phase 9.5 — Authentification Google OAuth (avant la Phase 10)
Remplace l'authentification email/mot de passe + JWT. Voir cahier des charges section 7.

- [x] T9.5.1 *(manuel, coach)* Créer un projet Google Cloud, configurer l'écran de consentement OAuth,
      générer Client ID + Client Secret
- [x] T9.5.2 Backend : intégration OAuth2 Google (ex. `passport-google-oauth20` ou équivalent), migration
      du modèle `Coach` (retirer l'obligation de `mot_de_passe_hash`, ajouter `googleId`, `avatarUrl`)
- [x] T9.5.3 Frontend : bouton "Se connecter avec Google", suppression du formulaire email/mot de passe
- [x] T9.5.4 Migration du compte coach existant : le relier à son compte Google sans perte de données
      (clients, programmes, historique conservés)
- [x] T9.5.5 Testé de bout en bout (connexion réelle, déconnexion, reconnexion) contre la vraie base Neon

## ⚠️ Nettoyage préalable à la Phase 10 — ✅ effectué (2026-07-28)
Un premier travail sur un modèle de "formules à l'heure" avait été commencé puis abandonné (changement de
modèle économique vers des abonnements mensuels par module). Avant de démarrer la Phase 10 :
- [x] T10.0a Vérifier qu'aucun commit lié aux "formules à l'heure" n'est mergé sur `main` — confirmé : le
      seul commit concerné vivait sur `feature/phase-10` (supprimée), écrasé avant suppression, non référencé
- [x] T10.0b Supprimer toute branche `feature/phase-10` résiduelle, repartir de `main` à jour — déjà absente

## Phase 10 — Design system + Réorganisation à 3 onglets + Abonnements par module
Remplace définitivement l'ancien modèle et l'ancien style visuel en une seule fois — pas de refonte
graphique séparée après coup. Voir cahier des charges sections 3, 4, 5, 6, 7.1.

- [x] T10.0c Mettre en place les tokens Tailwind (couleurs, polices Oswald/Inter/IBM Plex Mono) et
      installer Framer Motion — base appliquée à tous les écrans reconstruits dans cette phase
- [x] T10.1 Modèle `catalogue_abonnements` + `client_abonnements`, migration, catalogue par défaut à la
      création d'un compte coach (grille : Sport/Diète 50€ 1 mois, 120€ 3 mois, 180€ 6 mois ; Pack Complet
      85€/200€/300€)
- [x] T10.2 API : vendre un abonnement à un client, consulter l'état des modules actifs, calcul automatique
      de la date de fin
- [x] T10.3 Logique d'accès aux modules (fonction pure, testée) : Sport actif / Diète actif / aucun,
      d'après les abonnements en cours du client
- [x] T10.4 Frontend : réorganiser la fiche client en exactement 3 onglets, avec le nouveau design system —
      **Bilan** (fusionne Profil + Mesures existants), **Programme sportif** (fusionne Programmes + Séances
      existants), **Nutritionnel** (reprend l'onglet Diète existant)
- [x] T10.5 Frontend : état "non souscrit" avec invitation à vendre sur Programme sportif / Nutritionnel
      quand l'abonnement correspondant n'est pas actif (jamais masqué ni vide sans explication)
- [x] T10.6 Bandeau de rappel sécurité médicale (non bloquant) sur l'onglet Bilan si `suivi_medical_en_cours`
      est coché, avant validation d'un objectif calorique ou d'un programme intensif
- [x] T10.7 Carte "Abonnements à renouveler bientôt" sur le tableau de bord, barre de progression animée
- [x] T10.8 Frontend : gestion du catalogue d'abonnements dans les paramètres coach (édition prix/durées) —
      couvre l'édition du prix ; les durées restent la grille fixe 1/3/6 mois

## Phase 11 — Planning & réservation (V1.1) — codée et testée contre Neon, PR #12 ouverte (non mergée)
- [x] T11.1 Modèle `creneaux_disponibles` + `reservations`, migration
- [x] T11.2 API : définir des créneaux disponibles (récurrents ou ponctuels)
- [x] T11.3 API : réserver un créneau pour un client (le coach réserve en son nom en attendant un espace
      client), changement de statut (confirmée/annulée/honorée)
- [x] T11.4 Frontend : page "Planning" coach (définir ses créneaux, vue des réservations)
- [x] T11.5 Frontend : séances à venir affichées dans l'onglet Programme sportif, distinctes de l'historique
- [x] T11.6 Carte "Prochaines réservations" sur le tableau de bord

## Phase 11.5 — Correctif : lien Bilan ↔ Nutritionnel
Bug identifié en usage réel avec un vrai client. Voir cahier des charges section 4.3. Prioritaire, avant
la Phase 12 — corrige un comportement déjà en production, pas une nouvelle fonctionnalité.

- [ ] T11.5.1 Investiguer : confirmer que le calcul BMR/TDEE utilise actuellement `client.poids_initial`
      (figé) plutôt que la dernière entrée de `mesures`
- [ ] T11.5.2 Backend : faire utiliser la mesure de poids la plus récente du client comme source pour le
      calcul, avec repli sur `poids_initial` uniquement si aucune mesure n'existe encore
- [ ] T11.5.3 Frontend : supprimer le formulaire de saisie de poids dupliqué en bas de l'onglet
      Nutritionnel ("Poids & calories") — la saisie ne se fait plus que depuis l'onglet Bilan
- [ ] T11.5.4 Frontend : afficher sur quelles données repose le calcul actuel (poids + date de la mesure)
- [ ] T11.5.5 Frontend : bouton "Recalculer avec les dernières données" si une mesure plus récente existe
      que celle utilisée pour le dernier calcul — jamais de recalcul automatique/silencieux
- [ ] T11.5.6 Testé de bout en bout : ajouter une nouvelle mesure de poids, vérifier que le bouton de
      recalcul apparaît, vérifier que les nouveaux objectifs sont corrects après clic

## Phase 12 — Photos de progression (V1.1)
- [ ] T12.1 Modèle `photos_progression`, migration, stockage avec protection renforcée (voir cahier des
      charges section 8 — traitement équivalent aux données de santé)
- [ ] T12.2 API upload/liste/suppression, scoping strict par coach, jamais d'URL publique prévisible
- [ ] T12.3 Frontend : ajout de photo datée depuis l'onglet Bilan, frise chronologique de comparaison

## Phase 13 — Objectifs client structurés (V1.1)
- [ ] T13.1 Modèle `objectifs_client` (description, valeur cible, unité, échéance, statut), migration
- [ ] T13.2 API CRUD objectifs
- [ ] T13.3 Frontend : affichage sur l'onglet Bilan avec indicateur de progression vers l'échéance

## Phase 14+ — V2 (ne pas commencer avant validation complète de la V1.1)
Voir cahier des charges section 10 : paiement en ligne (Stripe), repas types réutilisables,
automatisations de relance, statistiques coach enrichies, suivi d'habitudes simples, espace client complet.

## Hors périmètre (voir cahier des charges section 10 pour la justification)
Application mobile native, connexion biométrique, connexion santé/balance connectée, accès salle sécurisé,
mode kiosk, SEO/site vitrine/newsletter, Drive, Vidéothèque VOD, gestion multi-coach, module de
comptabilité/facturation.

---

## État global
_Mettre à jour cette ligne à chaque session de travail :_
**Dernière phase active :** Phase 11.5 (correctif lien Bilan ↔ Nutritionnel) — investigation en cours.
Phases 9.5, 10 mergées dans `main`. Phase 11 (Planning & réservation) codée et testée contre Neon, PR #12
ouverte, en attente de revue humaine avant merge.
