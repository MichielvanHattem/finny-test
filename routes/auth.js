const express = require('express');
const msal = require('@azure/msal-node');
const router = express.Router();

// Basic MSAL config (confidential client)
const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
    clientSecret: process.env.AZURE_CLIENT_SECRET
  }
};

const cca = new msal.ConfidentialClientApplication(msalConfig);

// Helper middleware
function requireAuth(req, res, next) {
  if (req.session.account) {
    return next();
  }
  return res.redirect('/auth/login');
}

// --- Azure OAuth2 code flow (PKCE) ---
router.get('/login', async (req, res) => {
  const authCodeUrlParameters = {
    scopes: ['user.read'],
    redirectUri: `${req.protocol}://${req.get('host')}/auth/redirect`
  };
  try {
    const response = await cca.getAuthCodeUrl(authCodeUrlParameters);
    return res.redirect(response);
  } catch (error) {
    console.error('AuthCodeUrl error', error);
    return res.status(500).send('Auth error');
  }
});

router.get('/redirect', async (req, res) => {
  const tokenRequest = {
    code: req.query.code,
    scopes: ['user.read'],
    redirectUri: `${req.protocol}://${req.get('host')}/auth/redirect`
  };
  try {
    const response = await cca.acquireTokenByCode(tokenRequest);
    req.session.account = response.account;
    return res.redirect('/');
  } catch (error) {
    console.error('Token acquisition error', error);
    return res.status(500).send('Auth error');
  }
});

module.exports = { router, requireAuth };
