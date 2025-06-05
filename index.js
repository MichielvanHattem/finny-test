// index.js  – Finny 4.5
require('dotenv').config();
const express = require('express');
const session  = require('express-session');

const { router: authRouter, requireAuth } = require('./routes/auth');
const chatRoutes = require('./routes/chat');

const app = express();
app.set('trust proxy', 1);

// ─── Middle-ware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'finny',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }         // blijft prima voor testen op Render
  })
);

// ─── Routes ─────────────────────────────────────────────────────────────────────
app.get('/ping',  (_req, res) => res.send('pong'));              // health check
app.get('/',      (_req, res) => res.redirect('/auth/login'));   // nette root

app.use('/auth', authRouter);
app.use('/chat', requireAuth, chatRoutes);

// ─── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Finny 4.5 live on :${PORT}`));
