import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { slugify, estSlugValide } from '../lib/slug.js';

const router = Router();

function signToken(coach) {
  return jwt.sign({ coachId: coach.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

function toPublicCoach(coach) {
  return { id: coach.id, nom: coach.nom, email: coach.email, slug: coach.slug };
}

// Génère un slug disponible à partir du nom, en ajoutant un suffixe numérique en cas de collision —
// cahier des charges section 3.10.
async function genererSlugDisponible(nom) {
  const base = slugify(nom) || 'coach';
  let slug = base;
  let suffixe = 2;
  while (await prisma.coach.findUnique({ where: { slug } })) {
    slug = `${base}-${suffixe}`;
    suffixe += 1;
  }
  return slug;
}

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { nom, email, password } = req.body;

    if (!nom || !email || !password) {
      return res.status(400).json({ error: 'nom, email et password sont requis' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });
    }

    const existing = await prisma.coach.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Un compte existe déjà avec cet email' });
    }

    const motDePasseHash = await bcrypt.hash(password, 12);
    const slug = await genererSlugDisponible(nom);
    const coach = await prisma.coach.create({
      data: { nom, email, motDePasseHash, slug },
    });

    res.status(201).json({ token: signToken(coach), coach: toPublicCoach(coach) });
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email et password sont requis' });
    }

    const coach = await prisma.coach.findUnique({ where: { email } });
    if (!coach || !(await bcrypt.compare(password, coach.motDePasseHash))) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    res.json({ token: signToken(coach), coach: toPublicCoach(coach) });
  })
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const coach = await prisma.coach.findUnique({ where: { id: req.coachId } });
    if (!coach) {
      return res.status(404).json({ error: 'Coach introuvable' });
    }
    res.json({ coach: toPublicCoach(coach) });
  })
);

// Modification du slug public depuis le profil (US-8.1) — le nom reste dérivé, mais le coach
// peut personnaliser l'URL de sa page de prospection.
router.patch(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { slug } = req.body;
    if (!slug || !estSlugValide(slug)) {
      return res.status(400).json({
        error: 'slug requis : lettres minuscules, chiffres et tirets uniquement (ex. jean-dupont)',
      });
    }

    const existing = await prisma.coach.findUnique({ where: { slug } });
    if (existing && existing.id !== req.coachId) {
      return res.status(409).json({ error: 'Ce slug est déjà utilisé par un autre coach' });
    }

    const coach = await prisma.coach.update({ where: { id: req.coachId }, data: { slug } });
    res.json({ coach: toPublicCoach(coach) });
  })
);

export default router;
