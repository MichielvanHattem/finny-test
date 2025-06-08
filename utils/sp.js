const { Client } = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

async function getSharePointFiles(token) {
  const graphClient = Client.init({
    authProvider: (done) => {
      done(null, token);
    }
  });

  try {
    const result = await graphClient
      .api('/me/drive/root:/FinnyTest:/children')
      .select('id,name,lastModifiedDateTime,webUrl,size')
      .get();

    return result.value;
  } catch (error) {
    console.error("Graph API-fout:", error);
    throw error;
  }
}

module.exports = { getSharePointFiles };
