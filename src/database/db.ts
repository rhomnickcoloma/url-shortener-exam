import Database from "better-sqlite3";

const db = new Database("urls.db");

export function initDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS urls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      short_code TEXT,
      original_url TEXT,
      created_at TEXT,
      visit_count INTEGER DEFAULT 0,
      last_visited_at TEXT
    )
  `);
}

export { db };
