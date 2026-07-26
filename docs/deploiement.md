# Guide de déploiement — T7.3 à T7.5

Ce guide couvre le déploiement réel de l'application (backend sur Render, frontend sur Netlify,
connexion à la base Neon existante). Ces étapes nécessitent des comptes sur des services tiers et ne
peuvent pas être réalisées par l'agent Claude Code — à suivre par le coach lui-même.

La configuration (`render.yaml`, `netlify.toml`) est déjà présente à la racine du repo ; ce guide
explique comment l'utiliser.

## Prérequis

- Le repo est poussé sur GitHub (déjà le cas : `Syhard87/coaching-app`).
- Une base Neon existe déjà et est utilisée depuis la Phase 0 (`backend/.env` en local). Elle peut
  servir telle quelle de base de production — aucune nouvelle base n'est nécessaire pour un usage
  mono-coach. Si tu préfères séparer dev/prod, crée une nouvelle base (ou branche Neon) dédiée et
  utilise son `DATABASE_URL` à l'étape Render ci-dessous.

## T7.3 — Backend sur Render

1. Créer un compte sur [render.com](https://render.com) (gratuit, pas de carte bancaire requise).
2. Dashboard Render → **New** → **Blueprint**.
3. Connecter le repo GitHub `coaching-app`. Render détecte automatiquement `render.yaml` à la racine.
4. Render demande les variables marquées `sync: false` dans `render.yaml` :
   - `DATABASE_URL` : la chaîne de connexion Neon (celle de `backend/.env`, ou une nouvelle base dédiée).
   - `JWT_SECRET` : générer une valeur aléatoire dédiée à la prod (**différente** de celle utilisée en
     local) — `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
   - `FRONTEND_URL` : laisser vide pour l'instant, à renseigner après l'étape Netlify (voir plus bas).
5. Déployer. Le `buildCommand` du blueprint exécute automatiquement
   `npx prisma migrate deploy` à chaque déploiement — les migrations sont donc appliquées sans étape
   manuelle. Vérifier dans les logs Render que la migration s'est bien appliquée.
6. Une fois déployé, noter l'URL du service (`https://coaching-app-backend.onrender.com` ou
   similaire) et vérifier `GET /health` répond `{"status":"ok"}`.

**Limite du palier gratuit** : le service se met en veille après 15 minutes d'inactivité ; le premier
chargement de la journée peut prendre 30-60s (voir cahier des charges section 5).

## T7.4 — Frontend sur Netlify

1. Créer un compte sur [netlify.com](https://netlify.com) (gratuit).
2. Dashboard Netlify → **Add new site** → **Import an existing project** → connecter le repo GitHub.
3. Netlify détecte `netlify.toml` à la racine (`base = "frontend"`, build `npm run build`, publish
   `dist`) — les champs de configuration du site se pré-remplissent automatiquement.
4. Avant de déployer, ajouter la variable d'environnement du site :
   - `VITE_API_URL` = `https://<url-du-backend-render>/api` (l'URL notée à l'étape précédente, avec
     `/api` à la fin).
5. Déployer. Netlify fournit une URL du type `https://<nom-aleatoire>.netlify.app` (personnalisable
   dans les paramètres du site).

## T7.5 — Boucler la connexion

1. Retourner sur Render → variables d'environnement du service backend → renseigner `FRONTEND_URL`
   avec l'URL Netlify obtenue à l'étape précédente (ex. `https://mon-app.netlify.app`, sans slash
   final). Cela restreint le CORS du backend à cette origine en production.
2. Redéployer le backend (Render redéploie automatiquement à la sauvegarde des variables d'env, ou
   déclencher un déploiement manuel).
3. Ouvrir l'URL Netlify, créer un compte coach (`/register`), vérifier que la connexion à l'API
   fonctionne (liste des clients vide, création d'un client de test).
4. Vérifier le manifest PWA : sur mobile (Chrome/Safari), l'option "Ajouter à l'écran d'accueil"
   doit proposer l'icône et le nom de l'application (voir T7.1).

## Sauvegardes (contrainte non-fonctionnelle, section 6 du cahier des charges)

Neon effectue des sauvegardes automatiques sur les paliers payants uniquement ; le palier gratuit
n'a pas de rétention longue durée. Pour un usage réel au-delà de la phase de test, prévoir un export
régulier via `/export` (T7.2 — JSON complet) comme sauvegarde de secours, ou passer à un palier Neon
payant si l'app devient un outil quotidien critique (voir section 5 du cahier des charges).
