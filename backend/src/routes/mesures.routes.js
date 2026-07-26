import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { getOwnedMesure } from '../lib/ownership.js';

const router = Router();
router.use(requireAuth);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const mesure = await getOwnedMesure(req.coachId, req.params.id);
    if (!mesure) return res.status(404).json({ error: 'Mesure introuvable' });

    const { poids, bras, taille, poitrine, cuisse, notes } = req.body;
    const data = {};
    if (poids !== undefined) data.poids = poids;
    if (bras !== undefined) data.bras = bras;
    if (taille !== undefined) data.taille = taille;
    if (poitrine !== undefined) data.poitrine = poitrine;
    if (cuisse !== undefined) data.cuisse = cuisse;
    if (notes !== undefined) data.notes = notes;

    const updated = await prisma.mesure.update({ where: { id: mesure.id }, data });
    res.json(updated);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const mesure = await getOwnedMesure(req.coachId, req.params.id);
    if (!mesure) return res.status(404).json({ error: 'Mesure introuvable' });

    await prisma.mesure.delete({ where: { id: mesure.id } });
    res.status(204).end();
  })
);

export default router;
