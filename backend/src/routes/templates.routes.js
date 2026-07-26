import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { getOwnedProgramme } from '../lib/ownership.js';
import { SPLIT_ARCHETYPES } from '../lib/splitTemplates.js';

const router = Router();
router.use(requireAuth);

// Bibliothèque de modèles de split intégrés (full body / half body / PPL / bro split).
router.get('/archetypes', (req, res) => {
  res.json(SPLIT_ARCHETYPES);
});

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const templates = await prisma.templateProgramme.findMany({
      where: { coachId: req.coachId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(templates);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const template = await prisma.templateProgramme.findFirst({
      where: { id: req.params.id, coachId: req.coachId },
    });
    if (!template) return res.status(404).json({ error: 'Modèle introuvable' });
    res.json(template);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { nom, programmeId } = req.body;
    if (!nom || !programmeId) {
      return res.status(400).json({ error: 'nom et programmeId sont requis' });
    }

    const programme = await getOwnedProgramme(req.coachId, programmeId);
    if (!programme) return res.status(404).json({ error: 'Programme introuvable' });

    const full = await prisma.programme.findUnique({
      where: { id: programme.id },
      include: { jours: { orderBy: { ordre: 'asc' }, include: { exercices: true } } },
    });

    const contenuJson = {
      jours: full.jours.map((j) => ({
        nom: j.nom,
        ordre: j.ordre,
        exercices: j.exercices.map((e) => ({
          nom: e.nom,
          series: e.series,
          reps: e.reps,
          chargeCible: e.chargeCible,
          tempsRepos: e.tempsRepos,
          notes: e.notes,
          lienVideo: e.lienVideo,
        })),
      })),
    };

    const template = await prisma.templateProgramme.create({
      data: { coachId: req.coachId, nom, typeSplit: full.typeSplit, contenuJson },
    });
    res.status(201).json(template);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const template = await prisma.templateProgramme.findFirst({
      where: { id: req.params.id, coachId: req.coachId },
    });
    if (!template) return res.status(404).json({ error: 'Modèle introuvable' });

    await prisma.templateProgramme.delete({ where: { id: template.id } });
    res.status(204).end();
  })
);

export default router;
