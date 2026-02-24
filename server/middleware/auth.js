import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable must be set in production');
  }
  console.warn('⚠️  Using default JWT secret. Set JWT_SECRET env var before deploying to production.');
  return 'dev-secret-hot-sauce-passport-change-in-production-2024';
})();

export function requireAuth(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.clearCookie('token');
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
}

export function generateToken(userId) {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    {
      expiresIn: '7d',
      issuer: 'hot-sauce-passport',
    }
  );
}
