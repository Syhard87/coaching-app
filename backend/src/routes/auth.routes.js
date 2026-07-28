import { Router } from 'express';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { construireUrlConsentement, echangerCodeContreProfil } from '../lib/googleAuth.js';

const router = Router();

function signToken(coach) {
  return jwt.sign({ coachId: coach.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

function toPublicCoach(coach) {
  return { id: coach.id, nom: coach.nom, email: coach.email, avatarUrl: coach.avatarUrl };
}

function googleRedirectUri() {
  return process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback';
}

// Étape 1 — redirige vers l'écran de consentement Google. `state` protège contre le CSRF :
// une valeur aléatoire signée dans un cookie, revérifiée au retour (T9.5.2).
router.get('/google', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  res.cookie('google_oauth_state', state, { httpOnly: true, maxAge: 5 * 60 * 1000, sameSite: 'lax' });
  const url = construireUrlConsentement({
    clientId: process.env.GOOGLE_CLIENT_ID,
    redirectUri: googleRedirectUri(),
    state,
  });
  res.redirect(url);
});

// Étape 2 — Google redirige ici avec un code d'autorisation. On l'échange contre le profil
// (email, nom, avatar), puis on relie/crée le coach et on émet notre propre JWT (inchangé pour
// toutes les routes /api/* existantes, qui vérifient déjà ce token — voir middleware/auth.js).
router.get(
  '/google/callback',
  asyncHandler(async (req, res) => {
    const { code, state, error } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (error || !code) {
      return res.redirect(`${frontendUrl}/login?erreur=google_refuse`);
    }
    if (!state || state !== req.cookies?.google_oauth_state) {
      return res.redirect(`${frontendUrl}/login?erreur=state_invalide`);
    }
    res.clearCookie('google_oauth_state');

    const profil = await echangerCodeContreProfil({
      code,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: googleRedirectUri(),
    });

    // Migration du compte existant (T9.5.4) : un coach déjà créé avec le même email (ex. via
    // l'ancienne inscription email/mot de passe) est relié à son compte Google au lieu d'être
    // dupliqué — ses clients, programmes et historique restent attachés au même coachId.
    let coach = await prisma.coach.findUnique({ where: { googleId: profil.googleId } });
    if (!coach) {
      coach = await prisma.coach.findUnique({ where: { email: profil.email } });
      if (coach) {
        coach = await prisma.coach.update({
          where: { id: coach.id },
          data: { googleId: profil.googleId, avatarUrl: profil.avatarUrl },
        });
      } else {
        coach = await prisma.coach.create({
          data: { nom: profil.nom, email: profil.email, googleId: profil.googleId, avatarUrl: profil.avatarUrl },
        });
      }
    }

    const token = signToken(coach);
    res.redirect(`${frontendUrl}/auth/callback#token=${token}`);
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
