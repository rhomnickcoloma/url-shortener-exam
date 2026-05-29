import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { db } from '../database/db';
import { initDatabase } from '../database/db';
import fs from 'fs';
import path from 'path';

beforeEach(() => {
  db.exec('DROP TABLE IF EXISTS urls');
  initDatabase();
});

// ═════════════════════════════════════════════════════════════════════
//  POST /shorten
// ═════════════════════════════════════════════════════════════════════

describe('POST /shorten', () => {
  describe('URL Validation', () => {
    it('should reject requests with no body (missing url field) with 400', async () => {
      const res = await request(app).post('/shorten').send({});
      expect(
        res.status,
        'Missing URL should return 400 Bad Request, but the server accepted it. Add validation to reject requests without a url field.',
      ).toBe(400);
    });

    it("should reject invalid URLs (e.g. 'not-a-url') with 400", async () => {
      const res = await request(app)
        .post('/shorten')
        .send({ url: 'not-a-url' });
      expect(
        res.status,
        'Invalid URL should return 400 Bad Request, but the server accepted it. Add URL format validation (e.g. new URL() in a try/catch).',
      ).toBe(400);
    });
  });

  describe('UNIQUE constraint on short_code', () => {
    it('should prevent duplicate short_code values at the database level', () => {
      const now = new Date().toISOString();
      db.prepare(
        'INSERT INTO urls (short_code, original_url, created_at) VALUES (?, ?, ?)',
      ).run('dupcode', 'https://example.com/a', now);

      expect(() => {
        db.prepare(
          'INSERT INTO urls (short_code, original_url, created_at) VALUES (?, ?, ?)',
        ).run('dupcode', 'https://example.com/b', now);
      }, 'Inserting a duplicate short_code should throw a UNIQUE constraint error, but it succeeded. Add UNIQUE to the short_code column in your CREATE TABLE statement.').toThrow();
    });
  });

  describe('Collision handling for code generation', () => {
    it('should handle short_code collisions gracefully (UNIQUE constraint must exist)', () => {
      const tableSql = (
        db
          .prepare(
            "SELECT sql FROM sqlite_master WHERE type='table' AND name='urls'",
          )
          .get() as any
      )?.sql;

      expect(tableSql, 'Could not read the urls table schema.').toBeDefined();
      expect(
        tableSql.toUpperCase(),
        'The short_code column is missing a UNIQUE constraint. Without it, generateCode() can silently create duplicates. Add UNIQUE to the short_code column definition.',
      ).toContain('UNIQUE');
    });
  });

  describe('Rate Limiting', () => {
    it('should return 429 after exceeding 10 requests per minute', async () => {
      const statuses: number[] = [];
      for (let i = 0; i < 11; i++) {
        const res = await request(app)
          .post('/shorten')
          .send({ url: `https://example.com/rate-${i}` });
        statuses.push(res.status);
      }

      const got429 = statuses.includes(429);
      expect(
        got429,
        `Sent 11 POST /shorten requests but never received 429. Got statuses: [${statuses.join(', ')}]. The rate limiter middleware exists but is not applied to the route. Import rateLimitMiddleware in routes/index.ts and add it to the POST /shorten route.`,
      ).toBe(true);
    });

    it('should include retry_after_seconds in 429 response body', async () => {
      for (let i = 0; i < 10; i++) {
        await request(app)
          .post('/shorten')
          .send({ url: `https://example.com/rl-${i}` });
      }

      const res = await request(app)
        .post('/shorten')
        .send({ url: 'https://example.com/overflow' });

      if (res.status !== 429) {
        expect.fail(
          `Expected 429 after 11 requests, but got ${res.status}. Fix the rate limiter wiring first (import and apply rateLimitMiddleware to POST /shorten).`,
        );
      }

      expect(
        res.body.retry_after_seconds,
        '429 response is missing retry_after_seconds. The spec requires a numeric field telling the client how many seconds to wait. Calculate it from the oldest request timestamp in the rate limit window.',
      ).toBeDefined();
      expect(
        typeof res.body.retry_after_seconds,
        `retry_after_seconds should be a number, got ${typeof res.body.retry_after_seconds}.`,
      ).toBe('number');
      expect(
        res.body.retry_after_seconds,
        'retry_after_seconds should be greater than 0.',
      ).toBeGreaterThan(0);
      expect(
        res.body.error,
        `Error message should be "Rate limit exceeded. Try again later." but got "${res.body.error}".`,
      ).toBe('Rate limit exceeded. Try again later.');
    });
  });
});

// ═════════════════════════════════════════════════════════════════════
//  GET /:code (Redirect)
// ═════════════════════════════════════════════════════════════════════

describe('GET /:code (Redirect)', () => {
  it('should update last_visited_at after a redirect visit', async () => {
    const create = await request(app)
      .post('/shorten')
      .send({ url: 'https://example.com/visit-tracking' });
    const code = create.body.short_code;

    await request(app).get(`/${code}`).redirects(0);

    const stats = await request(app).get(`/stats/${code}`);
    expect(
      stats.body.last_visited_at,
      'last_visited_at is still null after visiting the URL. The recordVisit() function increments visit_count but does not set last_visited_at. Update the SQL query to also set last_visited_at to the current timestamp.',
    ).not.toBeNull();
    expect(
      typeof stats.body.last_visited_at,
      'last_visited_at should be a string (ISO timestamp).',
    ).toBe('string');
  });
});

// ═════════════════════════════════════════════════════════════════════
//  GET /stats/:code
// ═════════════════════════════════════════════════════════════════════

describe('GET /stats/:code', () => {
  it('should return 404 for a non-existent code (not crash with 500)', async () => {
    const res = await request(app).get('/stats/doesnotexist');
    expect(
      res.status,
      `Expected 404 for a missing code, but got ${res.status}. If the server returned 500, it means getUrlStats() crashed because it tried to access properties on an undefined row. Check if the query result exists before accessing its fields, and return 404 from the handler when the code is not found.`,
    ).toBe(404);
  });

  it('should not be vulnerable to SQL injection', async () => {
    await request(app)
      .post('/shorten')
      .send({ url: 'https://example.com/secret' });

    const res = await request(app).get("/stats/' OR '1'='1");
    expect(
      res.status,
      `SQL injection payload returned ${res.status} with data instead of 404. The getUrlStats() function uses string concatenation to build the SQL query, making it vulnerable. Use a parameterized query instead: db.prepare("SELECT * FROM urls WHERE short_code = ?").get(code)`,
    ).toBe(404);
  });
});

// ═════════════════════════════════════════════════════════════════════
//  GET /admin/top
// ═════════════════════════════════════════════════════════════════════

describe('GET /admin/top', () => {
  it('should NOT include URLs with zero visits', async () => {
    await request(app)
      .post('/shorten')
      .send({ url: 'https://example.com/never-visited' });

    const res = await request(app).get('/admin/top');
    expect(res.status).toBe(200);
    expect(
      res.body.top_urls.length,
      `Expected 0 results (only unvisited URLs exist), but got ${res.body.top_urls.length}. The query should filter out URLs with visit_count = 0. Use: WHERE visit_count > 0`,
    ).toBe(0);
  });
});

// ═════════════════════════════════════════════════════════════════════
//  Global / Config
// ═════════════════════════════════════════════════════════════════════

describe('TypeScript Configuration', () => {
  it('should have strict mode enabled in tsconfig.json', () => {
    const tsconfigPath = path.resolve(__dirname, '..', 'tsconfig.json');
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
    expect(
      tsconfig.compilerOptions.strict,
      'tsconfig.json has "strict": false (or missing). Strict mode enables critical type safety checks like strictNullChecks, noImplicitAny, etc. Set "strict": true in compilerOptions.',
    ).toBe(true);
  });
});
