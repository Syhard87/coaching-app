import { Router } from 'express';
import {
  ObjectifClient,
  Sexe,
  NiveauActivite,
  HoraireTravail,
  ExperienceSportive,
  JourSemaine,
  Creneau,
} from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';

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

function validateEnum(value, enumObj, fieldName) {
  if (value === undefined || value === null) return;
  if (!Object.values(enumObj).includes(value)) {
    const err = new Error(`Valeur invalide pour ${fieldName} : ${value}`);
    err.status = 400;
    throw err;
  }
}

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

export default router;
