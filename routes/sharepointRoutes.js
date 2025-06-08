const express = require('express');
const router = express.Router();
const { getSharePointFiles } = require('../utils/sp');

/* middleware – check login */
function requireAuth(req, res, next){
  if(!req.session.user){ return res.redirect('/auth/login'); }
  next();
}

/* Nette tabel-view van SharePoint-bestanden */
router.get('/files', requireAuth, async (req,res)=>{
  try{
    const items = await getSharePointFiles(req.session.user.accessToken);

    const rows = items.map(f=>`
      <tr>
        <td><a href="${f.webUrl}" target="_blank">${f.name}</a></td>
        <td>${(f.size/1024).toFixed(1)} KB</td>
        <td>${new Date(f.lastModifiedDateTime).toLocaleString()}</td>
      </tr>`).join('');

    res.send(`<!doctype html>
      <html lang="nl"><head><meta charset="utf-8"/>
        <title>Finny – Bestandsoverzicht</title>
        <style>
          body{font-family:Arial;margin:2rem;}
          table{border-collapse:collapse;width:100%;}
          th,td{padding:.5rem;border:1px solid #ccc;text-align:left;font-size:.95rem}
          th{background:#f2f2f2;}
          a{text-decoration:none;color:#0078d4}
        </style>
      </head><body>
        <h2>Bestanden in SharePoint-site</h2>
        <table>
          <thead><tr><th>Naam</th><th>Grootte</th><th>Laatst gewijzigd</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </body></html>`);
  }catch(err){
    console.error(err);
    res.status(500).send(err.message || 'Graph-fout');
  }
});

module.exports = router;
