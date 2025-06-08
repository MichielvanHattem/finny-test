const express = require('express');
const router = express.Router();
const { Client } = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

router.get('/', async (req, res) => {
  const client = Client.init({
    authProvider: (done) => {
      done(null, req.headers.authorization.split(' ')[1]);
    }
  });

  try {
    const files = await client
      .api(`/sites/${process.env.SHAREPOINT_SITE_ID}/drive/root:/FinnyTest:/children`)
      .get();

    res.json(files);
  } catch (error) {
    res.status(500).json({error: "Kan bestanden niet ophalen", details: error.message});
  }
});

module.exports = router;
