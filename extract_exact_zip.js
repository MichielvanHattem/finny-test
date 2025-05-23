// --- TT-filter zonder recursion ---
const origStderrWrite = process.stderr.write.bind(process.stderr);
process.stderr.write = (chunk, enc, cb) => {
  if (chunk && chunk.toString().startsWith('Warning: TT:')) return true; // slik weg
  return origStderrWrite(chunk, enc, cb);   // roep originele write aan
};


// -----------------------------------------------
//  Dependencies & instellingen
// -----------------------------------------------
const fs   = require('fs');
const path = require('path');
const { parseFile } = require('./parser');

// Pas onderstaande twee regels aan jouw situatie:
const DATA_DIRECTORY = 'C:/Users/michi/OneDrive/FinnyDataWP-userId'; // precies zoals map heet
const USER_ID       = 'mcgvanhattem_rm6ui0sw';                      // WP-login exact


// -----------------------------------------------
//  Extract & parse alle bestanden
// -----------------------------------------------
(async () => {
  try {
    const files       = fs.readdirSync(DATA_DIRECTORY, { withFileTypes: true });
    const parsedData  = {};
    const SUPPORTED   = ['.zip', '.csv', '.xlsx', '.xls', '.pdf'];

    for (const file of files) {
      if (!file.isFile()) continue;
      const ext = path.extname(file.name).toLowerCase();
      if (!SUPPORTED.includes(ext)) continue;

      console.log('Parsing:', file.name);
      const fullPath = path.join(DATA_DIRECTORY, file.name);
      const parsed   = await parseFile(fullPath);

      // alleen niet-lege resultaten toevoegen
      if (parsed && (Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length))
        parsedData[file.name] = parsed;
    }

    const outDir = path.join(__dirname, 'parsed');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

    const outPath = path.join(outDir, `user_${USER_ID}.json`);
    fs.writeFileSync(outPath, JSON.stringify(parsedData, null, 2));

    console.log('Parsed data written to', outPath);
    console.log('All done ✅');
  } catch (err) {
    console.error('❌ Extract error:', err);
  }
})();
