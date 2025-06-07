// index.js  – Finny 4.5.2 (Azure‑auth, secure cookie, static UI + SharePoint refresh)
require('dotenv').config();
const path     = require('path');
const express  = require('express');
const session  = require('express-session');

// 👉  SharePoint helper (uit 4.0/4.1) – haalt bestanden uit de gekoppelde drive
const { getFilesFromSharePoint } = require('./utils/sp');
const spRoutes = require('./routes/sharepointRoutes');
const { router: authRouter, requireAuth } = require('./routes/auth');
const chatRoutes   = require('./routes/chat');
const refreshRoute = require('./routes/refresh');

const app = express();
app.set('trust proxy', 1);                            // Render/HTTPS aware

/* ── Middleware ─────────────────────────────────────────────────────────── */
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));   // serve chat.html

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'finny',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,          // verplicht voor https → cookie wordt nu bewaard
      sameSite: 'lax'        // laat OAuth-redirect vanaf Microsoft toe
    }
  })
);

/* ── Basis-routes ───────────────────────────────────────────────────────── */
app.get('/ping', (_req, res) => res.send('pong'));            // health check
app.get('/',     (_req, res) => res.redirect('/auth/login')); // root→login
app.use('/sp', requireAuth, spRoutes);
app.get('/', (_req,res)=> res.sendFile(path.join(__dirname,'public/index.html')));
app.use('/auth',  authRouter);
app.use('/chat',  requireAuth, chatRoutes);
app.use('/refresh', refreshRoute);     // <– nieuwe SP‑refresh‑endpoint

/* ── Server start ───────────────────────────────────────────────────────── */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Finny 4.5.2 live on :${PORT}`));
