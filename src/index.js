const express = require("express");
const Database = require("better-sqlite3");

const app = express();
const PORT = 3000;
const db = new Database("urls.db");

app.use(express.json());

// Create table
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

// Generate short code
function generateCode() {
  let result = "";
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// POST /shorten
app.post("/shorten", (req, res) => {
  const url = req.body.url;

  const code = generateCode();

  const now = new Date().toISOString();
  db.prepare("INSERT INTO urls (short_code, original_url, created_at) VALUES (?, ?, ?)").run(code, url, now);

  res.status(201).json({
    short_code: code,
    short_url: "http://localhost:" + PORT + "/" + code,
    original_url: url,
    created_at: now,
  });
});

// GET /stats/:code
app.get("/stats/:code", (req, res) => {
  const code = req.params.code;
  const row = db.prepare("SELECT * FROM urls WHERE short_code = '" + code + "'").get();

  res.json({
    short_code: row.short_code,
    original_url: row.original_url,
    created_at: row.created_at,
    visit_count: row.visit_count,
    last_visited_at: row.last_visited_at,
  });
});

// GET /:code - redirect
app.get("/:code", (req, res) => {
  const code = req.params.code;
  const row = db.prepare("SELECT * FROM urls WHERE short_code = ?").get(code);

  if (!row) {
    return res.status(404).json({ error: "Not found" });
  }

  db.prepare("UPDATE urls SET visit_count = visit_count + 1 WHERE short_code = ?").run(code);

  res.redirect(row.original_url);
});

// Rate limiter storage
const rateLimits = {};

// POST /shorten rate limit check (middleware) -- NOT WIRED UP
function rateLimitMiddleware(req, res, next) {
  const ip = req.ip;
  const now = Date.now();

  if (!rateLimits[ip]) {
    rateLimits[ip] = [];
  }

  rateLimits[ip] = rateLimits[ip].filter((t) => now - t < 60000);

  if (rateLimits[ip].length >= 10) {
    return res.status(429).json({ error: "Rate limit exceeded" });
  }

  rateLimits[ip].push(now);
  next();
}

// GET /admin/top
app.get("/admin/top", (req, res) => {
  const rows = db.prepare("SELECT * FROM urls").all();

  rows.sort((a, b) => b.visit_count - a.visit_count);

  const top = rows.slice(0, 10);

  res.json({ top_urls: top });
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
