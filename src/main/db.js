import sqlite3 from 'sqlite3';

let sqlite = sqlite3.verbose()
const db = new sqlite.Database('./db.sqlite3');

export const createTable = (name, entries) => {
  const fields = Object.keys(entries[0]);
  const values = entries.map((entry) => Object.values(entry));
  const setPrimaryKey = `id INTEGER PRIMARY KEY AUTOINCREMENT`
  const query = fields.map((field) => `${field} TEXT`).join(', ');
  const questionMarks = fields.map(() => '?').join(', ');

  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS ${name} (${setPrimaryKey}, ${query})`, [], (err) => {
      if (err) console.log(err);
    });

    values.forEach(valuesRow => {
      db.run(`INSERT INTO ${name} VALUES (NULL, ${questionMarks})`, valuesRow, (e) => { if (e) console.log(e) });
    });
  });
}

export default db;