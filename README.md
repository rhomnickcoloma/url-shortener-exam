# URL Shortener — Backend Technical Exam

A 90-minute live coding exam for backend developer candidates. Candidates receive a buggy URL shortener API (TypeScript + Express + SQLite) and must find/fix bugs, improve code quality, and extend with a new feature — all while sharing their screen. AI tools are allowed and encouraged.

## Exam Structure

| Phase | Duration | Description |
|-------|----------|-------------|
| Phase 1 | 40 min | Find and fix bugs in the existing codebase |
| Phase 2 | 25 min | Build a new feature (DELETE endpoint — revealed at 40 min) |
| Phase 3 | 25 min | Code review & discussion (no coding) |

## Files

| File | Audience | Description |
|------|----------|-------------|
| [EXAM.md](EXAM.md) | Candidate | Exam instructions and API spec — share at exam start |
| [src/](src/) | Candidate | The buggy TypeScript source code |
| [INTERVIEWER_GUIDE.md](INTERVIEWER_GUIDE.md) | Interviewer only | Rubric, scoring, discussion questions, tips |
| [ANSWER_KEY.md](ANSWER_KEY.md) | Interviewer only | All 10 planted bugs with explanations and fixes |

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

The source code has **10 intentional problems** spanning:

- **3 functional bugs** — crashes, missing validation, incomplete behavior
- **3 code quality issues** — strict mode off, no uniqueness constraint, no collision handling
- **1 security vulnerability** — SQL injection
- **3 adaptability issues** — incomplete rate limiter, inefficient admin query

See [ANSWER_KEY.md](ANSWER_KEY.md) for the full breakdown.

## Scoring

| Category | Weight |
|----------|--------|
| Working Solution | 25% |
| Code Quality | 20% |
| AI Usage | 15% |
| Adaptability | 20% |
| Communication | 20% |

See [INTERVIEWER_GUIDE.md](INTERVIEWER_GUIDE.md) for the detailed rubric and scorecard.
