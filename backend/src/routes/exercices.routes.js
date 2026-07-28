import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { chercherGifExercice } from '../lib/exerciceGifs.js';

const router = Router();
router.use(requireAuth);

// Suggestion automatique de GIF de démonstration — US-2.5.
router.get(
  '/gif',
  asyncHandler(async (req, res) => {
    const { nom } = req.query;
    if (!nom) return res.status(400).json({ error: 'nom est requis' });

    const gifUrl = await chercherGifExercice(nom);
    res.json({ gifUrl });
  })
);

export default router;
