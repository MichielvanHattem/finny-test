// routes/auth.js
const express = require('express');
const path    = require('path');

const router = express.Router();

// ── Login-pagina ────────────────────────────────────────────────────────────
router.get('/login', (_req, res) =>
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'))
);

// ── Dummy-authorisatie (ongewijzigd) ─────────────────────────────────────────
function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.status(401).json({ error: 'unauthenticated' });
}

module.exports = { router, requireAuth };
