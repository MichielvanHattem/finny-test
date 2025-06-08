const express = require('express');
const getSharePointFiles = require('../utils/sp');

const router = express.Router();

router.get('/files', async (req, res) => {
  try {
    const files = await getSharePointFiles();
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
