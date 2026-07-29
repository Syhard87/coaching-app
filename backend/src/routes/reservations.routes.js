import { Router } from 'express';
import { StatutReservation } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { validateEnum } from '../lib/validation.js';

const router = Router();
router.use(requireAuth);

// Vue d'ensemble des réservations du coach (tous clients confondus) — page Planning (T11.4)
// et carte "Prochaines réservations" du tableau de bord (T11.6).
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { upcoming, limit } = req.query;

    const reservations = await prisma.reservation.findMany({
      where: {
        client: { coachId: req.coachId },
        ...(upcoming === 'true' ? { dateHeure: { gte: new Date() }, statut: 'CONFIRMEE' } : {}),
      },
      include: { client: { select: { id: true, nom: true } } },
      orderBy: { dateHeure: 'asc' },
      ...(limit ? { take: Number(limit) } : {}),
    });
    res.json(reservations);
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.reservation.findFirst({
      where: { id: req.params.id, client: { coachId: req.coachId } },
    });
    if (!existing) return res.status(404).json({ error: 'Réservation introuvable' });

    const { statut } = req.body;
    validateEnum(statut, StatutReservation, 'statut');
    if (!statut) return res.status(400).json({ error: 'statut est requis' });

    const reservation = await prisma.reservation.update({ where: { id: existing.id }, data: { statut } });
    res.json(reservation);
  })
);

export default router;
