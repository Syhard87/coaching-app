import { Router } from 'express';
import { StatutSemaine } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { validateEnum } from '../lib/validation.js';
import { getOwnedSemaine } from '../lib/ownership.js';

const router = Router();
router.use(requireAuth);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const semaine = await getOwnedSemaine(req.coachId, req.params.id);
    if (!semaine) return res.status(404).json({ error: 'Semaine introuvable' });

    const { statut, notes } = req.body;
    validateEnum(statut, StatutSemaine, 'statut');

    const data = {};
    if (statut !== undefined) data.statut = statut;
    if (notes !== undefined) data.notes = notes;

    const updated = await prisma.semainePlanifiee.update({ where: { id: semaine.id }, data });
    res.json(updated);
  })
);

export default router;
