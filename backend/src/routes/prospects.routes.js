import { Router } from 'express';
import { StatutProspect, ObjectifClient } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { validateEnum } from '../lib/validation.js';

const router = Router();
router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { statut } = req.query;
    validateEnum(statut, StatutProspect, 'statut');

    const prospects = await prisma.prospect.findMany({
      where: { coachId: req.coachId, ...(statut ? { statut } : {}) },
      orderBy: { dateCreation: 'desc' },
    });
    res.json(prospects);
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.prospect.findFirst({
      where: { id: req.params.id, coachId: req.coachId },
    });
    if (!existing) return res.status(404).json({ error: 'Prospect introuvable' });

    const { statut } = req.body;
    validateEnum(statut, StatutProspect, 'statut');
    if (!statut) return res.status(400).json({ error: 'statut est requis' });

    const prospect = await prisma.prospect.update({ where: { id: existing.id }, data: { statut } });
    res.json(prospect);
  })
);

// Conversion en client (US-8.3) : pré-remplit un nouveau client à partir du prospect, en reprenant
// le même principe que la duplication de client (POST /clients/:id/duplicate) — création directe
// scopée au coach connecté. L'objectif du prospect est du texte libre saisi sur la page publique,
// donc il ne peut pas être mappé automatiquement vers l'enum ObjectifClient : le coach le choisit
// au moment de la conversion, le texte d'origine (objectif + message) est reporté dans les notes.
router.post(
  '/:id/convert',
  asyncHandler(async (req, res) => {
    const prospect = await prisma.prospect.findFirst({
      where: { id: req.params.id, coachId: req.coachId },
    });
    if (!prospect) return res.status(404).json({ error: 'Prospect introuvable' });
    if (prospect.clientId) {
      return res.status(409).json({ error: 'Ce prospect a déjà été converti en client' });
    }

    const { objectif } = req.body;
    validateEnum(objectif, ObjectifClient, 'objectif');
    if (!objectif) return res.status(400).json({ error: 'objectif est requis' });

    // Client n'a pas de champ "notes" générique : notesSante est le seul champ texte libre
    // disponible sur le profil, réutilisé ici pour ne pas perdre le message/objectif d'origine.
    const notes = [
      prospect.objectif ? `Objectif exprimé : ${prospect.objectif}` : null,
      prospect.message ? `Message : ${prospect.message}` : null,
      `Contact : ${prospect.contact}`,
    ]
      .filter(Boolean)
      .join('\n');

    const client = await prisma.$transaction(async (tx) => {
      const nouveauClient = await tx.client.create({
        data: { nom: prospect.nom, objectif, notesSante: notes, coachId: req.coachId },
      });
      await tx.prospect.update({
        where: { id: prospect.id },
        data: { statut: 'CONVERTI', clientId: nouveauClient.id },
      });
      return nouveauClient;
    });

    res.status(201).json(client);
  })
);

export default router;
