// helpers/sp.js (voorbeeld, je plakt je bestaande werkende code)
const { ClientSecretCredential } = require('@azure/identity');
const { Client } = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

function getGraphClient() {
  const credential = new ClientSecretCredential(
    process.env.AZURE_TENANT_ID,
    process.env.AZURE_CLIENT_ID,
    process.env.AZURE_CLIENT_SECRET
  );
  return Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => {
        const token = await credential.getToken('https://graph.microsoft.com/.default');
        return token.token;
      }
    }
  });
}

async function getFilesFromSharePoint(folderPath, userId) {
  const client = getGraphClient();
  // Maak gebruik van je eigen bestaande mapping op basis van folderPath en userId
  const files = await client.api(`/me/drive/root:/${folderPath}:/children`).get();
  return files.value;
}

async function downloadFileFromSharePoint(fileId, userId) {
  const client = getGraphClient();
  const fileMeta = await client.api(`/me/drive/items/${fileId}`).get();
  const downloadUrl = fileMeta['@microsoft.graph.downloadUrl'];
  const resp = await fetch(downloadUrl);
  const buffer = await resp.arrayBuffer();
  return { name: fileMeta.name, data: Buffer.from(buffer) };
}

module.exports = { getFilesFromSharePoint, downloadFileFromSharePoint };
