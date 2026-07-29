import { Router } from 'express';
import { JourSemaine } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { validateEnum } from '../lib/validation.js';
import { estPlageValide } from '../lib/planning.js';

const router = Router();
router.use(requireAuth);

// Créneaux disponibles déclarés par le coach — récurrents ou ponctuels (T11.2).
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const creneaux = await prisma.creneauDisponible.findMany({
      where: { coachId: req.coachId },
      orderBy: [{ recurrent: 'desc' }, { jourSemaine: 'asc' }, { date: 'asc' }, { heureDebut: 'asc' }],
    });
    res.json(creneaux);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { recurrent, jourSemaine, date, heureDebut, heureFin } = req.body;

    if (!estPlageValide(heureDebut, heureFin)) {
      return res.status(400).json({ error: 'heureDebut et heureFin doivent être au format HH:mm, avec heureDebut < heureFin' });
    }

    const estRecurrent = recurrent !== false;
    if (estRecurrent) {
      validateEnum(jourSemaine, JourSemaine, 'jourSemaine');
      if (!jourSemaine) return res.status(400).json({ error: 'jourSemaine est requis pour un créneau récurrent' });
    } else if (!date) {
      return res.status(400).json({ error: 'date est requise pour un créneau ponctuel' });
    }

    const creneau = await prisma.creneauDisponible.create({
      data: {
        coachId: req.coachId,
        recurrent: estRecurrent,
        jourSemaine: estRecurrent ? jourSemaine : null,
        date: estRecurrent ? null : new Date(date),
        heureDebut,
        heureFin,
      },
    });
    res.status(201).json(creneau);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.creneauDisponible.findFirst({
      where: { id: req.params.id, coachId: req.coachId },
    });
    if (!existing) return res.status(404).json({ error: 'Créneau introuvable' });

    await prisma.creneauDisponible.delete({ where: { id: existing.id } });
    res.status(204).end();
  })
);

export default router;
