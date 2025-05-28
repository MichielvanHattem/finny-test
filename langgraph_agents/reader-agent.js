
const { Client } = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');
require('dotenv').config();

async function getAccessToken() {
  const url = `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`;
  const params = new URLSearchParams();
  params.append('client_id', process.env.AZURE_CLIENT_ID);
  params.append('scope', 'https://graph.microsoft.com/.default');
  params.append('client_secret', process.env.AZURE_CLIENT_SECRET);
  params.append('grant_type', 'client_credentials');

  const result = await fetch(url, {
    method: 'POST',
    body: params
  });
  const data = await result.json();
  return data.access_token;
}

async function loadData() {
  if (process.env.USE_LIVE_SHAREPOINT !== 'true') {
    return { omzet: 300000, kosten: 176000, winst: 124000 };
  }

  const token = await getAccessToken();
  const client = Client.init({
    authProvider: (done) => done(null, token)
  });

  const files = await client.api('/me/drive/root:/FinnyTest:/children').get();
  const first = files.value.find(f => f.name.endsWith('.xlsx') || f.name.endsWith('.csv'));
  if (!first) throw new Error("Geen geschikt bestand gevonden in FinnyTest map.");

  return { bestand: first.name, inhoud: "voorbeelddata", winst: 124000 };
}

module.exports = { loadData };
