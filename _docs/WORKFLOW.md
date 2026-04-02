# Portfolio2026 — Development Workflow

This document describes the two-tool workflow used in this project.
Design decisions and Figma work happen in Claude.ai. Code changes, audits,
and git operations happen in Claude Code (Zed). Both tools are typically
open simultaneously, with the 11ty dev server running in the background.

---

## The Hard Rule

**Claude.ai produces documents. Claude Code produces file changes.**

Claude.ai has filesystem MCP access and *can* write `.scss`, `.njk`, and
`.yml` files — but doing so is where drift originates. Vibe coding in a chat
session leads to contracts getting bent, dead code accumulating, and things
named wrong. The PR doc + session state are the handoff artifacts. Claude Code
is where files actually change.

---

## What Each Tool Does

### Claude.ai — Design & Decisions

Has Figma MCP access. Use it for:

- Reading Figma variables, components, and layouts
- Generating YAML from Figma node trees
- Architectural decisions and trade-offs
- Drafting the PR summary document
- Updating `session-state.md`

**Does not write SCSS, Nunjucks templates, or JS.** If a session starts
drifting into editing those files directly, stop and hand off to Claude Code.

### Claude Code (Zed) — Implementation & Verification

Has terminal access and direct file editing with read-first discipline. Use it for:

- All SCSS, template, and JS file changes
- Running `npm start`, `npm run tokens:build`, visual checks
- Auditing changed files against `CONTRACT.md` and `CLAUDE.md`
- Git staging and committing
- Any refactor that touches multiple files in a coordinated way

**Does not make design decisions.** Works from the PR summary,
`session-state.md`, and project contracts. If something is ambiguous,
it asks — it does not invent.

---

## When to Switch Tools

Stop Claude.ai and open Zed when:

- [ ] A PR summary document exists in `_docs/`
- [ ] You're about to edit `.scss`, `.njk`, or `.js` files
- [ ] You've agreed on an approach and just need to execute it
- [ ] You need to run a build or check the 11ty log
- [ ] You want to commit

Stay in Claude.ai when:

- [ ] You're reading from Figma
- [ ] You're making or debating an architectural decision
- [ ] You're generating or editing YAML data
- [ ] You're writing the PR doc or session state

**The practical trigger:** as soon as Claude.ai produces a PR summary doc,
close it and switch to Zed. The design work is done.

---

## Session State

`_docs/session-state.md` is the single source of truth for where the build stands.

Both Claude.ai and Claude Code read it at session start. It answers: what's
the current state, what was just done, what's deferred, and what rules apply.

**Every session ends one of two ways:**
1. Work is commit-ready → write a PR doc, hand off to Claude Code, update `session-state.md`.
2. Work is not commit-ready → update `session-state.md` before closing. No exceptions.

---

## The PR Summary Format

Write it at the end of the Claude.ai session before handing off to Claude Code.

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
- [ ] `npm start` builds with no SCSS errors
- [ ] Browser: [specific thing to verify]

### What this does NOT change
[Explicit scope boundary — what was deliberately deferred]
```

The commit list is the most important part. Claude Code commits exactly what
the PR doc describes — no more, no less.

---

## Branching

Commit directly to `main` by default. Branches are opt-in for:
- Experimental work that may be thrown away (`experiment/`)
- A large structural refactor where you want a clean revert point

Branches are not required for normal feature work. Commits provide sufficient
history for a solo, linear workflow.

---

## What a Good Handoff Looks Like

Claude Code should find the PR doc, read it alongside `session-state.md`,
and be able to commit without asking any questions. If Claude Code is
interpreting or guessing, the PR doc wasn't specific enough.

The signal that the workflow is healthy: Claude Code finds small tidiness
issues (stale comments, documentation drift) but nothing structurally broken.
If it finds broken behavior, something was skipped in the Claude.ai session.

---

## Why Two Tools

Claude.ai has Figma access, long conversational memory, and reasoning ability
for trade-offs. Claude Code has terminal access, read-first file discipline,
and no conversational baggage to drift from.

Neither is trying to do the other's job. The session state and PR doc are
the interface between them.
