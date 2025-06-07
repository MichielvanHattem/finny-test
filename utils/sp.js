/**
 * utils/sp.js – Graph-helpers (client-credential flow)
 */

const { Client } = require('@microsoft/microsoft-graph-client');
const { ClientSecretCredential } = require('@azure/identity');
require('isomorphic-fetch');

/* ───── 0. ENV ───── */
const {
  AZURE_TENANT_ID,
  AZURE_CLIENT_ID,
  AZURE_CLIENT_SECRET,
  SHAREPOINT_DRIVE_ID,      // b!IrRe6P6…  ← drive-ID van FinnyTest
} = process.env;

/* ───── 1. GRAPH CLIENT ───── */
const credential   = new ClientSecretCredential(
  AZURE_TENANT_ID,
  AZURE_CLIENT_ID,
  AZURE_CLIENT_SECRET,
);

const authProvider = {
  getAccessToken: async () =>
    (await credential.getToken('https://graph.microsoft.com/.default')).token,
};

const graph = Client.initWithMiddleware({ authProvider });

/* ───── 2. LIST ITEMS ───── */
async function listDriveItems(driveId = SHAREPOINT_DRIVE_ID, folderPath = '') {
  const encoded  = encodeURIComponent(folderPath);
  const endpoint = folderPath
    ? `/drives/${driveId}/root:/${encoded}:/children`
    : `/drives/${driveId}/root/children`;

  const res = await graph.api(endpoint)
    .select('id,name,lastModifiedDateTime,webUrl,size')
    .top(999)
    .get();

  return res.value || [];
}

/* ───── 3. DOWNLOAD FILE (nieuw) ───── */
async function downloadFile(folder = 'Gedeelde documenten', name, driveId = SHAREPOINT_DRIVE_ID) {
  // 3a. lookup item-id (Graph heeft geen direct path-download endpoint)
  const encoded = encodeURIComponent(`${folder}/${name}`);
  const item = await graph.api(`/drives/${driveId}/root:/${encoded}`).get();

  // 3b. download binary content
  return graph
    .api(`/drives/${driveId}/items/${item.id}/content`)
    .get();                        // geeft Buffer terug
}

/* ───── 4. ALIASES ───── */
async function getFilesFromSharePoint(
  folder = 'Gedeelde documenten',
  driveId = SHAREPOINT_DRIVE_ID,
) {
  return listDriveItems(driveId, folder);
}

module.exports = {
  listDriveItems,
  getFilesFromSharePoint,
  downloadFile,                    // ← export nieuw
};
