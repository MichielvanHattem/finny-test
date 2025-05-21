const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('finny.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS figures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    year INTEGER,
    label TEXT,
    amount REAL,
    UNIQUE(user_id, year, label)
  )`);
});

module.exports = {
  insertFigure: (userId, year, label, amount) => {
    const stmt = db.prepare('INSERT OR REPLACE INTO figures (user_id, year, label, amount) VALUES (?, ?, ?, ?)');
    stmt.run(userId, year, label, amount);
    stmt.finalize();
  },
  getFigures: (userId) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT year, label, amount FROM figures WHERE user_id = ?', [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};
