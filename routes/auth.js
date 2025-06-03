const express = require('express');
const msal = require('@azure/msal-node');

const router = express.Router();

// MSAL-config
const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
    clientSecret: process.env.AZURE_CLIENT_SECRET
  }
};

const cca = new msal.ConfidentialClientApplication(msalConfig);

// Helper
function requireAuth(req, res, next) {
  if (req.session.account) return next();
  return res.redirect('/auth/login');
}

// === Login-flow ===
router.get('/login', async (req, res) => {
  const redirectUri = `https://${req.get('host')}/auth/redirect`; // force https
  const params = { scopes: ['user.read'], redirectUri };

  try {
    const url = await cca.getAuthCodeUrl(params);
    return res.redirect(url);
  } catch (err) {
    console.error('AuthCodeUrl error', err);
    return res.status(500).send('Auth error');
  }
});

router.get('/redirect', async (req, res) => {
  const redirectUri = `https://${req.get('host')}/auth/redirect`;
  const tokenRequest = { code: req.query.code, scopes: ['user.read'], redirectUri };

  try {
    const response = await cca.acquireTokenByCode(tokenRequest);
    req.session.account = response.account;
    return res.redirect('/');
  } catch (err) {
    console.error('Token acquisition error', err);
    return res.status(500).send('Auth error');
  }
});

module.exports = { router, requireAuth };
