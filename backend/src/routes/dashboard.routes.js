import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { calculerInactivite, semaineActuelleIndex, debutSemaineCourante } from '../lib/dashboard.js';

const router = Router();
router.use(requireAuth);

const SEUIL_INACTIVITE_JOURS_DEFAUT = 30;

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { seuilJours } = req.query;
    const seuil = seuilJours ? Number(seuilJours) : SEUIL_INACTIVITE_JOURS_DEFAUT;
    const maintenant = new Date();

    const clients = await prisma.client.findMany({
      where: { coachId: req.coachId, archive: false },
      include: {
        mesures: { orderBy: { date: 'desc' }, take: 1, select: { date: true } },
        programmes: {
          select: {
            nom: true,
            cycles: {
              select: {
                nom: true,
                dateDebut: true,
                dureeSemaines: true,
                semaines: { select: { numeroSemaine: true, statut: true } },
              },
            },
          },
        },
      },
    });

    const clientsActifs = clients.length;

    const clientsARelancer = clients
      .map((c) => {
        const derniereMesureDate = c.mesures[0]?.date ?? null;
        return { id: c.id, nom: c.nom, derniereMesureDate, ...calculerInactivite(derniereMesureDate, seuil, maintenant) };
      })
      .filter((c) => c.inactif)
      .sort((a, b) => (b.joursDepuisDerniereMesure ?? Infinity) - (a.joursDepuisDerniereMesure ?? Infinity));

    const clientsDeloadTest = [];
    for (const client of clients) {
      for (const programme of client.programmes) {
        for (const cycle of programme.cycles) {
          const numero = semaineActuelleIndex(cycle.dateDebut, cycle.dureeSemaines, maintenant);
          if (numero == null) continue;
          const semaine = cycle.semaines.find((s) => s.numeroSemaine === numero);
          if (semaine && semaine.statut !== 'NORMALE') {
            clientsDeloadTest.push({
              clientId: client.id,
              clientNom: client.nom,
              programmeNom: programme.nom,
              cycleNom: cycle.nom,
              numeroSemaine: numero,
              statut: semaine.statut,
            });
          }
        }
      }
    }

    const debutSemaine = debutSemaineCourante(maintenant);
    const finSemaine = new Date(debutSemaine.getTime() + 7 * 86_400_000);

    const seancesCetteSemaine = await prisma.seance.count({
      where: {
        client: { coachId: req.coachId },
        date: { gte: debutSemaine, lt: finSemaine },
      },
    });

    res.json({ clientsActifs, seancesCetteSemaine, clientsARelancer, clientsDeloadTest });
  })
);

export default router;
