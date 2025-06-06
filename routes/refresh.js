// routes/refresh.js – haalt on‑the‑fly bestanden op uit de gekoppelde SharePoint‑drive
// LET OP: dit bestand zit in de map /routes, dus import één stap omhoog via "../utils/sp"

const express = require('express');
const router  = express.Router();

// 👉 helper uit utils/sp.js
const { getFilesFromSharePoint } = require('../utils/sp');

/**
 * GET /refresh
 * Haalt alle bestanden op uit de map "Gedeelde documenten" van de drive
 * en logt hoeveel er gevonden zijn. Later kun je hier vector‑ingest toevoegen.
 */
router.get('/', async (_req, res) => {
  try {
    const files = await getFilesFromSharePoint('Gedeelde documenten', 'default');
    console.log(`📥 SharePoint: ${files.length} bestanden opgehaald`);
    return res.json({ status: 'ok', files: files.length });
  } catch (err) {
    console.error('SP‑error', err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

