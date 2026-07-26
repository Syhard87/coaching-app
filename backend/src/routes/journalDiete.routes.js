import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { getOwnedJournalEntry } from '../lib/ownership.js';

const router = Router();
router.use(requireAuth);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const entry = await getOwnedJournalEntry(req.coachId, req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entrée introuvable' });

    const { calories, proteines, glucides, lipides, eau, repas, notes } = req.body;
    const data = {};
    if (calories !== undefined) data.calories = calories;
    if (proteines !== undefined) data.proteines = proteines;
    if (glucides !== undefined) data.glucides = glucides;
    if (lipides !== undefined) data.lipides = lipides;
    if (eau !== undefined) data.eau = eau;
    if (repas !== undefined) data.repas = repas;
    if (notes !== undefined) data.notes = notes;

    const updated = await prisma.journalDiete.update({ where: { id: entry.id }, data });
    res.json(updated);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const entry = await getOwnedJournalEntry(req.coachId, req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entrée introuvable' });

    await prisma.journalDiete.delete({ where: { id: entry.id } });
    res.status(204).end();
  })
);

export default router;
