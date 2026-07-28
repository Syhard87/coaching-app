Suivi des tâches — Application de coaching sportif
Instructions pour les agents Claude Code
Se référer à docs/cahier-des-charges.md (version définitive) pour le détail fonctionnel de chaque tâche — c'est la référence unique du projet, elle intègre le tri explicite des fonctionnalités (section 10, Roadmap) pour éviter toute discussion répétée sur le périmètre.
Cocher [x] une tâche seulement une fois codée et testée contre la vraie base Neon.
Respecter l'ordre des phases.
Committer, pousser et ouvrir une PR à la fin de chaque phase — ne pas enchaîner directement sur la phase suivante sans validation humaine.
Mettre à jour la ligne "État global" en bas de ce fichier à chaque session.
Phases 0 à 9.5 — ✅ Terminées, déployées en production

Authentification (Google OAuth2, migration depuis email/mot de passe), gestion clients, création de programme (splits, cycles, GIF de démonstration via free-exercise-db), suivi des séances et progression, nutrition (calcul automatique Mifflin-St Jeor), mesures corporelles, tableau de bord, PWA + export de données, prospection (page publique + pipeline). Détail complet de l'implémentation : historique Git (PRs #1 à #9, PR Phase 9.5) et notes de chaque phase conservées dans les commits — non reproduites ici pour ne pas alourdir ce fichier.

Déployé sur : Netlify (frontend), Render (backend), Neon (base de données).

✅ Nettoyage préalable à la Phase 10 (effectué le 2026-07-28)

Investigation menée avant de démarrer la Phase 10, deux constats distincts :
- "Formules à l'heure" (ancien Epic 9 abandonné) : confirmé qu'aucun commit lié n'a jamais touché `main` — le seul commit concerné (`91098c6`) vivait sur `feature/phase-10`, écrasé par le pivot final dans cette même branche avant sa suppression ; il ne subsiste qu'à l'état d'objet Git non référencé (`git fsck --unreachable`), sans risque. Branche `feature/phase-10` déjà absente (locale et distante).
- Anomalie distincte détectée en cours de route : la PR #9 (Phase 9 — Prospection) était restée ouverte et non mergée alors que sa migration (`slug` coach + modèle `Prospect`) avait été appliquée manuellement sur Neon en production, créant un écart entre `main` et la base réelle. Régularisé : PR #9 mergée dans `main`, puis fusionnée dans `feature/phase-9.5` — schéma local et Neon désormais identiques (`prisma migrate status` : up to date), 47 tests backend + build/tests frontend passent après fusion.

Phase 10 — ✅ Terminée (2026-07-28) — Design system + Réorganisation à 3 onglets + Abonnements par module

Remplace définitivement l'ancien modèle et l'ancien style visuel en une seule fois — pas de refonte graphique séparée après coup. Voir cahier des charges sections 3, 4, 5, 6, 7.1.

Tokens Tailwind (palette graphite/chalk + accent orange-fer, Oswald/Inter/IBM Plex Mono) et Framer Motion en place. Modèle `catalogue_abonnements`/`client_abonnements` + migration, catalogue par défaut à la création d'un coach (avec filet de rattrapage pour les comptes créés avant cette phase). API de vente/consultation/édition, logique d'accès aux modules en fonction pure testée. Fiche client réorganisée en 3 onglets (Bilan fusionne Profil+Mesures, Programme sportif fusionne Programmes+Séances, Nutritionnel reprend l'ancien onglet Diète), état "non souscrit" avec invitation à vendre, bandeau de rappel sécurité médicale, en-tête d'abonnements avec barre de progression animée, carte dashboard "abonnements à renouveler", page Paramètres pour éditer les prix du catalogue.

Note de périmètre : l'édition du catalogue (T10.8) couvre le prix ; les durées restent la grille fixe 1/3/6 mois (pas de champ d'édition de durée, pour éviter des lignes de catalogue dégénérées). Testé de bout en bout via navigateur piloté contre Neon (vente, déblocage d'onglet, édition de prix) ; 55 tests backend + build/tests frontend passent.

Phase 11 — ✅ Terminée (2026-07-28) — Planning & réservation (V1.1)

Modèle `CreneauDisponible` (récurrent ou ponctuel, heureDebut/heureFin en "HH:mm" validées par une fonction pure testée) + `Reservation` (statut confirmée/annulée/honorée), migration appliquée sur Neon. API créneaux (CRUD coach-scopé) et réservations (création avec détection de conflit d'horaire, changement de statut, vue d'ensemble coach). Page Planning (créneaux + réservations, avec Framer Motion pour les transitions de liste et de statut). Onglet Programme sportif de la fiche client : section "Séances à venir" distincte de l'historique des séances. Carte "Prochaines réservations" sur le tableau de bord.

Testé de bout en bout via navigateur piloté contre Neon : création d'un créneau récurrent, réservation d'un client dessus, affichage dans l'onglet Programme sportif et sur le tableau de bord, annulation. 60 tests backend + build/tests/lint frontend passent. Données de test nettoyées après vérification.

Phase 12 — Photos de progression (V1.1)
 T12.1 Modèle photos_progression, migration, stockage avec protection renforcée (voir cahier des charges section 8 — traitement équivalent aux données de santé)
 T12.2 API upload/liste/suppression, scoping strict par coach, jamais d'URL publique prévisible
 T12.3 Frontend : ajout de photo datée depuis l'onglet Bilan, frise chronologique de comparaison
Phase 13 — Objectifs client structurés (V1.1)
 T13.1 Modèle objectifs_client (description, valeur cible, unité, échéance, statut), migration
 T13.2 API CRUD objectifs
 T13.3 Frontend : affichage sur l'onglet Bilan avec indicateur de progression vers l'échéance
Phase 14+ — V2 (ne pas commencer avant validation complète de la V1.1)

Voir cahier des charges section 10 : paiement en ligne (Stripe), repas types réutilisables, automatisations de relance, statistiques coach enrichies, suivi d'habitudes simples, espace client complet.

Hors périmètre (voir cahier des charges section 10 pour la justification)

Application mobile native, connexion biométrique, connexion santé/balance connectée, accès salle sécurisé, mode kiosk, SEO/site vitrine/newsletter, Drive, Vidéothèque VOD, gestion multi-coach, module de comptabilité/facturation.

État global

Mettre à jour cette ligne à chaque session de travail : Phase 11 terminée et testée contre Neon (2026-07-28), committée localement sur feature/phase-11 (non poussée, pas de PR — en attente de validation humaine). Dernière phase active : Phase 12 (Photos de progression) — pas encore démarrée.