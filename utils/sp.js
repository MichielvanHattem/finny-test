const { Client } = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

module.exports = async function getSharePointFiles() {
  const client = Client.init({
    authProvider: done => done(null, process.env.GRAPH_API_TOKEN)
  });

  try {
    const res = await client
      .api(process.env.GRAPH_API_URL)
      .get();
    return res.value;
  } catch (err) {
    console.error('Graph API error:', err);
    throw err;
  }
};
