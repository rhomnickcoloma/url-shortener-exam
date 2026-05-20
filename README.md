# URL Shortener — Backend Technical Exam

A 60-minute live coding exam for backend developer candidates. Candidates receive a buggy URL shortener API (TypeScript + Express + SQLite) and must find/fix bugs — first manually, then with AI assistance — all while sharing their screen.

## Exam Structure

| Phase   | Time        | Description                       |
| ------- | ----------- | --------------------------------- |
| Phase 1 | 0:00 – 0:05 | Review repo structure (no fixing) |
| Phase 2 | 0:06 – 0:20 | Manually fix bugs (no AI allowed) |
| Phase 3 | 0:21 – 0:50 | Use AI to fix remaining bugs      |
| Phase 4 | 0:50 – 1:00 | Discussion (no coding)            |

## Files

| File               | Audience  | Description                                          |
| ------------------ | --------- | ---------------------------------------------------- |
| [EXAM.md](EXAM.md) | Candidate | Exam instructions and API spec — share at exam start |
| [src/](src/)       | Candidate | The buggy TypeScript source code                     |

## Quick Start

```bash
cd src
npm install
npm run dev
```

Server runs on http://localhost:3000.

## Tech Stack

- **TypeScript** with `tsx` for dev mode
- **Express 5** for HTTP
- **better-sqlite3** for database

## What's in the Buggy Code

The source code has **intentional problems** spanning:

- **3 functional bugs** — crashes, missing validation, incomplete behavior
- **3 code quality issues** — strict mode off, no uniqueness constraint, no collision handling
- **1 security vulnerability** — SQL injection
- **3 adaptability issues** — incomplete rate limiter, inefficient admin query
