# Dossier de conception — Application de suivi coaching sportif
Version définitive — architecture, périmètre et roadmap

## 1. Contexte et objectifs

Un coach sportif indépendant, en visio, démarre son activité. Il vend deux modules distincts (Sport,
Diète), chacun en abonnement, plus un pack combiné. L'application doit "penser comme un coach" : capturer
un bilan une fois, puis en déduire automatiquement les bases du programme et de la nutrition — exactement
le déroulé logique d'un vrai accompagnement.

**Ce document est benchmarké** contre une plateforme de coaching mature existante (fonctionnalités type
gestion clients/prospects, programmes, nutrition, suivi, planning, paiements, acquisition), avec un tri
explicite : adopter ce qui a de la valeur pour un coach solo débutant en 100% visio, différer ce qui est
utile mais non prioritaire, écarter ce qui est pensé pour un tout autre profil (studio physique, équipe,
gros volume). Ce tri est documenté en section 11 pour ne plus avoir à être rediscuté.

## 2. Utilisateurs
- **Coach** (principal) : crée les clients, remplit le bilan, construit/valide programmes et plans, gère
  planning et abonnements.
- **Client** (accès progressif, voir phasage) : consulte son programme, réserve ses séances, suit sa
  progression.

## 3. Parcours — la fiche client à 3 onglets

Chaque client a exactement 3 onglets : **Bilan** (toujours accessible, rempli une fois, nourrit les deux
autres), **Programme sportif** et **Nutritionnel** (visibles si l'abonnement correspondant est actif,
sinon état "non souscrit" avec invitation à vendre — jamais masqué ni vide sans explication).

## 4. Détail des 3 onglets

### 4.1 Onglet Bilan
- Identité : nom, âge, sexe, taille (cm), poids actuel (kg)
- Objectif principal + **objectifs structurés** (nouveau) : description, valeur cible, échéance, statut —
  ex. "atteindre 65kg" échéance "3 mois", suivi visuellement sur la fiche
- Niveau d'activité générale, profession/horaires, disponibilités hebdomadaires, expérience sportive
- Notes santé + case "suivi médical en cours" (déclenche le rappel non bloquant, voir 8)
- **Photos de progression** (nouveau) : ajout périodique, associées à une date, consultables en frise
  chronologique à côté des mesures

### 4.2 Onglet Programme sportif
- Suggestion automatique de split (full body / half body / PPL / bro split) selon disponibilités et
  horaires du Bilan, modifiable
- Construction du programme (jours, exercices, séries/reps/charge/repos), cycles/semaines
  (normale/deload/test), bibliothèque de modèles réutilisables
- Démonstration par exercice : lien vidéo du coach, sinon GIF/photo automatique via base gratuite
  (`free-exercise-db`, déjà intégré) — jamais d'illustration générée par IA
- Suivi des séances réelles (pré-remplies depuis le programme), graphique de progression par exercice
- **Planning & réservation** (nouveau, voir 5) : les séances à venir apparaissent ici, pas seulement
  l'historique des séances passées

### 4.3 Onglet Nutritionnel
Calcul automatique à partir du Bilan — bases scientifiques établies :
- BMR (Mifflin-St Jeor) → TDEE selon niveau d'activité
- Choix du coach : déficit léger (−250 kcal/j) ou modéré (−500 kcal/j), surplus léger (+250) ou modéré
  (+500), ou maintien
- Macros calculés : protéines 1,6-2,2 g/kg, lipides 0,8-1 g/kg, glucides le reste
- Plan hebdomadaire = cibles chiffrées jour par jour (V1 : pas de génération de menus concrets)
- Journal alimentaire (entrées quotidiennes, moyennes glissantes 7/30j, graphique combiné poids/calories)
- **Repas types réutilisables** (V2, voir 11) : le coach enregistre des repas personnalisés que le client
  peut réutiliser rapidement dans son journal, sans aller jusqu'à un générateur de menus complet

Toutes les valeurs calculées restent des propositions modifiables, jamais figées automatiquement.

## 5. Socle commun

**Prospection** : slug public, page de capture, pipeline (nouveau/contacté/converti/perdu), conversion en
un clic.

**Planning & réservation** (nouveau) : le coach définit ses créneaux disponibles (récurrents ou ponctuels),
le client réserve un créneau depuis son accès (ou le coach réserve pour lui en attendant l'espace client) ;
les séances à venir s'affichent dans l'onglet Programme sportif, distinctes des séances déjà réalisées.

**Abonnements** : catalogue éditable (module, durée 1/3/6 mois, prix), vente à un client, expiration
suivie. Grille par défaut :

| Formule | 1 mois | 3 mois | 6 mois |
|---|---|---|---|
| Bilan découverte | Gratuit (30 min) | — | — |
| Module Sport | 50€ | 40€/mois (120€) | 30€/mois (180€) |
| Module Diète | 50€ | 40€/mois (120€) | 30€/mois (180€) |
| Pack Complet | 85€ | ~67€/mois (200€) | 50€/mois (300€) |

**Mesures corporelles** *(transversal)* : poids, tours, graphiques, alerte d'absence de mesure récente.

**Tableau de bord** : clients actifs, séances de la semaine, relances, deload/test en cours, abonnements à
expiration, réservations à venir, message pré-rempli WhatsApp/SMS.

## 6. Modèle de données

- `coaches` (id, nom, email, mot_de_passe_hash, slug)
- `clients` (id, coach_id, nom, âge, sexe, taille_cm, poids_initial, objectif, date_début, notes_santé,
  suivi_médical, niveau_activité, profession, expérience_sportive)
- `objectifs_client` (id, client_id, description, valeur_cible, unite, echeance, statut)
- `photos_progression` (id, client_id, date, reference_fichier, notes)
- `disponibilites` (id, client_id, jour_semaine, créneau, disponible)
- `prospects` (id, coach_id, nom, contact, objectif, message, statut, client_id nullable)
- `catalogue_abonnements` (id, coach_id, module, duree_mois, prix_total, label)
- `client_abonnements` (id, client_id, catalogue_abonnement_id, date_debut, date_fin, statut)
- `creneaux_disponibles` (id, coach_id, jour_semaine ou date, heure_debut, heure_fin, recurrent)
- `reservations` (id, client_id, creneau_id, date_heure, statut [confirmee/annulee/honoree])
- `programmes`, `cycles`, `semaines_planifiees`, `jours_entrainement`, `exercices_programme` (+ lien_video)
- `seances`, `exercices_realises`
- `objectifs_diete`, `journal_diete`, `repas_types` (nouveau, V2)
- `mesures`, `templates_programme`

## 7. Architecture technique

React + Tailwind (Netlify) · Node.js/Express (Render) · PostgreSQL/Prisma (Neon) · PWA — inchangé, déjà en
production.

**Authentification : migration vers Google OAuth2** (remplace email/mot de passe + JWT). Le coach ouvre un
projet Google Cloud (gratuit), génère un Client ID/Secret OAuth, et se connecte en un clic — Google porte
la sécurité des identifiants, plus de hash de mot de passe à gérer côté application. Le compte coach
existant doit pouvoir se relier à son compte Google sans perte de données (voir Phase 9.5).

**Paiement en ligne (V2)** : Stripe Checkout recommandé — aucune donnée de carte ne transite par votre
serveur (conformité PCI déléguée à Stripe), frais à la transaction plutôt qu'un abonnement fixe, cohérent
avec le budget accessible visé.

## 7.1 Identité visuelle & interactions

Direction retenue : prolonger l'identité déjà conçue pour l'outil de suivi personnel du coach, plutôt
qu'un style Tailwind par défaut sans personnalité. Esprit "carnet d'entraînement" — structuré, discipliné,
mais chaleureux côté client.

- **Palette** : graphite/chalk (fond et texte neutres) + orange-fer comme accent principal, bleu-acier et
  vert-mousse en accents secondaires (objectifs atteints, états positifs) — définie en tokens Tailwind
  (`tailwind.config`), jamais en couleurs codées en dur dans les composants.
- **Typographie** : Oswald (titres, condensé, esprit signalétique de salle) + Inter (texte courant) + IBM
  Plex Mono (valeurs chiffrées — charges, calories, dates) pour distinguer visuellement la donnée du texte.
- **Interactions** : transitions et micro-retours visuels via Framer Motion (librairie gratuite) —
  barres de progression animées (objectifs, abonnements), confirmation visuelle sur une action validée,
  entrée animée des graphiques Recharts, états de survol clairs sur les éléments cliquables.
- **Cohérence** : cette identité s'applique à l'ensemble de l'app (coach et, plus tard, espace client) —
  pas un traitement différent par écran.

## 8. Contraintes non-fonctionnelles

- Données de santé chiffrées au repos, accès restreint par authentification.
- **Photos de progression : niveau de protection renforcé.** Une photo du corps d'un client est une donnée
  au moins aussi sensible qu'une note de santé — accès strictement limité au coach concerné, jamais
  exposée par une URL publique ou prévisible, suppression possible par le client si un espace lui est
  ouvert.
- Algorithmes assistifs, jamais prescriptifs — toute valeur calculée reste modifiable.
- Rappel de sécurité médicale non bloquant si "suivi médical en cours" est coché.
- Aucune illustration d'exercice générée par IA.
- Sauvegardes régulières, RGPD si espace client ouvert.

## 9. User stories (nouvelles, en plus de l'existant déjà livré)

- US-10.1 — En tant que coach, je veux définir mes créneaux disponibles, afin que la prise de rendez-vous
  ne se fasse plus par message.
- US-10.2 — En tant que client (ou coach en son nom), je veux réserver un créneau visible, afin de savoir
  précisément quand a lieu la prochaine séance.
- US-10.3 — En tant que coach, je veux ajouter des photos de progression datées à la fiche client, afin de
  visualiser l'évolution physique dans le temps, en complément des mesures chiffrées.
- US-10.4 — En tant que coach, je veux fixer un objectif chiffré avec échéance pour un client, afin de
  suivre concrètement l'atteinte de son objectif plutôt qu'une intention vague.
- US-11.1 *(V2)* — En tant que coach, je veux encaisser un abonnement en ligne, afin de ne plus gérer les
  paiements manuellement.
- US-11.2 *(V2)* — En tant que coach, je veux enregistrer des repas types réutilisables, afin que le
  client remplisse son journal alimentaire plus rapidement.

## 10. Roadmap — priorisation explicite pour ne plus revenir dessus

**V1 (déjà en grande partie livré + révision 3 onglets)**
Bilan/Programme sportif/Nutritionnel, calcul nutritionnel automatique, suggestion de split, GIF
d'exercices, suivi des séances et mesures, prospection, abonnements par module, tableau de bord.

**V1.1 (prochaine itération, socle métier complet)**
Planning & réservation (créneaux, séances à venir), photos de progression, objectifs client structurés.

**V2 (une fois plusieurs clients payants stabilisés)**
Paiement en ligne (Stripe), repas types réutilisables, automatisations de relance, statistiques coach
enrichies, espace client complet (connexion, réservation autonome, saisie autonome).

**Hors périmètre de cette application** *(pas un refus définitif — juste pas ce projet-ci)*
Application mobile native, connexion biométrique, connexion santé/balance connectée, accès salle
sécurisé, mode kiosk, SEO/pages locales/site vitrine, newsletter — fonctionnalités pensées pour un profil
de coach différent (studio physique, équipe, gros volume) ou relevant d'un projet marketing séparé, pas de
l'application de suivi elle-même.

## 11. Décisions prises
- Fiche client à 3 onglets, accès conditionné par abonnement.
- Benchmark concurrentiel effectué et tri assumé (section 10) — les fonctionnalités écartées le sont pour
  des raisons de pertinence, pas d'oubli.
- Nutrition V1 = cibles chiffrées ; repas types en V2 ; pas de générateur de menus complet prévu.
- Photos de progression traitées avec un niveau de confidentialité renforcé, équivalent aux données de
  santé.
- Paiement en ligne différé en V2, via Stripe Checkout.
- Ce document est la référence unique du projet (`docs/cahier-des-charges.md`), remplaçant les versions
  précédentes.
