import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { versCSV } from '../lib/csv.js';

const router = Router();
router.use(requireAuth);

function horodatage() {
  return new Date().toISOString().slice(0, 10);
}

router.get(
  '/json',
  asyncHandler(async (req, res) => {
    const coach = await prisma.coach.findUnique({
      where: { id: req.coachId },
      select: { id: true, nom: true, email: true, createdAt: true },
    });

    const clients = await prisma.client.findMany({
      where: { coachId: req.coachId },
      include: {
        disponibilites: true,
        programmes: {
          include: {
            jours: { include: { exercices: true } },
            cycles: { include: { semaines: true } },
          },
        },
        seances: { include: { exercicesRealises: true } },
        objectifDiete: true,
        journalDiete: true,
        mesures: true,
      },
    });

    const templatesProgramme = await prisma.templateProgramme.findMany({ where: { coachId: req.coachId } });

    res.setHeader('Content-Disposition', `attachment; filename="export-${horodatage()}.json"`);
    res.json({ exporteLe: new Date().toISOString(), coach, clients, templatesProgramme });
  })
);

const ENTITES_CSV = {
  clients: {
    colonnes: [
      'nom', 'age', 'sexe', 'tailleCm', 'poidsInitial', 'objectif', 'dateDebut',
      'niveauActivite', 'profession', 'horaireTravail', 'experienceSportive', 'archive',
    ],
    charger: (coachId) => prisma.client.findMany({ where: { coachId }, orderBy: { nom: 'asc' } }),
  },
  mesures: {
    colonnes: ['clientNom', 'date', 'poids', 'bras', 'taille', 'poitrine', 'cuisse', 'notes'],
    charger: async (coachId) => {
      const mesures = await prisma.mesure.findMany({
        where: { client: { coachId } },
        include: { client: { select: { nom: true } } },
        orderBy: { date: 'desc' },
      });
      return mesures.map((m) => ({ ...m, clientNom: m.client.nom }));
    },
  },
  'journal-diete': {
    colonnes: ['clientNom', 'date', 'calories', 'proteines', 'glucides', 'lipides', 'eau', 'repas', 'notes'],
    charger: async (coachId) => {
      const entries = await prisma.journalDiete.findMany({
        where: { client: { coachId } },
        include: { client: { select: { nom: true } } },
        orderBy: { date: 'desc' },
      });
      return entries.map((e) => ({ ...e, clientNom: e.client.nom }));
    },
  },
  seances: {
    colonnes: ['clientNom', 'date', 'jourNom', 'ressenti', 'notes'],
    charger: async (coachId) => {
      const seances = await prisma.seance.findMany({
        where: { client: { coachId } },
        include: { client: { select: { nom: true } }, jour: { select: { nom: true } } },
        orderBy: { date: 'desc' },
      });
      return seances.map((s) => ({ ...s, clientNom: s.client.nom, jourNom: s.jour?.nom || 'Séance libre' }));
    },
  },
};

router.get(
  '/csv/:entite',
  asyncHandler(async (req, res) => {
    const config = ENTITES_CSV[req.params.entite];
    if (!config) {
      return res.status(404).json({ error: `Entité inconnue. Valeurs possibles : ${Object.keys(ENTITES_CSV).join(', ')}` });
    }

    const lignes = await config.charger(req.coachId);
    const csv = versCSV(lignes, config.colonnes);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${req.params.entite}-${horodatage()}.csv"`);
    res.send(csv);
  })
);

export default router;
