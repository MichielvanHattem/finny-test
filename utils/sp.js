// utils/sp.js – eenvoudige helper om bestanden op te halen uit een SharePoint‑drive
// Werkt met **client‑credential flow** (Application‑permissions)
// ≈ 150 ms per call – geen /me endpoint ➜ geen delegated‑auth fout meer

const { Client } = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');
const { ClientSecretCredential } = require('@azure/identity');

// ❖ env‑vars – zie README / Render ENV
const {
  AZURE_TENANT_ID,
  AZURE_CLIENT_ID,
  AZURE_CLIENT_SECRET,
  SHAREPOINT_DRIVE_ID,               // b!IrRe6P6…
  SHAREPOINT_SITE_HOST               // "vanhattemadvies.sharepoint.com"
} = process.env;

/**
 * Auth‑provider voor Graph v1.0
 */
const credential   = new ClientSecretCredential(
  AZURE_TENANT_ID,
  AZURE_CLIENT_ID,
  AZURE_CLIENT_SECRET,
);

const authProvider = {
  getAccessToken: async () => {
    const token = await credential.getToken('https://graph.microsoft.com/.default');
    return token.token;
  },
};

const graph = Client.initWithMiddleware({ authProvider });

/**
 * Haal bestanden (metadata) op uit een SharePoint‑drive.
 * @param {string} driveId – GUID of b!‑ID
 * @param {string} folderPath – pad binnen de drive, "" = root
 * @returns {Promise<Array>} lijst van items (id, name, webUrl, lastModifiedDateTime)
 */
async function listDriveItems(driveId, folderPath = '') {
  const encoded = encodeURIComponent(folderPath);
  const endpoint = folderPath ?
    `/drives/${driveId}/root:/${encoded}:/children` :
    `/drives/${driveId}/root/children`;
  const res = await graph.api(endpoint)
    .select('id,name,lastModifiedDateTime,webUrl')
    .top(999)
    .get();
  return res.value || [];
}

/**
 * Convenience: haalt alles op uit de default‑drive en map "Gedeelde documenten".
 */
async function getFilesFromSharePoint(folder = 'Gedeelde documenten', driveId = SHAREPOINT_DRIVE_ID) {
  return listDriveItems(driveId, folder);
}

module.exports = { listDriveItems, getFilesFromSharePoint };
