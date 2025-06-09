const express = require('express');
const path = require('path');
const authMiddleware = require('./middleware/authMiddleware');
const spFilesRoute = require('./routes/sp-files');
require('dotenv').config();
const { ConfidentialClientApplication } = require('@azure/msal-node');

const app = express();

// JSON & Static files middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MSAL configuratie
const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
  },
};
const msalInstance = new ConfidentialClientApplication(msalConfig);

// 🌐 Homepage route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 🔑 Azure AD login route
app.get('/auth/login', async (req, res) => {
  const authCodeUrlParameters = {
    scopes: ["user.read"],
    redirectUri: process.env.AZURE_REDIRECT_URI,
  };

  try {
    const authUrl = await msalInstance.getAuthCodeUrl(authCodeUrlParameters);
    res.redirect(authUrl);
  } catch (error) {
    console.error('Login fout:', error);
    res.status(500).send('Azure AD login fout.');
  }
});

// 🔒 Azure AD callback route
app.get('/auth/redirect', async (req, res) => {
  const tokenRequest = {
    code: req.query.code,
    scopes: ["user.read"],
    redirectUri: process.env.AZURE_REDIRECT_URI,
  };

  try {
    const response = await msalInstance.acquireTokenByCode(tokenRequest);
    console.log('Token response:', response);
    res.send('Azure AD Login succesvol!');
  } catch (error) {
    console.error('OAuth callback fout:', error);
    res.status(500).send('OAuth callback fout.');
  }
});

// 📁 SharePoint-bestanden route (eerder /sp/files genoemd)
app.use('/sp/files', authMiddleware, spFilesRoute);

// 💬 Chat route
app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

// 🖥️ Server starten
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server draait foutloos op poort ${PORT}`);
});
