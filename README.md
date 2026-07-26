# Application de suivi coaching sportif

Application de gestion de clients pour coach sportif indépendant : profils, création de programmes
personnalisés (splits, périodisation), calcul nutritionnel automatique (BMR/TDEE, déficit/surplus),
suivi des séances réelles et des mesures corporelles.

## Documentation

- **Cahier des charges complet** : [`docs/cahier-des-charges.md`](./docs/cahier-des-charges.md)
  (contexte, fonctionnalités, modèle de données, architecture, user stories)
- **Suivi des tâches** : [`TASKS.md`](./TASKS.md) — à consulter et mettre à jour à chaque session de
  développement (agents Claude Code : commencez toujours par lire ce fichier pour savoir où reprendre).

## Stack technique

- Frontend : React + Tailwind, hébergé sur Netlify
- Backend : Node.js / Express, hébergé sur Render
- Base de données : PostgreSQL (Neon), via Prisma
- Distribution : PWA (pas de store)

## Structure du repo

```
.
├── docs/
│   └── cahier-des-charges.md
├── frontend/        Vite + React + Tailwind
├── backend/         Node.js/Express + Prisma
├── TASKS.md
└── README.md
```

## Démarrage local

```bash
# Backend (http://localhost:3001)
cd backend
cp .env.example .env   # renseigner DATABASE_URL (Neon)
npm install
npx prisma migrate deploy
npm run dev

# Frontend (http://localhost:5173)
cd frontend
npm install
npm run dev
```

## Pour reprendre le développement (agents Claude Code)

1. Lire `TASKS.md` pour identifier la dernière phase active et les tâches non cochées.
2. Se référer à `docs/cahier-des-charges.md` pour le détail fonctionnel de chaque tâche.
3. Ne pas modifier les décisions d'architecture (section 5 du cahier des charges) sans mettre à jour le
   document en conséquence.
4. Cocher les tâches terminées dans `TASKS.md` au fur et à mesure, et mettre à jour la ligne "Dernière
   phase active" en bas du fichier avant de terminer la session.
