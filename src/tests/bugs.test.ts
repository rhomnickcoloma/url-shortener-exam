import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../app";
import { db } from "../database/db";
import fs from "fs";
import path from "path";

beforeEach(() => {
  db.exec("DELETE FROM urls");
});

// ─── Health Check ────────────────────────────────────────────────────

describe("Health Check", () => {
  it("GET /health should return 200 with status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

// ─── Working Solution ────────────────────────────────────────────────

describe("Bug 1 — POST /shorten has no URL validation", () => {
  it("should return 400 when url is missing", async () => {
    const res = await request(app).post("/shorten").send({});
    expect(res.status).toBe(400);
  });

  it("should return 400 when url is not a valid URL", async () => {
    const res = await request(app).post("/shorten").send({ url: "not-a-url" });
    expect(res.status).toBe(400);
  });

  it("should return 201 when url is valid", async () => {
    const res = await request(app)
      .post("/shorten")
      .send({ url: "https://example.com" });
    expect(res.status).toBe(201);
  });
});

describe("Bug 2 — GET /stats/:code crashes on missing code", () => {
  it("should return 404 for a non-existent code (not 500)", async () => {
    const res = await request(app).get("/stats/nonexistent");
    expect(res.status).toBe(404);
  });
});

describe("Bug 3 — GET /:code redirect does not update last_visited_at", () => {
  it("should set last_visited_at after a visit", async () => {
    const create = await request(app)
      .post("/shorten")
      .send({ url: "https://example.com" });
    const code = create.body.short_code;

    await request(app).get(`/${code}`);

    const stats = await request(app).get(`/stats/${code}`);
    expect(stats.body.last_visited_at).not.toBeNull();
    expect(typeof stats.body.last_visited_at).toBe("string");
  });
});

// ─── Code Quality ────────────────────────────────────────────────────

describe("Bug 4 — TypeScript strict mode is disabled", () => {
  it("should have strict: true in tsconfig.json", () => {
    const tsconfigPath = path.resolve(__dirname, "..", "tsconfig.json");
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf-8"));
    expect(tsconfig.compilerOptions.strict).toBe(true);
  });
});

describe("Bug 5 — No UNIQUE constraint on short_code", () => {
  it("should enforce uniqueness on short_code at the database level", () => {
    const now = new Date().toISOString();
    db.prepare(
      "INSERT INTO urls (short_code, original_url, created_at) VALUES (?, ?, ?)"
    ).run("testcode", "https://example.com", now);

    expect(() => {
      db.prepare(
        "INSERT INTO urls (short_code, original_url, created_at) VALUES (?, ?, ?)"
      ).run("testcode", "https://other.com", now);
    }).toThrow();
  });
});

describe("Bug 6 — No collision handling for code generation", () => {
  it("should not insert a duplicate short_code (retry or fail gracefully)", () => {
    const tableSql = (
      db
        .prepare(
          "SELECT sql FROM sqlite_master WHERE type='table' AND name='urls'"
        )
        .get() as any
    )?.sql;

    expect(tableSql).toBeDefined();
    expect(tableSql.toUpperCase()).toContain("UNIQUE");
  });
});

// ─── Security ────────────────────────────────────────────────────────

describe("Bug 7 — SQL injection in GET /stats/:code", () => {
  it("should not return data via SQL injection payload", async () => {
    await request(app)
      .post("/shorten")
      .send({ url: "https://example.com/secret" });

    const res = await request(app).get("/stats/' OR '1'='1");

    expect(res.status).toBe(404);
  });
});

// ─── Adaptability ────────────────────────────────────────────────────

describe("Bug 8 — Rate limiter middleware is not wired up", () => {
  it("should return 429 after 10 rapid requests to POST /shorten", async () => {
    const responses = [];
    for (let i = 0; i < 11; i++) {
      const res = await request(app)
        .post("/shorten")
        .send({ url: `https://example.com/rate-${i}` });
      responses.push(res.status);
    }

    const got429 = responses.filter((s) => s === 429).length;
    expect(got429).toBeGreaterThanOrEqual(1);
  });
});

describe("Bug 9 — Rate limiter missing retry_after_seconds", () => {
  it("should include retry_after_seconds in 429 response", async () => {
    for (let i = 0; i < 10; i++) {
      await request(app)
        .post("/shorten")
        .send({ url: `https://example.com/rl-${i}` });
    }

    const res = await request(app)
      .post("/shorten")
      .send({ url: "https://example.com/overflow" });

    if (res.status !== 429) {
      expect.fail(
        "Rate limiter is not active (Bug 8 must be fixed first). Got status " +
          res.status
      );
    }

    expect(res.body).toHaveProperty("retry_after_seconds");
    expect(typeof res.body.retry_after_seconds).toBe("number");
    expect(res.body.retry_after_seconds).toBeGreaterThan(0);
    expect(res.body.error).toBe("Rate limit exceeded. Try again later.");
  });
});

describe("Bug 10 — /admin/top fetches all rows and includes 0-visit URLs", () => {
  it("should not include URLs with zero visits", async () => {
    await request(app)
      .post("/shorten")
      .send({ url: "https://example.com/never-visited" });

    const res = await request(app).get("/admin/top");
    expect(res.status).toBe(200);
    expect(res.body.top_urls).toHaveLength(0);
  });

  it("should return results sorted by visit_count desc, limited to 10", async () => {
    const codes: string[] = [];
    for (let i = 0; i < 12; i++) {
      const create = await request(app)
        .post("/shorten")
        .send({ url: `https://example.com/page-${i}` });
      codes.push(create.body.short_code);
    }

    for (let i = 0; i < codes.length; i++) {
      const visits = i + 1;
      for (let v = 0; v < visits; v++) {
        db.prepare(
          "UPDATE urls SET visit_count = visit_count + 1 WHERE short_code = ?"
        ).run(codes[i]);
      }
    }

    const res = await request(app).get("/admin/top");
    const urls = res.body.top_urls;

    expect(urls.length).toBeLessThanOrEqual(10);

    for (let i = 1; i < urls.length; i++) {
      expect(urls[i - 1].visit_count).toBeGreaterThanOrEqual(
        urls[i].visit_count
      );
    }
  });
});
