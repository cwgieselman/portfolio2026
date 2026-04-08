# CRAIG.md — Working Guidelines for Craig

This file is the other side of CLAUDE.md. CLAUDE.md tells Claude how to work.
This file tells Craig how to work with Claude. Read it at the start of every session.

---

## What Actually Helps Claude Work Better

### Diagnostic-first is a shared responsibility
When something looks wrong, say: **"Run a diagnostic before touching anything."**
Do not wait to see if Claude measures or guesses — make it explicit. Given the failure
mode documented in session history, this prompt is a guardrail, not an insult.

### One approval per change
Before Claude touches a file, say "go ahead" or "yes." Do not let Claude describe a
change and then immediately make it. The pause is the check. If the description sounds
wrong, say so. This is where the most expensive mistakes get caught.

### TEXT ONLY works — use it more
When you want Claude to confirm understanding before acting, say "TEXT ONLY — do not
write any code." This stops the runaway change-then-explain pattern. Use it liberally,
especially when discussing architecture or explaining the design intent.

### Screenshots with annotations beat descriptions
A screenshot with a circle or arrow communicates faster and more accurately than a
paragraph. You do this well — keep it up. When Claude misreads a screenshot, saying
"look at the area I circled" is faster than re-describing.

### Your prompts are good. The instinct to collaborate is correct.
Talking through intent before writing code produces better outcomes than issuing
commands. The conversational approach is a feature, not a problem. The failure mode
is Claude not following through on what was discussed — not the discussion itself.

---

## Session Management

### Save session state when:
- A bug is fixed and verified working
- A feature is complete (even if more features remain)
- You're about to take a break (even 15 minutes)
- Something significant was learned or decided (architecture, vocabulary, approach)
- Before starting a risky or experimental change

**How:** Ask Claude: "Update session state for what we just did."

### Start a new chat when:
- Claude starts referencing things that aren't true anymore ("the file has X" when it doesn't)
- Claude starts going in circles on a problem (two rounds without progress = new chat)
- A complete logical unit of work is done and verified
- The session has been running more than ~90 minutes of active work
- Claude mentions context compression or summarization

**How:** End the old session with a state update. Open a new Claude Code window.
CLAUDE.md and session-state.md carry the context forward — the new session reads
both on start.

### Before closing a session always:
1. Ask Claude to update `_docs/session-state.md`
2. Confirm the update looks complete
3. Then close

---

## When Things Go Wrong

### If Claude is clearly guessing:
Stop it immediately. Say: "Stop. Run a diagnostic. Do not form a theory first."
The faster you interrupt the speculation loop, the less time is lost.

### If Claude says "looks correct" and it visibly isn't:
Say: "It is not correct. Run `getComputedStyle` / `getBoundingClientRect` and tell
me the actual computed values." Do not accept a code-reading explanation for a
visual problem.

### If something Claude built broke something else:
Say: "Revert that change and run a diagnostic first." Do not let Claude patch on
top of a broken patch. Get back to a known-good state, then measure.

### If the session is going sideways and time is being wasted:
It is completely appropriate to say "stop, we're going in circles, let's save state
and start a new session." That is not failure — that is good session management.

---

## The Partnership

Claude has autonomy and reasoning capability that is genuinely valuable. The
collaboration model works when both sides hold their responsibilities:

**Claude's responsibilities:**
- Measure before concluding
- One change, verified, before the next
- Never report fixed without confirming it is fixed
- Follow the instructions in CLAUDE.md without exception

**Craig's responsibilities:**
- Force diagnostics when Claude starts speculating
- Give one explicit approval per change
- Save session state at natural stopping points
- Start a new session when the current one degrades
- Read this file at the start of each session

The goal is a working relationship where Craig does not have to babysit and Claude
does not have to guess. Both sides have to hold up their end for that to work.

---

## Quick Reference Card

| Situation | What to say |
|---|---|
| Something looks wrong | "Run a diagnostic before touching anything." |
| Want understanding confirmed before code | "TEXT ONLY — confirm you understand X." |
| Claude says fixed but it isn't | "Run getComputedStyle/getBoundingClientRect." |
| Claude is speculating | "Stop. Measure it." |
| Ready to make a change | "Go ahead." (explicit approval) |
| Unit of work complete | "Update session state." |
| Session degrading | "Save state, we'll pick this up in a new session." |
