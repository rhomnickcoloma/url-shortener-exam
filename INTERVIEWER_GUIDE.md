# Interviewer Guide — URL Shortener Exam

This document is **for interviewers only**. Do not share with candidates.

For the full list of planted bugs and expected fixes, see **[ANSWER_KEY.md](ANSWER_KEY.md)**.

---

## Before the Exam

1. Confirm the candidate has **Node.js 18+** installed and can run `npm install`.
2. Share the `src/` folder and `EXAM.md` with the candidate at exam start.
3. **Do NOT share** this guide or `ANSWER_KEY.md`.
4. Confirm they can share their entire screen (editor, browser, terminal).
5. Tell them explicitly: _"The first 20 minutes are manual — no AI tools. After that, you're free to use ChatGPT, Copilot, Claude, or anything else."_
6. Start a timer. Keep it visible to both parties if possible.

---

## During the Exam

### Phase 1 (0:00 – 0:05) — Review Repo Structure

**Your role:** Let them explore. Answer questions about the spec only.

**Take notes on:**

- [ ] Do they read the code or jump straight to running it?
- [ ] Do they explore all the files or only look at one?
- [ ] Do they notice the middleware folder and its contents?
- [ ] Do they check `tsconfig.json` or `package.json`?

---

### Phase 2 (0:06 – 0:20) — Manually Fix Bugs

**Your role:** Silent observer. This phase tests raw debugging skill without AI. Don't guide them to bugs.

**Remind them at 0:06:** _"You can start fixing bugs now. Remember, no AI tools in this phase."_

**Take notes on:**

- [ ] Do they test endpoints systematically or randomly?
- [ ] Which bugs did they find manually? In what order?
- [ ] Did they catch the SQL injection? (Bug 7 — strong signal)
- [ ] Did they notice the rate limiter file exists but isn't imported?
- [ ] Do they test their fixes?
- [ ] How do they prioritize — crash bugs first, or read everything?

**Red flags:**
- Can't identify obvious crashes (Bug 2) even after testing
- Doesn't test anything — just reads and guesses
- Can't navigate the multi-file project structure
- Tries to sneak in AI usage

**Green flags:**
- Tests each endpoint, observes the behavior, then reads the relevant file
- Catches the SQL injection without AI
- Notices `strict: false` in tsconfig
- Fixes bugs AND improves the surrounding code quality

---

### Phase 3 (0:21 – 0:50) — Use AI to Fix Bugs

**Your role:** Silent observer. Watch how they use AI.

**Announce at 0:21:** _"You can now use any AI tool you want — ChatGPT, Copilot, Claude, anything."_

**Take notes on:**

- [ ] How quickly do they switch to AI? What's their first prompt?
- [ ] Do they paste the whole codebase or ask targeted questions?
- [ ] Do they blindly accept AI output or review/modify it?
- [ ] What additional bugs does AI help them find?
- [ ] Do they validate AI suggestions before applying them?
- [ ] Do they use AI to improve code quality beyond just fixing bugs?
- [ ] Did they catch bugs with AI that they missed manually?

**Red flags:**
- Pastes entire codebase and asks "fix all bugs" without reading output
- Can't explain what AI-generated code does when asked casually
- Introduces new bugs from AI output without testing
- Blindly trusts everything AI produces

**Green flags:**
- Crafts specific, targeted prompts ("is this SQL query safe?", "what's wrong with this rate limiter?")
- Reviews and modifies AI output before applying
- Uses AI to verify their manual fixes were correct
- Uses AI for things it's good at (spotting patterns, suggesting best practices) while relying on their own judgment for architecture

---

### Phase 4 (0:50 – 1:00) — Discussion

Stop coding. Pick 3–4 questions from the list below based on what you observed.

#### Debugging Process

- "Walk me through how you approached the codebase in the first 5 minutes."
- "Which bugs did you find manually vs. with AI?"
- "Which bug did you find most interesting? Why?"
- "Were there any bugs you noticed but chose not to fix? Why?"
- "Did you find the SQL injection? How?" _(if they didn't find it, point it out and ask if they understand why it's dangerous)_

#### AI Usage

- "How did you decide what to ask AI vs. figure out yourself?"
- "Show me a moment where AI was really helpful. What did you prompt it with?"
- "Did AI get anything wrong? What did you change?"
- "Was there anything you fixed manually that AI could have helped with faster?"

#### Code Quality & Architecture

- "Did you notice `strict: false` in the tsconfig? What would enabling it catch?"
- "If you had more time, what would you refactor next?"
- "Walk me through the database schema. What would you change?"

#### Scaling & Production

- "If this had 10 million URLs and 1,000 requests/second, what would break first?"
- "How would you make the redirect endpoint as fast as possible?"
- "What would you change about the rate limiter for a multi-server deployment?"

#### Security & Reliability

- "Beyond the SQL injection, what other security concerns do you see?"
- "How would you prevent abuse? (spam URLs, phishing, malware links)"
- "How would you add authentication to the admin endpoint?"

---

## Tips for Interviewers

1. **Enforce the no-AI rule in Phase 2.** If you see them open ChatGPT or Copilot before the 20-minute mark, gently remind them: _"Remember, no AI tools until Phase 3."_
2. **Note which bugs they find in Phase 2 vs. Phase 3.** This is the most valuable comparison — it shows what they can do on their own vs. with AI assistance.
3. **Don't hint at bugs.** If they're completely stuck for 5+ minutes on something environmental (not a planted bug), it's OK to nudge.
4. **If they don't find the SQL injection by Phase 4**, bring it up in discussion. Their reaction is telling.
5. **Be warm in Phase 4.** They just debugged under pressure for 50 minutes.
6. **It's OK if they don't find everything.** What matters is *how* they find bugs, *how* they use AI, and *how* they explain their process.
7. **Watch for new bugs.** Sometimes candidates introduce new issues while fixing existing ones. This is a negative signal, especially if they don't test after making changes.
