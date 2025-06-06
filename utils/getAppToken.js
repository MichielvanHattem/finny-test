const fetch = require('node-fetch');

let cachedToken = null;
let expiresAt   = 0;   // epoch ms

async function getAppToken() {
  // hergebruik token tot 60 sec vóór expiry
  if (cachedToken && Date.now() < (expiresAt - 60 * 1000)) {
    return cachedToken;
  }

  const params = new URLSearchParams();
  params.append('client_id',     process.env.AZURE_CLIENT_ID);
  params.append('client_secret', process.env.AZURE_CLIENT_SECRET);
  params.append('scope',         'https://graph.microsoft.com/.default');
  params.append('grant_type',    'client_credentials');

  const url = `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`;
  const res = await fetch(url, { method: 'POST', body: params });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Token request failed: ${res.status} ${msg}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  expiresAt   = Date.now() + data.expires_in * 1000;
  return cachedToken;
}

module.exports = getAppToken;
