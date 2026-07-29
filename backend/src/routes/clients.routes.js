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
import { calculerInactivite } from '../lib/dashboard.js';
import { createProgrammeForClient, validateJours } from '../lib/programmes.js';
import { calculerObjectifsAuto } from '../lib/nutrition.js';
import { calculerDateFin } from '../lib/abonnements.js';
import { calculerModulesActifs } from '../lib/accesModules.js';

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

// Alerte si absence de mesure récente — cahier des charges section 3.7 / T5.2.
// Basée sur la date de la dernière mesure loguée (et non plus une simple activité générique),
// pour un signal fidèle à "un client n'a pas de mesure récente".
function withInactivite({ mesures, ...client }, seuilJours) {
  const derniereMesureDate = mesures?.[0]?.date ?? null;
  return { ...client, derniereMesureDate, ...calculerInactivite(derniereMesureDate, seuilJours) };
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
      include: { mesures: { orderBy: { date: 'desc' }, take: 1, select: { date: true } } },
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
      include: {
        disponibilites: true,
        mesures: { orderBy: { date: 'desc' }, take: 1, select: { date: true } },
      },
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

router.get(
  '/:id/jours-entrainement',
  asyncHandler(async (req, res) => {
    const client = await prisma.client.findFirst({ where: { id: req.params.id, coachId: req.coachId } });
    if (!client) return res.status(404).json({ error: 'Client introuvable' });

    const jours = await prisma.jourEntrainement.findMany({
      where: { programme: { clientId: client.id } },
      include: { programme: { select: { id: true, nom: true } }, exercices: true },
      orderBy: [{ programmeId: 'asc' }, { ordre: 'asc' }],
    });
    res.json(jours);
  })
);

router.get(
  '/:id/seances',
  asyncHandler(async (req, res) => {
    const client = await prisma.client.findFirst({ where: { id: req.params.id, coachId: req.coachId } });
    if (!client) return res.status(404).json({ error: 'Client introuvable' });

    const { debut, fin, jourId } = req.query;
    const seances = await prisma.seance.findMany({
      where: {
        clientId: client.id,
        ...(jourId ? { jourId } : {}),
        ...(debut || fin
          ? { date: { ...(debut ? { gte: new Date(debut) } : {}), ...(fin ? { lte: new Date(fin) } : {}) } }
          : {}),
      },
      include: { jour: { include: { programme: { select: { nom: true } } } }, exercicesRealises: true },
      orderBy: { date: 'desc' },
    });
    res.json(seances);
  })
);

router.post(
  '/:id/seances',
  asyncHandler(async (req, res) => {
    const client = await prisma.client.findFirst({ where: { id: req.params.id, coachId: req.coachId } });
    if (!client) return res.status(404).json({ error: 'Client introuvable' });

    const { date, jourId, ressenti, notes, exercicesRealises } = req.body;
    if (!date) return res.status(400).json({ error: 'date est requise' });

    if (jourId) {
      const jour = await prisma.jourEntrainement.findFirst({
        where: { id: jourId, programme: { clientId: client.id } },
      });
      if (!jour) return res.status(400).json({ error: 'jourId invalide pour ce client' });
    }

    const seance = await prisma.seance.create({
      data: {
        clientId: client.id,
        date: new Date(date),
        jourId: jourId || null,
        ressenti,
        notes,
        exercicesRealises: {
          create: (exercicesRealises || []).map((e) => ({
            nom: e.nom,
            chargeRealisee: e.chargeRealisee,
            repsRealisees: e.repsRealisees,
            notes: e.notes,
          })),
        },
      },
      include: { jour: true, exercicesRealises: true },
    });
    res.status(201).json(seance);
  })
);

router.get(
  '/:id/exercices-noms',
  asyncHandler(async (req, res) => {
    const client = await prisma.client.findFirst({ where: { id: req.params.id, coachId: req.coachId } });
    if (!client) return res.status(404).json({ error: 'Client introuvable' });

    const rows = await prisma.exerciceRealise.findMany({
      where: { seance: { clientId: client.id } },
      select: { nom: true },
      distinct: ['nom'],
      orderBy: { nom: 'asc' },
    });
    res.json(rows.map((r) => r.nom));
  })
);

router.get(
  '/:id/progression',
  asyncHandler(async (req, res) => {
    const client = await prisma.client.findFirst({ where: { id: req.params.id, coachId: req.coachId } });
    if (!client) return res.status(404).json({ error: 'Client introuvable' });

    const { exercice } = req.query;
    if (!exercice) return res.status(400).json({ error: 'exercice est requis' });

    const realises = await prisma.exerciceRealise.findMany({
      where: { nom: exercice, seance: { clientId: client.id } },
      include: { seance: { select: { date: true } } },
    });

    const points = realises
      .map((e) => ({
        date: e.seance.date,
        chargeRealisee: e.chargeRealisee,
        repsRealisees: e.repsRealisees,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(points);
  })
);

// Abonnements par module — cahier des charges section 5 (T10.2/T10.3).
router.get(
  '/:id/abonnements',
  asyncHandler(async (req, res) => {
    const client = await prisma.client.findFirst({ where: { id: req.params.id, coachId: req.coachId } });
    if (!client) return res.status(404).json({ error: 'Client introuvable' });

    const abonnements = await prisma.clientAbonnement.findMany({
      where: { clientId: client.id },
      include: { catalogueAbonnement: true },
      orderBy: { dateDebut: 'desc' },
    });
    res.json(abonnements);
  })
);

router.post(
  '/:id/abonnements',
  asyncHandler(async (req, res) => {
    const client = await prisma.client.findFirst({ where: { id: req.params.id, coachId: req.coachId } });
    if (!client) return res.status(404).json({ error: 'Client introuvable' });

    const { catalogueAbonnementId, dateDebut } = req.body;
    if (!catalogueAbonnementId) return res.status(400).json({ error: 'catalogueAbonnementId est requis' });

    const catalogueAbonnement = await prisma.catalogueAbonnement.findFirst({
      where: { id: catalogueAbonnementId, coachId: req.coachId },
    });
    if (!catalogueAbonnement) return res.status(404).json({ error: 'Entrée de catalogue introuvable' });

    const debut = dateDebut ? new Date(dateDebut) : new Date();
    const abonnement = await prisma.clientAbonnement.create({
      data: {
        clientId: client.id,
        catalogueAbonnementId: catalogueAbonnement.id,
        dateDebut: debut,
        dateFin: calculerDateFin(debut, catalogueAbonnement.dureeMois),
      },
      include: { catalogueAbonnement: true },
    });
    res.status(201).json(abonnement);
  })
);

router.get(
  '/:id/modules-actifs',
  asyncHandler(async (req, res) => {
    const client = await prisma.client.findFirst({ where: { id: req.params.id, coachId: req.coachId } });
    if (!client) return res.status(404).json({ error: 'Client introuvable' });

    const abonnements = await prisma.clientAbonnement.findMany({
      where: { clientId: client.id },
      include: { catalogueAbonnement: { select: { module: true } } },
    });

    const modulesActifs = calculerModulesActifs(
      abonnements.map((a) => ({ module: a.catalogueAbonnement.module, dateFin: a.dateFin }))
    );
    res.json(modulesActifs);
  })
);

// Réservations — cahier des charges section 5 (T11.3). Le coach réserve un créneau pour
// le client en attendant l'ouverture d'un espace client autonome.
router.get(
  '/:id/reservations',
  asyncHandler(async (req, res) => {
    const client = await prisma.client.findFirst({ where: { id: req.params.id, coachId: req.coachId } });
    if (!client) return res.status(404).json({ error: 'Client introuvable' });

    const { upcoming } = req.query;
    const reservations = await prisma.reservation.findMany({
      where: {
        clientId: client.id,
        ...(upcoming === 'true' ? { dateHeure: { gte: new Date() }, statut: 'CONFIRMEE' } : {}),
      },
      orderBy: { dateHeure: upcoming === 'true' ? 'asc' : 'desc' },
    });
    res.json(reservations);
  })
);

router.post(
  '/:id/reservations',
  asyncHandler(async (req, res) => {
    const client = await prisma.client.findFirst({ where: { id: req.params.id, coachId: req.coachId } });
    if (!client) return res.status(404).json({ error: 'Client introuvable' });

    const { creneauId, dateHeure } = req.body;
    if (!dateHeure) return res.status(400).json({ error: 'dateHeure est requise' });

    if (creneauId) {
      const creneau = await prisma.creneauDisponible.findFirst({
        where: { id: creneauId, coachId: req.coachId },
      });
      if (!creneau) return res.status(404).json({ error: 'Créneau introuvable' });
    }

    // Un seul client à la fois sur un même horaire — cohérent avec le fonctionnement d'un
    // coach solo en visio (pas de créneaux de groupe en V1.1).
    const conflit = await prisma.reservation.findFirst({
      where: { client: { coachId: req.coachId }, dateHeure: new Date(dateHeure), statut: 'CONFIRMEE' },
    });
    if (conflit) return res.status(409).json({ error: 'Ce créneau est déjà réservé' });

    const reservation = await prisma.reservation.create({
      data: { clientId: client.id, creneauId: creneauId || null, dateHeure: new Date(dateHeure) },
    });
    res.status(201).json(reservation);
  })
);

export default router;
