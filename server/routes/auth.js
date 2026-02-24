import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { getDb } from '../db.js';
import { generateToken, requireAuth } from '../middleware/auth.js';

const router = Router();

// bcrypt salt rounds — 12 is a good balance of security and performance
const SALT_ROUNDS = 12;

const cookieOptions = {
  httpOnly: true,                                      // Not accessible via JS (prevents XSS theft)
  secure: process.env.NODE_ENV === 'production',       // HTTPS-only in production
  sameSite: 'lax',                                     // Protects against CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000,                    // 7 days in milliseconds
};

// ─── Register ────────────────────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('A valid email address is required'),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Za-z]/).withMessage('Password must contain at least one letter')
      .matches(/[0-9]/).withMessage('Password must contain at least one number'),
    body('name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Name is required (max 100 characters)'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;
    const db = getDb();

    // Check for existing account
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // Hash the password — bcrypt automatically generates a unique salt
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = db
      .prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)')
      .run(email, passwordHash, name.trim());

    const token = generateToken(result.lastInsertRowid);
    res.cookie('token', token, cookieOptions);

    res.status(201).json({
      user: {
        id: result.lastInsertRowid,
        email,
        name: name.trim(),
      },
    });
  }
);

// ─── Login ────────────────────────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('A valid email address is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const db = getDb();

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    // Always run bcrypt.compare even if user not found, to prevent timing attacks
    // that could reveal whether an email is registered.
    const dummyHash = '$2a$12$DummyHashToPreventTimingAttacksOnEmailEnumeration00000';
    const passwordMatch = await bcrypt.compare(password, user ? user.password_hash : dummyHash);

    if (!user || !passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id);
    res.cookie('token', token, cookieOptions);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
      },
    });
  }
);

// ─── Logout ───────────────────────────────────────────────────────────────────
router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// ─── Get Current User (session restore on page refresh) ──────────────────────
router.get('/me', requireAuth, (req, res) => {
  const db = getDb();
  const user = db
    .prepare('SELECT id, email, name, created_at FROM users WHERE id = ?')
    .get(req.user.userId);

  if (!user) {
    res.clearCookie('token');
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ user });
});

export default router;
