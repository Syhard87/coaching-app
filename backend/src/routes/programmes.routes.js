import { Router } from 'express';
import { TypeSplit } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { validateEnum } from '../lib/validation.js';
import { getOwnedProgramme } from '../lib/ownership.js';
import { PROGRAMME_INCLUDE, validateJours, replaceProgrammeJours } from '../lib/programmes.js';

const router = Router();
router.use(requireAuth);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const programme = await getOwnedProgramme(req.coachId, req.params.id);
    if (!programme) return res.status(404).json({ error: 'Programme introuvable' });

    const full = await prisma.programme.findUnique({ where: { id: programme.id }, include: PROGRAMME_INCLUDE });
    res.json(full);
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const programme = await getOwnedProgramme(req.coachId, req.params.id);
    if (!programme) return res.status(404).json({ error: 'Programme introuvable' });

    const { nom, typeSplit, frequence, jours } = req.body;
    validateEnum(typeSplit, TypeSplit, 'typeSplit');
    validateJours(jours);

    const data = {};
    if (nom !== undefined) data.nom = nom;
    if (typeSplit !== undefined) data.typeSplit = typeSplit;
    if (frequence !== undefined) data.frequence = frequence;

    if (Object.keys(data).length > 0) {
      await prisma.programme.update({ where: { id: programme.id }, data });
    }

    const updated = jours !== undefined
      ? await replaceProgrammeJours(prisma, programme.id, jours)
      : await prisma.programme.findUnique({ where: { id: programme.id }, include: PROGRAMME_INCLUDE });

    res.json(updated);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const programme = await getOwnedProgramme(req.coachId, req.params.id);
    if (!programme) return res.status(404).json({ error: 'Programme introuvable' });

    await prisma.programme.delete({ where: { id: programme.id } });
    res.status(204).end();
  })
);

router.post(
  '/:id/duplicate',
  asyncHandler(async (req, res) => {
    const source = await getOwnedProgramme(req.coachId, req.params.id);
    if (!source) return res.status(404).json({ error: 'Programme source introuvable' });

    const { targetClientId } = req.body;
    if (!targetClientId) return res.status(400).json({ error: 'targetClientId est requis' });

    const target = await prisma.client.findFirst({ where: { id: targetClientId, coachId: req.coachId } });
    if (!target) return res.status(404).json({ error: 'Client cible introuvable' });

    const full = await prisma.programme.findUnique({ where: { id: source.id }, include: PROGRAMME_INCLUDE });
    const jours = full.jours.map((j) => ({
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
    }));

    const programme = await prisma.programme.create({
      data: {
        nom: full.nom,
        typeSplit: full.typeSplit,
        frequence: full.frequence,
        clientId: target.id,
        jours: {
          create: jours.map((j) => ({
            nom: j.nom,
            ordre: j.ordre,
            exercices: { create: j.exercices },
          })),
        },
      },
      include: PROGRAMME_INCLUDE,
    });

    res.status(201).json(programme);
  })
);

router.post(
  '/:id/cycles',
  asyncHandler(async (req, res) => {
    const programme = await getOwnedProgramme(req.coachId, req.params.id);
    if (!programme) return res.status(404).json({ error: 'Programme introuvable' });

    const { nom, ordre, dureeSemaines } = req.body;
    if (!nom || !dureeSemaines || dureeSemaines < 1) {
      return res.status(400).json({ error: 'nom et dureeSemaines (>= 1) sont requis' });
    }

    const cyclesExistants = await prisma.cycle.count({ where: { programmeId: programme.id } });

    const cycle = await prisma.cycle.create({
      data: {
        programmeId: programme.id,
        nom,
        ordre: ordre ?? cyclesExistants,
        dureeSemaines,
        semaines: {
          create: Array.from({ length: dureeSemaines }, (_, i) => ({ numeroSemaine: i + 1 })),
        },
      },
      include: { semaines: { orderBy: { numeroSemaine: 'asc' } } },
    });

    res.status(201).json(cycle);
  })
);

export default router;
