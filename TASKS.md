Suivi des tâches — Application de coaching sportif
Instructions pour les agents Claude Code
Se référer à docs/cahier-des-charges.md (version définitive) pour le détail fonctionnel de chaque tâche — c'est la référence unique du projet, elle intègre le tri explicite des fonctionnalités (section 10, Roadmap) pour éviter toute discussion répétée sur le périmètre.
Cocher [x] une tâche seulement une fois codée et testée contre la vraie base Neon.
Respecter l'ordre des phases.
Committer, pousser et ouvrir une PR à la fin de chaque phase — ne pas enchaîner directement sur la phase suivante sans validation humaine.
Mettre à jour la ligne "État global" en bas de ce fichier à chaque session.
Phases 0 à 9 — ✅ Terminées, déployées en production

Authentification, gestion clients, création de programme (splits, cycles, GIF de démonstration via free-exercise-db), suivi des séances et progression, nutrition (calcul automatique Mifflin-St Jeor), mesures corporelles, tableau de bord, PWA + export de données, prospection (page publique + pipeline). Détail complet de l'implémentation : historique Git (PRs #1 à #9) et notes de chaque phase conservées dans les commits — non reproduites ici pour ne pas alourdir ce fichier.

Déployé sur : Netlify (frontend), Render (backend), Neon (base de données).

Phase 9.5 — Authentification Google OAuth (avant la Phase 10)

Remplace l'authentification email/mot de passe + JWT. Voir cahier des charges section 7.

 T9.5.1 (manuel, coach) Créer un projet Google Cloud, configurer l'écran de consentement OAuth, générer Client ID + Client Secret
 T9.5.2 Backend : intégration OAuth2 Google (ex. passport-google-oauth20 ou équivalent), migration du modèle Coach (retirer l'obligation de mot_de_passe_hash, ajouter googleId, avatarUrl)
 T9.5.3 Frontend : bouton "Se connecter avec Google", suppression du formulaire email/mot de passe
 T9.5.4 Migration du compte coach existant : le relier à son compte Google sans perte de données (clients, programmes, historique conservés)
 T9.5.5 Testé de bout en bout (connexion réelle, déconnexion, reconnexion) contre la vraie base Neon
⚠️ Nettoyage préalable à la Phase 10

Un premier travail sur un modèle de "formules à l'heure" avait été commencé puis abandonné (changement de modèle économique vers des abonnements mensuels par module). Avant de démarrer la Phase 10 :

 T10.0a Vérifier qu'aucun commit lié aux "formules à l'heure" n'est mergé sur main
 T10.0b Supprimer toute branche feature/phase-10 résiduelle, repartir de main à jour
Phase 10 — Design system + Réorganisation à 3 onglets + Abonnements par module

Remplace définitivement l'ancien modèle et l'ancien style visuel en une seule fois — pas de refonte graphique séparée après coup. Voir cahier des charges sections 3, 4, 5, 6, 7.1.

 T10.0c Mettre en place les tokens Tailwind (couleurs, polices Oswald/Inter/IBM Plex Mono) et installer Framer Motion — base appliquée à tous les écrans reconstruits dans cette phase
 T10.1 Modèle catalogue_abonnements + client_abonnements, migration, catalogue par défaut à la création d'un compte coach (grille : Sport/Diète 50€ 1 mois, 120€ 3 mois, 180€ 6 mois ; Pack Complet 85€/200€/300€)
 T10.2 API : vendre un abonnement à un client, consulter l'état des modules actifs, calcul automatique de la date de fin
 T10.3 Logique d'accès aux modules (fonction pure, testée) : Sport actif / Diète actif / aucun, d'après les abonnements en cours du client
 T10.4 Frontend : réorganiser la fiche client en exactement 3 onglets, avec le nouveau design system — Bilan (fusionne Profil + Mesures existants), Programme sportif (fusionne Programmes + Séances existants), Nutritionnel (reprend l'onglet Diète existant)
 T10.5 Frontend : état "non souscrit" avec invitation à vendre sur Programme sportif / Nutritionnel quand l'abonnement correspondant n'est pas actif (jamais masqué ni vide sans explication)
 T10.6 Bandeau de rappel sécurité médicale (non bloquant) sur l'onglet Bilan si suivi_medical_en_cours est coché, avant validation d'un objectif calorique ou d'un programme intensif
 T10.7 Carte "Abonnements à renouveler bientôt" sur le tableau de bord, barre de progression animée
 T10.8 Frontend : gestion du catalogue d'abonnements dans les paramètres coach (édition prix/durées)
Phase 11 — Planning & réservation (V1.1)
 T11.1 Modèle creneaux_disponibles + reservations, migration
 T11.2 API : définir des créneaux disponibles (récurrents ou ponctuels)
 T11.3 API : réserver un créneau pour un client (le coach réserve en son nom en attendant un espace client), changement de statut (confirmée/annulée/honorée)
 T11.4 Frontend : page "Planning" coach (définir ses créneaux, vue des réservations)
 T11.5 Frontend : séances à venir affichées dans l'onglet Programme sportif, distinctes de l'historique
 T11.6 Carte "Prochaines réservations" sur le tableau de bord
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

Mettre à jour cette ligne à chaque session de travail : Dernière phase active : Phase 9.5 — pas encore démarrée. Commencer par T9.5.1 (création du projet Google Cloud, action manuelle du coach) avant de lancer Claude Code sur le reste. Phase 10 (nettoyage + design system + réorganisation) suit ensuite.