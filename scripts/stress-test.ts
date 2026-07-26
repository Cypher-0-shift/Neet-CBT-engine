import Database from 'better-sqlite3';
import path from 'path';

console.log('Starting SQLite stress test...');
const dbPath = path.join(__dirname, '..', '..', 'stress-test.db');
const db = new Database(dbPath);

// Setup Pragmas
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('busy_timeout = 5000');

// Setup Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS stress_test (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log('Inserting 10,000 records in a single transaction...');

const insertStmt = db.prepare('INSERT INTO stress_test (data) VALUES (?)');

const startTime = Date.now();

const insertMany = db.transaction((count: number) => {
  for (let i = 0; i < count; i++) {
    insertStmt.run(`Data payload ${i} - ${Math.random().toString(36).substring(7)}`);
  }
});

insertMany(10000);

const endTime = Date.now();
console.log(`Inserted 10,000 records in ${endTime - startTime}ms`);

console.log('Running PRAGMA optimize...');
db.pragma('optimize');

db.close();
console.log('Stress test complete.');
