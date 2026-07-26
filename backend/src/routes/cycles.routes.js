import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { getOwnedCycle } from '../lib/ownership.js';

const router = Router();
router.use(requireAuth);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const cycle = await getOwnedCycle(req.coachId, req.params.id);
    if (!cycle) return res.status(404).json({ error: 'Cycle introuvable' });

    const { nom, ordre, dateDebut } = req.body;
    const data = {};
    if (nom !== undefined) data.nom = nom;
    if (ordre !== undefined) data.ordre = ordre;
    if (dateDebut !== undefined) data.dateDebut = dateDebut ? new Date(dateDebut) : null;

    const updated = await prisma.cycle.update({
      where: { id: cycle.id },
      data,
      include: { semaines: { orderBy: { numeroSemaine: 'asc' } } },
    });
    res.json(updated);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const cycle = await getOwnedCycle(req.coachId, req.params.id);
    if (!cycle) return res.status(404).json({ error: 'Cycle introuvable' });

    await prisma.cycle.delete({ where: { id: cycle.id } });
    res.status(204).end();
  })
);

export default router;
