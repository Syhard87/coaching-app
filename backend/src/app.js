import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import clientsRoutes from './routes/clients.routes.js';
import programmesRoutes from './routes/programmes.routes.js';
import cyclesRoutes from './routes/cycles.routes.js';
import semainesRoutes from './routes/semaines.routes.js';
import templatesRoutes from './routes/templates.routes.js';
import journalDieteRoutes from './routes/journalDiete.routes.js';
import mesuresRoutes from './routes/mesures.routes.js';
import seancesRoutes from './routes/seances.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import exportRoutes from './routes/export.routes.js';

const app = express();

// En production, FRONTEND_URL restreint le CORS à l'origine Netlify réelle.
// En dev (variable absente), toutes les origines sont acceptées pour rester simple.
app.use(cors({ origin: process.env.FRONTEND_URL || true }));
app.use(express.json());
// Cookie signé côté serveur uniquement pour vérifier le paramètre `state` du flux Google OAuth
// (protection CSRF, voir routes/auth.routes.js) — jamais utilisé comme mécanisme de session.
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/programmes', programmesRoutes);
app.use('/api/cycles', cyclesRoutes);
app.use('/api/semaines', semainesRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/journal-diete', journalDieteRoutes);
app.use('/api/mesures', mesuresRoutes);
app.use('/api/seances', seancesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/export', exportRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Erreur serveur' });
});

export default app;
