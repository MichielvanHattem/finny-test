// routes/auth.js  – Azure AD B2C login-flow (server-side)
const express = require('express');
const msal    = require('@azure/msal-node');

const router = express.Router();

/*───────────────────
  1. MSAL-config
───────────────────*/
const msalConfig = {
  auth: {
    clientId:     process.env.AZURE_CLIENT_ID,
    authority:    `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
    clientSecret: process.env.AZURE_CLIENT_SECRET
  }
};
const cca = new msal.ConfidentialClientApplication(msalConfig);

/*───────────────────
  2. Session-check
───────────────────*/
function requireAuth(req, res, next) {
  if (req.session.account) return next();
  return res.redirect('/auth/login');      // terug naar login als je onbevoegd bent
}

/*───────────────────
  3. Start login
───────────────────*/
router.get('/login', async (req, res) => {
  const redirectUri = `https://${req.get('host')}/auth/redirect`;   // force https
  const params      = { scopes: ['user.read'], redirectUri };

  try {
    const url = await cca.getAuthCodeUrl(params);
    return res.redirect(url);              // 302 → Microsoft inlog-pagina
  } catch (err) {
    console.error('AuthCodeUrl error', err);
    return res.status(500).send('Auth error');
  }
});

/*───────────────────
  4. Callback van Azure
───────────────────*/
router.get('/redirect', async (req, res) => {
  const redirectUri   = `https://${req.get('host')}/auth/redirect`;
  const tokenRequest  = { code: req.query.code, scopes: ['user.read'], redirectUri };

  try {
    const response         = await cca.acquireTokenByCode(tokenRequest);
    req.session.account    = response.account;             // ⬅ sessie zetten
    return res.redirect('/chat.html');                     // door naar de chat-UI
  } catch (err) {
    console.error('Token acquisition error', err);
    return res.status(500).send('Auth error');
  }
});

module.exports = { router, requireAuth };
