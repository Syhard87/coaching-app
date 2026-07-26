import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { getOwnedSeance } from '../lib/ownership.js';

const router = Router();
router.use(requireAuth);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const seance = await getOwnedSeance(req.coachId, req.params.id);
    if (!seance) return res.status(404).json({ error: 'Séance introuvable' });

    const full = await prisma.seance.findUnique({
      where: { id: seance.id },
      include: { jour: { include: { programme: { select: { nom: true } } } }, exercicesRealises: true },
    });
    res.json(full);
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const seance = await getOwnedSeance(req.coachId, req.params.id);
    if (!seance) return res.status(404).json({ error: 'Séance introuvable' });

    const { date, ressenti, notes, exercicesRealises } = req.body;
    const data = {};
    if (date !== undefined) data.date = new Date(date);
    if (ressenti !== undefined) data.ressenti = ressenti;
    if (notes !== undefined) data.notes = notes;

    const updated = await prisma.$transaction(async (tx) => {
      if (Object.keys(data).length > 0) {
        await tx.seance.update({ where: { id: seance.id }, data });
      }
      if (exercicesRealises !== undefined) {
        await tx.exerciceRealise.deleteMany({ where: { seanceId: seance.id } });
        await tx.seance.update({
          where: { id: seance.id },
          data: {
            exercicesRealises: {
              create: exercicesRealises.map((e) => ({
                nom: e.nom,
                chargeRealisee: e.chargeRealisee,
                repsRealisees: e.repsRealisees,
                notes: e.notes,
              })),
            },
          },
        });
      }
      return tx.seance.findUnique({
        where: { id: seance.id },
        include: { jour: { include: { programme: { select: { nom: true } } } }, exercicesRealises: true },
      });
    });

    res.json(updated);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const seance = await getOwnedSeance(req.coachId, req.params.id);
    if (!seance) return res.status(404).json({ error: 'Séance introuvable' });

    await prisma.seance.delete({ where: { id: seance.id } });
    res.status(204).end();
  })
);

export default router;
