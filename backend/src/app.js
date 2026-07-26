import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import clientsRoutes from './routes/clients.routes.js';
import programmesRoutes from './routes/programmes.routes.js';
import cyclesRoutes from './routes/cycles.routes.js';
import semainesRoutes from './routes/semaines.routes.js';
import templatesRoutes from './routes/templates.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/programmes', programmesRoutes);
app.use('/api/cycles', cyclesRoutes);
app.use('/api/semaines', semainesRoutes);
app.use('/api/templates', templatesRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Erreur serveur' });
});

export default app;
