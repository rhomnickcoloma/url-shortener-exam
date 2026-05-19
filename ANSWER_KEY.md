# Answer Key — Planted Bugs & Issues

**For interviewers only. Do NOT share with candidates.**

The source code is a "working" URL shortener with **10 intentional problems** across all scoring categories. Candidates are expected to find and fix as many as they can, then extend the app.

---

## Project Structure

```
src/
├── index.ts                  # App entry point
├── database/
│   └── db.ts                 # Database setup & connection
├── handlers/
│   └── urlHandlers.ts        # Express route handlers
├── middleware/
│   └── rateLimiter.ts        # Rate limiting middleware
├── routes/
│   └── index.ts              # Route registration
├── services/
│   └── urlService.ts         # Business logic
└── utils/
    └── generateCode.ts       # Short code generation
```

---

## Bug Map by Scoring Category

### Working Solution (Bugs 1–3)

These are things that are **functionally broken** — endpoints that crash, return wrong data, or produce incorrect behavior.

---

#### Bug 1 — `POST /shorten` has no URL validation

**Location:** `services/urlService.ts` → `createShortUrl()`
**Problem:** No check for missing or invalid URLs. Sending `{}` or `{ "url": "not-a-url" }` succeeds and inserts garbage into the database.
**Fix:** Add validation — check that `url` exists and is a valid URL (e.g., using `new URL()` in a try/catch). Return `400 Bad Request` with an error message. The validation can go in the handler or the service layer.
**Difficulty:** Easy-Medium

---

#### Bug 2 — `GET /stats/:code` crashes on missing code (no 404 handling)

**Location:** `services/urlService.ts` → `getUrlStats()`
**Problem:** If the short code doesn't exist, `row` is `undefined`. Accessing `row.short_code` throws `TypeError: Cannot read properties of undefined`. The server returns a 500 instead of a 404.
**Fix:** Check if `row` exists before accessing its properties. Return `null`/`undefined` from the service and handle the 404 in the handler.
**Difficulty:** Easy

---

#### Bug 3 — `GET /:code` redirect does not update `last_visited_at`

**Location:** `services/urlService.ts` → `recordVisit()`
**Problem:** The UPDATE query increments `visit_count` but never sets `last_visited_at`. The stats endpoint will always show `null` for this field.
**Fix:** Update the SQL to also set `last_visited_at`:
```sql
UPDATE urls SET visit_count = visit_count + 1, last_visited_at = ? WHERE short_code = ?
```
**Difficulty:** Easy

---

### Code Quality (Bugs 4–6)

These are **structural and design problems** — not necessarily crashes, but signs of poor engineering.

---

#### Bug 4 — TypeScript `strict` mode is disabled and types are not shared

**Location:** `tsconfig.json` and `services/urlService.ts`
**Problem:** `tsconfig.json` has `"strict": false`, which disables TypeScript's most valuable safety features (strict null checks, no implicit any, etc.). This means the compiler won't catch bugs like accessing properties on `undefined` (Bug 2). Additionally, the `UrlRow` interface is defined privately inside `urlService.ts` and not exported or shared — there's no `types/` module for shared type definitions. The handlers have no type contract for what the services return.
**Fix:** Set `"strict": true` in `tsconfig.json`. Create a shared `types/` module and export `UrlRow` (and any other interfaces). Fix the resulting type errors — which will naturally surface Bug 2.
**Difficulty:** Medium
**Note:** Don't penalize if they acknowledge it in discussion but prioritize fixing runtime bugs first. Do penalize if they don't notice `strict: false` at all.

---

#### Bug 5 — No unique constraint on `short_code` column

**Location:** `database/db.ts` → `initDatabase()`
**Problem:** The `short_code` column has no `UNIQUE` constraint. If `generateCode()` produces a duplicate (unlikely but possible), both would be inserted and queries would return only the first match — silently corrupting data.
**Fix:** Add `UNIQUE` to the column definition: `short_code TEXT UNIQUE`.
**Difficulty:** Medium

---

#### Bug 6 — Short code generation has no collision handling

**Location:** `utils/generateCode.ts`
**Problem:** `generateCode()` creates a random 6-char string but never checks if it already exists. Combined with Bug 5 (no UNIQUE constraint), duplicates would silently corrupt data. Even with a UNIQUE constraint, the insert would throw an unhandled error.
**Fix:** Either check for existence before inserting (retry loop), or rely on a UNIQUE constraint and catch the constraint violation error to retry.
**Difficulty:** Medium

---

### Security (Bug 7)

---

#### Bug 7 — SQL injection in `GET /stats/:code`

**Location:** `services/urlService.ts` → `getUrlStats()`
**Problem:** The query uses string concatenation instead of parameterized queries:
```ts
"SELECT * FROM urls WHERE short_code = '" + code + "'"
```
This is vulnerable to SQL injection. A request like `GET /stats/' OR '1'='1` would return data it shouldn't. Worse payloads could drop tables or extract data.
**Fix:** Use a parameterized query: `db.prepare("SELECT * FROM urls WHERE short_code = ?").get(code)` — the same pattern already used in `getUrlByCode()` right below it.
**Difficulty:** Easy (but critical to catch)

---

### Adaptability (Bugs 8–10)

These are **incomplete or broken features** that test whether the candidate can debug and extend existing code.

---

#### Bug 8 — Rate limiter middleware exists but is NOT wired up

**Location:** `middleware/rateLimiter.ts` exists, but `routes/index.ts` doesn't import or use it
**Problem:** The `rateLimitMiddleware` function is defined in its own file but never imported or applied to any route.
**Fix:** Import it in `routes/index.ts` and apply it to `POST /shorten`:
```ts
app.post("/shorten", rateLimitMiddleware, shortenHandler);
```
**Difficulty:** Easy

---

#### Bug 9 — Rate limiter response is missing `retry_after_seconds`

**Location:** `middleware/rateLimiter.ts`
**Problem:** The spec requires a `retry_after_seconds` field in the 429 response, but the middleware only returns `{ error: "Rate limit exceeded" }`. The error message also doesn't match the spec.
**Fix:** Calculate the time until the oldest request in the window expires and include it:
```ts
const oldestRequest = rateLimits[ip][0];
const retryAfter = Math.ceil((60000 - (now - oldestRequest)) / 1000);
res.status(429).json({
  error: "Rate limit exceeded. Try again later.",
  retry_after_seconds: retryAfter,
});
```
**Difficulty:** Medium

---

#### Bug 10 — `/admin/top` fetches ALL rows then sorts in JS

**Location:** `services/urlService.ts` → `getTopUrls()`
**Problem:** The query does `SELECT * FROM urls` and then sorts/slices in JavaScript. This is wasteful and won't scale — the database should do the sorting and limiting. Also, it returns URLs with 0 visits (the spec says "only include URLs that have been visited at least once").
**Fix:** Use a proper SQL query:
```sql
SELECT * FROM urls WHERE visit_count > 0 ORDER BY visit_count DESC LIMIT 10
```
**Difficulty:** Easy-Medium

---

## Summary Table

| # | Bug | Location | Category | Difficulty | Severity |
|---|-----|----------|----------|-----------|----------|
| 1 | No URL validation | `services/urlService.ts` | Working Solution | Easy-Medium | High |
| 2 | Stats crashes on missing code | `services/urlService.ts` | Working Solution | Easy | High |
| 3 | Redirect doesn't update last_visited_at | `services/urlService.ts` | Working Solution | Easy | Medium |
| 4 | `strict: false` + types not shared | `tsconfig.json`, `services/urlService.ts` | Code Quality | Medium | Medium |
| 5 | No UNIQUE constraint on short_code | `database/db.ts` | Code Quality | Medium | Medium |
| 6 | No collision handling for code gen | `utils/generateCode.ts` | Code Quality | Medium | Medium |
| 7 | SQL injection in stats endpoint | `services/urlService.ts` | Security | Easy | **Critical** |
| 8 | Rate limiter not wired up | `routes/index.ts` | Adaptability | Easy | High |
| 9 | Rate limiter missing retry_after_seconds | `middleware/rateLimiter.ts` | Adaptability | Medium | Medium |
| 10 | Admin endpoint: fetches all rows, sorts in JS | `services/urlService.ts` | Adaptability | Easy-Medium | Medium |

---

## Distribution

| Category | Count | Bug #s |
|----------|-------|--------|
| Working Solution | 3 | 1, 2, 3 |
| Code Quality | 3 | 4, 5, 6 |
| Security | 1 | 7 |
| Adaptability | 3 | 8, 9, 10 |
| **Total** | **10** | |

---

## Scoring Guidance by Bug Count

| Bugs Fixed | Typical Score Range | Notes |
|-----------|-------------------|-------|
| 1–2 | Below 3.0 | Struggled to identify issues |
| 3–5 | 3.0–3.5 | Found the obvious ones |
| 6–7 | 3.5–4.0 | Solid — caught most issues including some subtle ones |
| 8–10 | 4.0+ | Excellent — thorough, caught even the edge cases |

**Important:** Bug count alone doesn't determine the score. *How* they find and fix bugs matters just as much — a candidate who finds 5 bugs but explains their process beautifully and uses AI effectively may score higher than one who finds 8 but can't explain anything.

---

## Bonus Points (not expected, but impressive)

- Adds automated tests
- Adds input sanitization beyond URL validation (e.g., max URL length)
- Notices rate limiter has no cleanup for stale IPs (memory leak over time)
- Adds graceful shutdown / database cleanup
- Creates a shared `types/` module with exported interfaces
- Adds a URL expiration feature
- Discusses or implements idempotent shortening (same URL returns same code)
- Adds error handling middleware for unhandled exceptions
