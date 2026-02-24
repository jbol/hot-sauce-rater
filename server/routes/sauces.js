import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { getDb } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// All sauce routes require authentication
router.use(requireAuth);

// ─── Get User's Ratings & Favorites ──────────────────────────────────────────
router.get('/user-data', (req, res) => {
  const db = getDb();
  const userId = req.user.userId;

  const ratingsRows = db
    .prepare('SELECT sauce_id, rating, rated_at FROM ratings WHERE user_id = ? ORDER BY rated_at DESC')
    .all(userId);

  const favoritesRows = db
    .prepare('SELECT sauce_id FROM favorites WHERE user_id = ?')
    .all(userId);

  const ratings = {};
  for (const row of ratingsRows) {
    ratings[row.sauce_id] = { rating: row.rating, ratedAt: row.rated_at };
  }

  res.json({
    ratings,
    favorites: favoritesRows.map((f) => f.sauce_id),
  });
});

// ─── Rate a Sauce ─────────────────────────────────────────────────────────────
router.post(
  '/rate',
  [
    body('sauceId').isInt({ min: 1 }).withMessage('Invalid sauce ID'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sauceId, rating } = req.body;
    const db = getDb();
    const userId = req.user.userId;

    db.prepare(`
      INSERT INTO ratings (user_id, sauce_id, rating)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id, sauce_id)
      DO UPDATE SET rating = excluded.rating, rated_at = CURRENT_TIMESTAMP
    `).run(userId, sauceId, rating);

    res.json({ success: true, sauceId, rating });
  }
);

// ─── Toggle Favorite ──────────────────────────────────────────────────────────
router.post(
  '/favorite',
  [body('sauceId').isInt({ min: 1 }).withMessage('Invalid sauce ID')],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sauceId } = req.body;
    const db = getDb();
    const userId = req.user.userId;

    const existing = db
      .prepare('SELECT id FROM favorites WHERE user_id = ? AND sauce_id = ?')
      .get(userId, sauceId);

    if (existing) {
      db.prepare('DELETE FROM favorites WHERE user_id = ? AND sauce_id = ?').run(userId, sauceId);
      res.json({ favorited: false });
    } else {
      db.prepare('INSERT INTO favorites (user_id, sauce_id) VALUES (?, ?)').run(userId, sauceId);
      res.json({ favorited: true });
    }
  }
);

export default router;
