import { db } from "../database/db";
import { generateCode } from "../utils/generateCode";
import { UrlRow } from "../types";

// Bug 1 fix: validate URL before inserting
export function createShortUrl(url: string) {
  if (!url) {
    throw new Error("URL is required");
  }

  try {
    new URL(url);
  } catch {
    throw new Error("Invalid URL");
  }

  // Bug 6 fix: retry on collision
  let code: string;
  let attempts = 0;
  while (true) {
    code = generateCode();
    const existing = db
      .prepare("SELECT id FROM urls WHERE short_code = ?")
      .get(code);
    if (!existing) break;
    attempts++;
    if (attempts > 10) throw new Error("Failed to generate unique short code");
  }

  const now = new Date().toISOString();

  db.prepare(
    "INSERT INTO urls (short_code, original_url, created_at) VALUES (?, ?, ?)"
  ).run(code, url, now);

  return {
    short_code: code,
    short_url: `http://localhost:${process.env.PORT || 3000}/${code}`,
    original_url: url,
    created_at: now,
  };
}

// Bug 7 fix: parameterized query instead of string concatenation
// Bug 2 fix: return null instead of crashing on missing code
export function getUrlStats(code: string): UrlRow | null {
  const row = db
    .prepare("SELECT * FROM urls WHERE short_code = ?")
    .get(code) as UrlRow | undefined;

  if (!row) return null;

  return {
    short_code: row.short_code,
    original_url: row.original_url,
    created_at: row.created_at,
    visit_count: row.visit_count,
    last_visited_at: row.last_visited_at,
  };
}

export function getUrlByCode(code: string): UrlRow | undefined {
  return db
    .prepare("SELECT * FROM urls WHERE short_code = ?")
    .get(code) as UrlRow | undefined;
}

// Bug 3 fix: also update last_visited_at
export function recordVisit(code: string): void {
  const now = new Date().toISOString();
  db.prepare(
    "UPDATE urls SET visit_count = visit_count + 1, last_visited_at = ? WHERE short_code = ?"
  ).run(now, code);
}

// Bug 10 fix: use SQL to filter, sort, and limit
export function getTopUrls(): UrlRow[] {
  return db
    .prepare(
      "SELECT * FROM urls WHERE visit_count > 0 ORDER BY visit_count DESC LIMIT 10"
    )
    .all() as UrlRow[];
}
