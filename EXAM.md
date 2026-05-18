# Backend Technical Exam — URL Shortener API

**Duration:** 90 minutes (timed)
**Format:** Live screen-share, open-internet, AI tools allowed

---

## Overview

You are given a **URL shortener API** built with TypeScript, Express, and SQLite. It was written by a junior developer. It "kind of works" but has **multiple bugs, missing features, and code quality issues**.

Your job is to:

1. **Find and fix the bugs**
2. **Improve the code quality**
3. **Complete the missing features**

We are evaluating **how you solve problems**, not just the final result.

---

## Rules

1. **Share your screen** for the entire duration — including your browser, terminal, and editor.
2. **AI tools are allowed and encouraged** (Copilot, ChatGPT, Claude, etc.). We want to see how you use them.
3. **Ask clarifying questions** at any time — this is a conversation, not an exam in silence.
4. **Think out loud** — tell us what you're noticing and why you're making changes.
5. **You can refactor, restructure, or rewrite** anything you want. The code is yours now.

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

## Phase 1 — Bug Fixing & Improvement (40 minutes)

Explore the existing code. Run it. Test the endpoints. Find what's broken and fix it.

**Hints:**
- Try every endpoint — some crash, some return wrong data
- Read the code carefully — not all bugs are obvious at runtime
- Check error handling, status codes, and edge cases
- Look for security issues
- Check configuration files too

---

## Phase 2 — Extension (25 minutes)

*The interviewer will give you an additional requirement at the 40-minute mark.*

---

## Phase 3 — Discussion (25 minutes)

No more coding. We will walk through your solution together and discuss:

- What bugs you found and how you fixed them
- Your approach to debugging and prioritization
- How you used AI during the exam
- Scaling, security, and production-readiness considerations

---

## What We're Looking For

| Area | What "great" looks like |
|------|------------------------|
| **Bug finding** | Systematically discovers bugs through testing and code review |
| **Working fixes** | Fixes are correct, don't introduce new issues |
| **Code quality** | Improves structure, typing, and organization — not just patching |
| **AI usage** | Uses AI effectively — good prompts, validates output, modifies when needed |
| **Adaptability** | Handles Phase 2 requirement cleanly across the multi-file structure |
| **Communication** | Thinks out loud, explains decisions, asks good questions |

Good luck!
