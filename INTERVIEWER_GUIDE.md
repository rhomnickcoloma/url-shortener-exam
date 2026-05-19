# Interviewer Guide — URL Shortener Exam

This document is **for interviewers only**. Do not share with candidates.

For the full list of planted bugs and expected fixes, see **[ANSWER_KEY.md](ANSWER_KEY.md)**.

---

## Before the Exam

1. Confirm the candidate has **Node.js 18+** installed and can run `npm install`.
2. Share the `src/` folder and `EXAM.md` with the candidate at exam start.
3. **Do NOT share** this guide or `ANSWER_KEY.md`.
4. Confirm they can share their entire screen (editor, browser, terminal).
5. Tell them explicitly: _"You're welcome to use ChatGPT, Copilot, Claude, or any AI tool. We want to see how you work in a real-world setting."_
6. Start a timer. Keep it visible to both parties if possible.

---

## During the Exam

### Phase 1 (0:00 – 0:30) — Bug Fixing & Improvement

**Your role:** Mostly silent observer. Answer clarifying questions about the spec. Don't guide them to bugs.

**Take notes on:**

- [ ] How do they start? (read code first, run it first, or go straight to AI?)
- [ ] Do they explore the project structure or focus on one file?
- [ ] Do they test endpoints systematically or randomly?
- [ ] How are they using AI? (prompts, frequency, validation of output)
- [ ] Did they blindly accept AI output or review/modify it?
- [ ] Which bugs did they find? In what order?
- [ ] Did they catch the SQL injection? (Bug 7 — this is a strong signal)
- [ ] Did they notice the rate limiter file exists but isn't imported?
- [ ] Did they check `tsconfig.json` and notice `strict: false`?
- [ ] Do they test their fixes?

**Red flags:**
- Pastes entire codebase into AI and asks "fix all bugs" without reading the code
- Can't explain what a fix does when asked casually
- Introduces new bugs while fixing existing ones
- Doesn't test anything — just reads and edits
- Can't navigate the multi-file project structure

**Green flags:**
- Explores the project structure first, understands the layers
- Tests each endpoint, observes the behavior, then reads the relevant file
- Uses AI for specific questions ("is this SQL safe?" "what's wrong with this query?")
- Fixes bugs AND improves the surrounding code quality
- Catches the SQL injection without a hint
- Notices `strict: false` in tsconfig

---

### Phase 2 (0:30 – 0:45) — Extension

At the **30-minute mark**, give the candidate this new requirement:

> _"The product team wants a `DELETE /urls/:code` endpoint. It should delete a shortened URL and return 204 No Content on success, or 404 if the code doesn't exist. Only allow deletion if the URL has zero visits — if it has visits, return 409 Conflict with an error message."_

**What you're watching for:**

- [ ] Do they plan the approach before coding?
- [ ] Do they add the service function, handler, AND route? (tests multi-file understanding)
- [ ] Do they add proper validation (check visit_count before deleting)?
- [ ] Do they handle all three cases (success, not found, has visits)?
- [ ] Do they use parameterized queries (or did they learn from Bug 7)?
- [ ] Do they test the new endpoint?
- [ ] How cleanly does it integrate with the existing code?

**It's OK if they don't finish.** How they prioritize and communicate what's left is a signal.

---

### Phase 3 (0:45 – 1:00) — Discussion

Stop coding. This is the most important part. Pick 3–4 questions from the list below based on what you observed.

#### Bug Discovery & Debugging Process

- "Walk me through how you approached the codebase. What did you look at first?"
- "Which bug did you find most interesting? Why?"
- "Were there any bugs you noticed but chose not to fix? Why?"
- "Did you find the SQL injection? How?" _(if they didn't find it, point it out and ask if they understand why it's dangerous)_

#### AI Usage

- "Show me a moment where AI was really helpful. What did you prompt it with?"
- "Did you ever disagree with what AI generated? What did you change?"
- "Was there anything AI got wrong that you had to fix?"
- "How do you decide when to use AI vs. figure it out yourself?"

#### Code Quality & Architecture

- "Did you notice `strict: false` in the tsconfig? What would enabling it catch?"
- "If you had more time, what would you refactor next?"
- "How would you organize this code for a team of 5 developers?"
- "Walk me through the database schema. What would you change?"

#### Scaling & Production

- "If this had 10 million URLs and 1,000 requests/second, what would break first?"
- "How would you make the redirect endpoint as fast as possible?"
- "What would you change about the rate limiter for a multi-server deployment?"
- "How would you handle analytics at scale — would you still write to DB on every redirect?"

#### Security & Reliability

- "Beyond the SQL injection, what other security concerns do you see?"
- "How would you prevent abuse? (spam URLs, phishing, malware links)"
- "How would you add authentication to the admin endpoint?"

---

## Scoring Rubric

Score each category **1–5** (1 = Poor, 3 = Meets expectations, 5 = Exceptional).

### 1. Working Solution (25%)

| Score | Description |
|-------|-------------|
| 1 | Found 0–1 bugs, fixes don't work, app still crashes |
| 2 | Found 2–3 obvious bugs (crash on stats, missing validation) |
| 3 | Found 4–5 bugs including validation and last_visited_at; core endpoints work properly |
| 4 | Found 6–8 bugs including SQL injection; Phase 2 endpoint works |
| 5 | Found 9–10 bugs, all endpoints work perfectly, edge cases handled |

### 2. Code Quality (20%)

| Score | Description |
|-------|-------------|
| 1 | Only patched bugs inline, code is messier than before |
| 2 | Fixes work but are hacky, no structural improvement |
| 3 | Clean fixes, consistent style, maybe added the UNIQUE constraint |
| 4 | Enabled strict mode, improved types, better error handling patterns |
| 5 | Created shared types module, clean abstractions, production-quality improvements |

### 3. AI Usage (15%)

| Score | Description |
|-------|-------------|
| 1 | Doesn't use AI at all, or dumps everything in and blindly pastes |
| 2 | Uses AI but can't explain or modify the output |
| 3 | Uses AI for specific questions, reviews output, makes adjustments |
| 4 | Crafts targeted prompts, validates critically, knows AI's limits |
| 5 | AI is seamlessly part of their workflow — uses it strategically, always verifies, can articulate why AI output was correct or needed changes |

### 4. Adaptability (20%)

| Score | Description |
|-------|-------------|
| 1 | Can't implement the Phase 2 endpoint at all |
| 2 | Partial implementation, missing edge cases (e.g., no visit check) |
| 3 | Working DELETE endpoint with all three cases handled |
| 4 | Clean implementation across service/handler/route layers, well-tested |
| 5 | Elegant code, consistent with their fixes, considers edge cases like race conditions |

### 5. Communication (20%)

| Score | Description |
|-------|-------------|
| 1 | Silent during coding, can't explain decisions in Phase 3 |
| 2 | Answers questions but gives shallow explanations |
| 3 | Explains decisions clearly, honest about what they know and don't know |
| 4 | Thinks out loud during coding, proactively explains trade-offs, asks good questions |
| 5 | Excellent communicator — narrates their process, discusses alternatives, demonstrates deep understanding in Phase 3 |

---

## Scorecard Template

```
Candidate: ___________________________
Date:      ___________________________
Interviewer: _________________________

BUGS FOUND (check all that apply):

Working Solution:
[ ] 1.  No URL validation on POST /shorten
[ ] 2.  GET /stats/:code crashes on missing code (no 404)
[ ] 3.  Redirect doesn't update last_visited_at

Code Quality:
[ ] 4.  strict: false in tsconfig, types not shared
[ ] 5.  No UNIQUE constraint on short_code
[ ] 6.  No collision handling for code generation

Security:
[ ] 7.  SQL injection in GET /stats/:code

Adaptability:
[ ] 8.  Rate limiter not wired up to route
[ ] 9.  Rate limiter missing retry_after_seconds
[ ] 10. Admin endpoint: fetches all rows, sorts in JS, includes 0-visit URLs

Total bugs found: ___/10

| Category         | Weight | Score (1-5) | Weighted |
|-----------------|--------|-------------|----------|
| Working Solution | 25%    |             |          |
| Code Quality     | 20%    |             |          |
| AI Usage         | 15%    |             |          |
| Adaptability     | 20%    |             |          |
| Communication    | 20%    |             |          |
|                  |        | **Total:**  | __/5.00  |

Recommendation:  [ ] Strong Hire  [ ] Hire  [ ] Lean No  [ ] No Hire

Phase 2 completed?  [ ] Yes  [ ] Partial  [ ] No

Notes:
_____________________________________________
_____________________________________________
_____________________________________________
_____________________________________________
```

**Weighted score calculation:** Multiply each score by its weight, then sum.
Example: (4 x 0.25) + (3 x 0.20) + (4 x 0.15) + (3 x 0.20) + (5 x 0.20) = 1.00 + 0.60 + 0.60 + 0.60 + 1.00 = **3.80/5.00**

**General thresholds (adjust to your team's bar):**
- **4.0+** — Strong Hire
- **3.5–3.9** — Hire
- **3.0–3.4** — Borderline — discuss with team
- **Below 3.0** — No Hire

---

## Tips for Interviewers

1. **Don't hint at bugs.** Let them discover issues through their own process. If they're completely stuck for 5+ minutes on something environmental (not a planted bug), it's OK to nudge.
2. **Note timestamps** of when they find each bug — the order tells you a lot about their process.
3. **If they don't find the SQL injection by Phase 3**, bring it up in discussion. Their reaction is telling — do they immediately understand the risk, or do they not know what SQL injection is?
4. **Be warm in Phase 3.** They just debugged someone else's messy code under pressure for 45 minutes.
5. **It's OK if they don't find everything.** 6–7 out of 10 is a strong result. What matters more is *how* they find bugs and *how* they fix them.
6. **Watch for new bugs.** Sometimes candidates introduce new issues while fixing existing ones. This is a negative signal, especially if they don't test after making changes.
7. **Phase 2 tests multi-file navigation.** The DELETE endpoint requires adding a service function, a handler, and a route across three files. Watch if they understand the layered architecture.
