import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function signToken(coach) {
  return jwt.sign({ coachId: coach.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

function toPublicCoach(coach) {
  return { id: coach.id, nom: coach.nom, email: coach.email };
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
    const coach = await prisma.coach.create({
      data: { nom, email, motDePasseHash },
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

export default router;
