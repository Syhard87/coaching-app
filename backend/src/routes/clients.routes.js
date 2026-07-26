import { Router } from 'express';
import {
  ObjectifClient,
  Sexe,
  NiveauActivite,
  HoraireTravail,
  ExperienceSportive,
  JourSemaine,
  Creneau,
  TypeSplit,
  MethodeCalcul,
  TypeObjectifCalorique,
} from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { validateEnum } from '../lib/validation.js';
import { suggererSplit, compterJoursDisponibles } from '../lib/splitSuggestion.js';
import { createProgrammeForClient, validateJours } from '../lib/programmes.js';
import { calculerObjectifsAuto } from '../lib/nutrition.js';

const router = Router();
router.use(requireAuth);

const SEUIL_INACTIVITE_JOURS_DEFAUT = 30;

const PROFIL_FIELDS = [
  'nom',
  'age',
  'sexe',
  'tailleCm',
  'poidsInitial',
  'objectif',
  'notesSante',
  'suiviMedical',
  'niveauActivite',
  'profession',
  'horaireTravail',
  'experienceSportive',
];

// Champs copiés lors d'une duplication de profil (identité exclue : nom, mesures).
const PROFIL_FIELDS_DUPLIQUABLES = PROFIL_FIELDS.filter(
  (f) => !['nom', 'age', 'tailleCm', 'poidsInitial', 'notesSante', 'suiviMedical'].includes(f)
);

function pickProfilFields(body) {
  const data = {};
  for (const field of PROFIL_FIELDS) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  return data;
}

function validateProfilFields(data) {
  validateEnum(data.objectif, ObjectifClient, 'objectif');
  validateEnum(data.sexe, Sexe, 'sexe');
  validateEnum(data.niveauActivite, NiveauActivite, 'niveauActivite');
  validateEnum(data.horaireTravail, HoraireTravail, 'horaireTravail');
  validateEnum(data.experienceSportive, ExperienceSportive, 'experienceSportive');
}

function validateDisponibilites(disponibilites) {
  if (disponibilites === undefined) return;
  if (!Array.isArray(disponibilites)) {
    const err = new Error('disponibilites doit être un tableau');
    err.status = 400;
    throw err;
  }
  for (const d of disponibilites) {
    validateEnum(d.jourSemaine, JourSemaine, 'disponibilites[].jourSemaine');
    validateEnum(d.creneau, Creneau, 'disponibilites[].creneau');
  }
}

function withInactivite(client, seuilJours) {
  const joursDepuisActivite = Math.floor((Date.now() - new Date(client.updatedAt).getTime()) / 86_400_000);
  return { ...client, joursDepuisActivite, inactif: joursDepuisActivite > seuilJours };
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { search, archive, seuilJours } = req.query;
    const seuil = seuilJours ? Number(seuilJours) : SEUIL_INACTIVITE_JOURS_DEFAUT;

    const clients = await prisma.client.findMany({
      where: {
        coachId: req.coachId,
        archive: archive === undefined ? false : archive === 'true',
        ...(search ? { nom: { contains: search, mode: 'insensitive' } } : {}),
      },
      orderBy: { nom: 'asc' },
    });

    res.json(clients.map((c) => withInactivite(c, seuil)));
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const client = await prisma.client.findFirst({
      where: { id: req.params.id, coachId: req.coachId },
      include: { disponibilites: true },
    });
    if (!client) return res.status(404).json({ error: 'Client introuvable' });
    res.json(withInactivite(client, SEUIL_INACTIVITE_JOURS_DEFAUT));
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = pickProfilFields(req.body);

    if (!data.nom || !data.objectif) {
      return res.status(400).json({ error: 'nom et objectif sont requis' });
    }
    validateProfilFields(data);
    validateDisponibilites(req.body.disponibilites);

    const client = await prisma.client.create({
      data: {
        ...data,
        coachId: req.coachId,
        ...(req.body.disponibilites
          ? { disponibilites: { create: req.body.disponibilites } }
          : {}),
      },
      include: { disponibilites: true },
    });

    res.status(201).json(client);
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.client.findFirst({
      where: { id: req.params.id, coachId: req.coachId },
    });
    if (!existing) return res.status(404).json({ error: 'Client introuvable' });

    const data = pickProfilFields(req.body);
    validateProfilFields(data);
    validateDisponibilites(req.body.disponibilites);

    const client = await prisma.$transaction(async (tx) => {
      if (req.body.disponibilites !== undefined) {
        await tx.disponibilite.deleteMany({ where: { clientId: existing.id } });
      }
      return tx.client.update({
        where: { id: existing.id },
        data: {
          ...data,
          ...(req.body.disponibilites
            ? { disponibilites: { create: req.body.disponibilites } }
            : {}),
        },
        include: { disponibilites: true },
      });
    });

    res.json(client);
  })
);

router.patch(
  '/:id/archive',
  asyncHandler(async (req, res) => {
    const existing = await prisma.client.findFirst({
      where: { id: req.params.id, coachId: req.coachId },
    });
    if (!existing) return res.status(404).json({ error: 'Client introuvable' });

    const archive = req.body.archive !== false;
    const client = await prisma.client.update({
      where: { id: existing.id },
      data: { archive },
    });

    res.json(client);
  })
);

router.post(
  '/:id/duplicate',
  asyncHandler(async (req, res) => {
    const source = await prisma.client.findFirst({
      where: { id: req.params.id, coachId: req.coachId },
      include: { disponibilites: true },
    });
    if (!source) return res.status(404).json({ error: 'Client source introuvable' });

    const disponibilitesData = source.disponibilites.map(({ jourSemaine, creneau, disponible }) => ({
      jourSemaine,
      creneau,
      disponible,
    }));
    const profilAReporter = {};
    for (const field of PROFIL_FIELDS_DUPLIQUABLES) {
      profilAReporter[field] = source[field];
    }

    if (req.body.targetClientId) {
      const target = await prisma.client.findFirst({
        where: { id: req.body.targetClientId, coachId: req.coachId },
      });
      if (!target) return res.status(404).json({ error: 'Client cible introuvable' });

      const client = await prisma.$transaction(async (tx) => {
        await tx.disponibilite.deleteMany({ where: { clientId: target.id } });
        return tx.client.update({
          where: { id: target.id },
          data: { ...profilAReporter, disponibilites: { create: disponibilitesData } },
          include: { disponibilites: true },
        });
      });
      return res.json(client);
    }

    const client = await prisma.client.create({
      data: {
        ...profilAReporter,
        nom: req.body.nom || `${source.nom} (copie)`,
        coachId: req.coachId,
        disponibilites: { create: disponibilitesData },
      },
      include: { disponibilites: true },
    });
    res.status(201).json(client);
  })
);

router.get(
  '/:id/split-suggestion',
  asyncHandler(async (req, res) => {
    const client = await prisma.client.findFirst({
      where: { id: req.params.id, coachId: req.coachId },
      include: { disponibilites: true },
    });
    if (!client) return res.status(404).json({ error: 'Client introuvable' });

    const joursDisponibles = compterJoursDisponibles(client.disponibilites);
    const typeSplit = suggererSplit({
      joursDisponibles,
      experienceSportive: client.experienceSportive,
      horaireTravail: client.horaireTravail,
    });

    res.json({ joursDisponibles, typeSplit });
  })
);

router.get(
  '/:id/programmes',
  asyncHandler(async (req, res) => {
    const client = await prisma.client.findFirst({ where: { id: req.params.id, coachId: req.coachId } });
    if (!client) return res.status(404).json({ error: 'Client introuvable' });

    const programmes = await prisma.programme.findMany({
      where: { clientId: client.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(programmes);
  })
);

router.post(
  '/:id/programmes',
  asyncHandler(async (req, res) => {
    const client = await prisma.client.findFirst({ where: { id: req.params.id, coachId: req.coachId } });
    if (!client) return res.status(404).json({ error: 'Client introuvable' });

    const { nom, typeSplit, frequence, jours } = req.body;
    if (!nom || !typeSplit || !frequence) {
      return res.status(400).json({ error: 'nom, typeSplit et frequence sont requis' });
    }
    validateEnum(typeSplit, TypeSplit, 'typeSplit');
    validateJours(jours);

    const programme = await createProgrammeForClient(prisma, client.id, { nom, typeSplit, frequence, jours });
    res.status(201).json(programme);
  })
);

router.get(
  '/:id/objectif-diete',
  asyncHandler(async (req, res) => {
    const client = await prisma.client.findFirst({ where: { id: req.params.id, coachId: req.coachId } });
    if (!client) return res.status(404).json({ error: 'Client introuvable' });

    const objectif = await prisma.objectifDiete.findUnique({ where: { clientId: client.id } });
    res.json(objectif);
  })
);

router.put(
  '/:id/objectif-diete',
  asyncHandler(async (req, res) => {
    const client = await prisma.client.findFirst({ where: { id: req.params.id, coachId: req.coachId } });
    if (!client) return res.status(404).json({ error: 'Client introuvable' });

    const { methodeCalcul } = req.body;
    validateEnum(methodeCalcul, MethodeCalcul, 'methodeCalcul');
    if (!methodeCalcul) return res.status(400).json({ error: 'methodeCalcul est requis' });

    let data;
    if (methodeCalcul === 'AUTO') {
      const { typeObjectifCalorique } = req.body;
      validateEnum(typeObjectifCalorique, TypeObjectifCalorique, 'typeObjectifCalorique');
      if (!typeObjectifCalorique) {
        return res.status(400).json({ error: 'typeObjectifCalorique est requis en mode automatique' });
      }
      const { sexe, poidsInitial, tailleCm, age } = client;
      if (!sexe || !poidsInitial || !tailleCm || !age || !client.niveauActivite) {
        return res.status(400).json({
          error:
            'Le profil client doit renseigner sexe, âge, taille, poids et niveau d\'activité pour le calcul automatique',
        });
      }

      const calc = calculerObjectifsAuto({
        sexe,
        poidsKg: poidsInitial,
        tailleCm,
        age,
        niveauActivite: client.niveauActivite,
        typeObjectifCalorique,
      });

      data = { methodeCalcul, typeObjectifCalorique, ...calc };
    } else {
      const { caloriesCible, proteinesCible, glucidesCible, lipidesCible } = req.body;
      if (!caloriesCible || !proteinesCible || !glucidesCible || !lipidesCible) {
        return res.status(400).json({
          error: 'caloriesCible, proteinesCible, glucidesCible et lipidesCible sont requis en mode manuel',
        });
      }
      data = {
        methodeCalcul,
        typeObjectifCalorique: null,
        tdeeCalcule: null,
        caloriesCible,
        proteinesCible,
        glucidesCible,
        lipidesCible,
      };
    }

    const objectif = await prisma.objectifDiete.upsert({
      where: { clientId: client.id },
      create: { clientId: client.id, ...data },
      update: data,
    });
    res.json(objectif);
  })
);

router.get(
  '/:id/journal-diete',
  asyncHandler(async (req, res) => {
    const client = await prisma.client.findFirst({ where: { id: req.params.id, coachId: req.coachId } });
    if (!client) return res.status(404).json({ error: 'Client introuvable' });

    const { debut, fin } = req.query;
    const entries = await prisma.journalDiete.findMany({
      where: {
        clientId: client.id,
        ...(debut || fin
          ? { date: { ...(debut ? { gte: new Date(debut) } : {}), ...(fin ? { lte: new Date(fin) } : {}) } }
          : {}),
      },
      orderBy: { date: 'desc' },
    });
    res.json(entries);
  })
);

router.put(
  '/:id/journal-diete',
  asyncHandler(async (req, res) => {
    const client = await prisma.client.findFirst({ where: { id: req.params.id, coachId: req.coachId } });
    if (!client) return res.status(404).json({ error: 'Client introuvable' });

    const { date, calories, proteines, glucides, lipides, eau, repas, notes } = req.body;
    if (!date) return res.status(400).json({ error: 'date est requise' });

    const data = { calories, proteines, glucides, lipides, eau, repas, notes };
    const entry = await prisma.journalDiete.upsert({
      where: { clientId_date: { clientId: client.id, date: new Date(date) } },
      create: { clientId: client.id, date: new Date(date), ...data },
      update: data,
    });
    res.json(entry);
  })
);

router.get(
  '/:id/mesures',
  asyncHandler(async (req, res) => {
    const client = await prisma.client.findFirst({ where: { id: req.params.id, coachId: req.coachId } });
    if (!client) return res.status(404).json({ error: 'Client introuvable' });

    const mesures = await prisma.mesure.findMany({
      where: { clientId: client.id },
      orderBy: { date: 'desc' },
    });
    res.json(mesures);
  })
);

router.post(
  '/:id/mesures',
  asyncHandler(async (req, res) => {
    const client = await prisma.client.findFirst({ where: { id: req.params.id, coachId: req.coachId } });
    if (!client) return res.status(404).json({ error: 'Client introuvable' });

    const { date, poids, bras, taille, poitrine, cuisse, notes } = req.body;
    const mesure = await prisma.mesure.create({
      data: {
        clientId: client.id,
        ...(date ? { date: new Date(date) } : {}),
        poids,
        bras,
        taille,
        poitrine,
        cuisse,
        notes,
      },
    });
    res.status(201).json(mesure);
  })
);

export default router;
