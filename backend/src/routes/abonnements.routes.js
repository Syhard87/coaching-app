import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// Catalogue d'abonnements du coach — gestion des prix/durées depuis les paramètres (T10.8).
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const catalogue = await prisma.catalogueAbonnement.findMany({
      where: { coachId: req.coachId },
      orderBy: [{ module: 'asc' }, { dureeMois: 'asc' }],
    });
    res.json(catalogue);
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.catalogueAbonnement.findFirst({
      where: { id: req.params.id, coachId: req.coachId },
    });
    if (!existing) return res.status(404).json({ error: 'Entrée de catalogue introuvable' });

    const { dureeMois, prixTotal } = req.body;
    const data = {};
    if (dureeMois !== undefined) data.dureeMois = Number(dureeMois);
    if (prixTotal !== undefined) data.prixTotal = Number(prixTotal);

    const entree = await prisma.catalogueAbonnement.update({ where: { id: existing.id }, data });
    res.json(entree);
  })
);

export default router;
