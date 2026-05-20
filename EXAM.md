# Backend Technical Exam — URL Shortener API

**Duration:** 60 minutes (timed)
**Format:** Live screen-share, open-internet, AI tools allowed in Phase 3

---

## Overview

You are given a **URL shortener API** built with TypeScript, Express, and SQLite. It was written by a junior developer. It "kind of works" but has **multiple bugs, missing features, and code quality issues**.

Your job is to find and fix the bugs — first on your own, then with AI assistance.

We are evaluating **how you solve problems**, not just the final result.

---

## Rules

1. **Share your screen** for the entire duration — including your browser, terminal, and editor.
2. **AI tools are NOT allowed in Phase 2** — we want to see your own debugging skills first.
3. **AI tools ARE allowed and encouraged in Phase 3** — we want to see how you use them.
4. **Ask clarifying questions** at any time — this is a conversation, not an exam in silence.
5. **Think out loud** — tell us what you're noticing and why you're making changes.
6. **You can refactor, restructure, or rewrite** anything you want. The code is yours now.

---

## Getting Started

```bash
cd src
npm install
npm run dev
```

The server runs on `http://localhost:3000`. Test with curl, Postman, or any HTTP client.

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

## The API Spec

The URL shortener should implement these endpoints:

### `POST /shorten`

Create a shortened URL.

**Request body:**

```json
{
  "url": "https://www.example.com/some/very/long/path?with=params"
}
```

**Response (201 Created):**

```json
{
  "short_code": "abc123",
  "short_url": "http://localhost:3000/abc123",
  "original_url": "https://www.example.com/some/very/long/path?with=params",
  "created_at": "2026-05-17T13:00:00Z"
}
```

**Requirements:**
- `short_code` must be unique (6–8 alphanumeric characters)
- Reject invalid or missing URLs with `400 Bad Request`
- Store the mapping in a database

### `GET /:code`

Redirect to the original URL.

- Return `302 Found` with a redirect to the original URL
- Return `404 Not Found` if the code does not exist
- **Track the visit** — increment a counter AND record the timestamp

### `GET /stats/:code`

Return usage statistics for a short URL.

**Response (200 OK):**

```json
{
  "short_code": "abc123",
  "original_url": "https://www.example.com/some/very/long/path?with=params",
  "created_at": "2026-05-17T13:00:00Z",
  "visit_count": 42,
  "last_visited_at": "2026-05-17T14:30:00Z"
}
```

- Return `404 Not Found` if the code does not exist

### `POST /shorten` — Rate Limiting

- **Maximum 10 requests per IP address per minute**
- Return `429 Too Many Requests` when the limit is exceeded:

```json
{
  "error": "Rate limit exceeded. Try again later.",
  "retry_after_seconds": 42
}
```

### `GET /admin/top`

Return the **top 10 most-visited** shortened URLs.

**Response (200 OK):**

```json
{
  "top_urls": [
    {
      "short_code": "abc123",
      "original_url": "https://example.com/popular-page",
      "visit_count": 1523,
      "last_visited_at": "2026-05-17T14:30:00Z"
    }
  ]
}
```

- Sorted by `visit_count` descending
- Only include URLs that have been visited at least once

---

## Phase 1 — Review Repo Structure (0:00 – 0:05)

Take 5 minutes to explore the codebase. Read through the files, understand the project structure, and get familiar with the code.

- Run `npm install` and `npm run dev`
- Look at the folder structure and understand how the layers connect
- Read the API spec above

**No fixing yet** — just get oriented.

---

## Phase 2 — Manually Fix Bugs (0:06 – 0:20)

**No AI tools allowed in this phase.** Fix as many bugs as you can using only your own knowledge.

- Test the endpoints — some crash, some return wrong data
- Read the code carefully — not all bugs are obvious at runtime
- Check error handling, status codes, and edge cases
- Look for security issues
- Check configuration files too

---

## Phase 3 — Use AI to Fix Bugs (0:21 – 0:50)

**AI tools are now allowed.** Use ChatGPT, Copilot, Claude, or any other AI tool to continue finding and fixing bugs.

- Continue fixing any remaining issues
- Improve code quality
- Complete any missing features
- You can also revisit and improve fixes from Phase 2

---

## Phase 4 — Discussion (0:50 – 1:00)

No more coding. We will walk through your solution together and discuss:

- What bugs you found and how you fixed them
- The difference between what you caught manually vs. with AI
- How you used AI — what you prompted, what you changed
- Scaling, security, and production-readiness considerations

Good luck!
