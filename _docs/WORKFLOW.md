# Portfolio2026 — Development Workflow

---

## Tool Roles (current — as of April 2026)

### Claude Code — Primary Development Tool

Claude Code is the primary tool for all development work. It has terminal
access, direct file editing, Firefox DevTools MCP for visual verification,
and no conversational drift.

Use Claude Code for:
- All `.scss`, `.njk`, `.js`, `.yml` file changes
- Visual verification via Firefox MCP (navigate, screenshot, read console)
- Running `npm start`, `npm run tokens:build`, build checks
- Auditing changed files against `CONTRACT.md` and `CLAUDE.md`
- Git staging and committing
- Any refactor that touches multiple files in a coordinated way

### Claude.ai — Design & Figma Only

Claude.ai's role is now narrow. Without a working browser MCP it cannot
visually verify changes, so it must not author code.

Use Claude.ai for:
- Reading Figma variables, components, and layouts
- Generating YAML from Figma node trees
- Verifying YAML against Figma (delta docs)
- Architectural decisions that do not require browser verification
- Drafting PR summary documents

**Claude.ai must not write to `.scss`, `.njk`, or `.js` files.**
If a session drifts toward editing those files directly, stop immediately
and hand off to Claude Code with a PR doc. No exceptions for "just a small
fix." This is the rule that was broken in session 6 and caused the
choreography regression.

---

## The Hard Rule

**Claude Code makes file changes. Claude.ai produces documents.**

---

## One Change at a Time — Non-Negotiable

This rule applies to all work but is especially critical for choreography,
scroll math, and any JS that depends on DOM geometry.

1. **Describe** the proposed change and its expected observable effect.
   Wait for explicit approval before touching any file.
2. **Make exactly one change.** One logical unit — one constant, one
   selector, one function. Not "these two lines go together."
3. **Stop.** Do not chain to the next change. Do not pre-emptively fix
   anything that looks related.
4. **Verify.** Claude Code screenshots the result via Firefox MCP.
   Craig verifies in his own browser.
5. **Confirm.** Craig says "confirmed, next" or describes what's wrong.
6. **Repeat.**

A change is not done until Craig confirms it in browser. "It looks right
to me from the code" is not confirmation. Obvious is how things compound.

This workflow exists because choreography.js is complex positional math.
The cost of one unverified change compounding on another is a session of
debugging to undo what took two minutes to break.

---

## Session Startup Checklist

1. **Open Firefox** to `localhost:8080/portfolio/inficon-impact-manager/` for visual verification. Claude Code launches its own separate Firefox instance (remote debug port) — yours is for Craig's-eyes-on confirmation. They are independent.
2. **Dev server** — confirm `npm start` is running before either instance loads the page.
3. **Read `_docs/session-state.md`** — authoritative state for the build.
4. **Read any PR doc in `_docs/`** if one exists.

---

## Session State

`_docs/session-state.md` is the single source of truth for where the
build stands. Read it at session start. Update it at session end.

Both Claude.ai and Claude Code read this file. Every session ends by
updating it. No exceptions.

---

## The PR Summary Format

Write at the end of a Claude.ai session before handing off to Claude Code,
or when Claude Code needs to stage work for review.

```
## PR: <short description>

### What this does
[One paragraph — the architectural or user-facing outcome]

### Why
[Why the old approach was wrong or insufficient]

---

### Commits (in order)

#### Commit 1: `<conventional commit message>`
**Files:** list
Description of what changed and why.

#### Commit 2: ...

---

### Testing checklist
- [ ] `npm run tokens:build` runs clean
- [ ] `npm start` builds with no errors
- [ ] Browser: [specific thing to verify]

### What this does NOT change
[Explicit scope boundary — what was deliberately deferred]
```

---

## Branching

Commit directly to `main` by default. Branches are opt-in for:
- Experimental work that may be thrown away (`experiment/`)
- A large structural refactor where you want a clean revert point

Branches are not required for normal feature work.

---

## PR Doc Lifecycle

PR docs in `_docs/` are handoff artifacts, not permanent records. Once all
commits described in a PR doc are in the git history, delete the file in
the same commit or the immediately following cleanup commit.

Stale PR docs cause confusion about what is done vs. pending. Git history
is the record.

---

## What a Good Session Looks Like

Claude Code finds the PR doc (if one exists), reads it alongside
`session-state.md`, and can execute without asking questions. If Claude
Code is interpreting or guessing, the PR doc wasn't specific enough.

The signal that the workflow is healthy: Claude Code finds small tidiness
issues but nothing structurally broken. If it finds broken behavior,
something was skipped upstream.
