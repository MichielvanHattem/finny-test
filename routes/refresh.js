// routes/refresh.js   (nieuw)
const express = require('express');
const router = express.Router();

router.get('/', async (_, res) => {
  try {
    const files = await getFilesFromSharePoint('Gedeelde documenten', 'default');
    // hier alleen loggen – je lokale ingest kan later nog embeddings maken
    console.log(`📥 SharePoint: ${files.length} bestanden opgehaald`);
    return res.json({ status: 'ok', files: files.length });
  } catch (err) {
    console.error('SP-error', err.message);
    return res.status(500).json({ error: err.message });
  }
});
module.exports = router;
