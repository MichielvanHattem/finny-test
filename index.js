require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const { router: authRouter, requireAuth } = require('./routes/auth');
const chatRoutes = require('./routes/chat');

const app = express();
app.set('trust proxy', 1);             // ← NEW: pak x-forwarded-proto → https
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'finny-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
  })
);

app.use('/auth', authRouter);
app.use('/chat', chatRoutes);

app.get('/', requireAuth, (_req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'chat.html'))
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Finny 4.2 draait op poort ${PORT}`));
