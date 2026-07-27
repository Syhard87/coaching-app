// Routes publiques, sans authentification — page de prospection accessible via le slug du coach
// (cahier des charges section 3.10). Aucune donnée client/coach sensible n'est exposée ici : seul le
// nom du coach (pour l'affichage de la page) et la création d'un Prospect en écriture seule.
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get(
  '/coach/:slug',
  asyncHandler(async (req, res) => {
    const coach = await prisma.coach.findUnique({
      where: { slug: req.params.slug },
      select: { nom: true },
    });
    if (!coach) return res.status(404).json({ error: 'Page introuvable' });
    res.json(coach);
  })
);

router.post(
  '/coach/:slug/prospects',
  asyncHandler(async (req, res) => {
    const coach = await prisma.coach.findUnique({ where: { slug: req.params.slug } });
    if (!coach) return res.status(404).json({ error: 'Page introuvable' });

    const { nom, contact, objectif, message } = req.body;
    if (!nom || !contact) {
      return res.status(400).json({ error: 'nom et contact sont requis' });
    }

    await prisma.prospect.create({
      data: { coachId: coach.id, nom, contact, objectif, message },
    });

    res.status(201).json({ ok: true });
  })
);

export default router;
