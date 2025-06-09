const express = require('express');
const app = express();
const authMiddleware = require('./middleware/authMiddleware');
const spFilesRoute = require('./routes/sp-files');

// Nodig om environment-variabelen uit .env te lezen
require('dotenv').config();

// Nodig voor Azure OAuth afhandeling
const { ConfidentialClientApplication } = require('@azure/msal-node');

app.use(express.json());

// Middleware voor statische bestanden
app.use(express.static('public'));

// SP-bestanden route met authenticatie
app.use('/sp-files', authMiddleware, spFilesRoute);

// Homepage route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// MSAL configuratie voor Azure AD OAuth
const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
  },
};

const msalInstance = new ConfidentialClientApplication(msalConfig);

// Inloggen via Azure AD route
app.get('/auth/login', async (req, res) => {
  const authCodeUrlParameters = {
    scopes: ["user.read"],
    redirectUri: process.env.AZURE_REDIRECT_URI,
  };

  try {
    const authUrl = await msalInstance.getAuthCodeUrl(authCodeUrlParameters);
    res.redirect(authUrl);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send('Login fout opgetreden.');
  }
});

// OAuth callback route
app.get('/auth/redirect', async (req, res) => {
  const tokenRequest = {
    code: req.query.code,
    scopes: ["user.read"],
    redirectUri: process.env.AZURE_REDIRECT_URI,
  };

  try {
    const response = await msalInstance.acquireTokenByCode(tokenRequest);
    console.log('OAuth token response:', response);

    // Hier regel je verdere sessiebeheer of JWT-token uitgifte
    res.send('Azure AD Login succesvol!');
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).send('OAuth callback fout opgetreden.');
  }
});

// Server starten
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server draait foutloos op poort ${PORT}`);
});
