# Portfolio2026 — Development Workflow

This document describes the two-phase development workflow used in this project.
It exists because the tooling is unusual: design decisions, architectural reasoning,
and implementation happen in a Claude chat session (Claude.ai), while code review,
mechanical verification, and git operations happen in Claude Code (Zed).

---

## The Two Phases

### Phase 1 — Design & Build (Claude.ai chat)

This is where thinking happens. The Claude.ai chat session has:
- Full project context via the Global Context Doc and Portfolio Build 2026 doc
- MCP access to the filesystem (read/write) and Figma
- Conversational back-and-forth for architectural decisions
- The ability to reason through tradeoffs before writing anything

Work in this phase follows a deliberate pace:
- Design the system before touching any files
- Agree on numbers, naming, and approach before writing CSS
- Make one discrete change at a time, each with defined checks
- Verify in browser between steps

The output of Phase 1 is: changed files on a feature branch, plus a PR summary
document describing what changed and why.

### Phase 2 — Review & Commit (Claude Code in Zed)

This is where mechanical verification happens. Claude Code has:
- Terminal access to run build commands
- Direct file access to check for drift against contracts
- No conversational context — it works from the PR summary and project docs

Claude Code reviews:
- Does the build pass (`npm start`, `npm run tokens:build`)?
- Do the changes match what the PR summary claims?
- Is there any drift from `CONTRACT.md` or `CLAUDE.md`?
- Are there stale references, orphaned values, or tidiness issues?

The output of Phase 2 is: a clean commit pushed to the branch, ready to merge.

---

## The PR Summary Format

Every branch submitted to Claude Code needs a PR summary. Write it at the end of
the Claude.ai session before handing off. It should contain:

```
## PR: `<branch>` → `main`

### What this does
[One paragraph — the user-facing or architectural outcome]

### Why
[Why the old approach was wrong or insufficient]

---

### Changes by file
[For each changed file: what changed and why]

---

### What to verify
[Numbered checklist — mechanical checks Claude Code can run]

### What this does NOT change
[Explicit scope boundary — what was deliberately deferred]
```

The "What to verify" section is the most important part. It should be specific enough
that Claude Code can run each check without interpretation. Examples:
- "`npm start` builds without SCSS errors"
- "No references to `1896` remain in any non-git file"
- "DevTools → `.layout__page` computed width = 2016px at full viewport"

The "What this does NOT change" section prevents scope creep during review.
Claude Code should not fix things that were explicitly deferred.

---

## What a Good Review Looks Like

The signal that Phase 2 is working correctly: Claude Code finds small tidiness issues
(orphaned comments, inconsistent formatting, stale strings) but nothing broken.

If Claude Code finds broken behavior, that's a Phase 1 failure — the checks in this
session weren't thorough enough. Treat it as signal to tighten the verification steps.

If Claude Code finds nothing at all, that's also fine — the PR summary's verify list
was comprehensive and the work was clean.

---

## Branch Naming

Follows the convention in `CLAUDE.md`:

| Prefix | Intent |
|--------|--------|
| `rehab/` | Restore integrity, eliminate drift |
| `stabilize/` | Contract alignment, systemic corrections |
| `build/` | New feature work |
| `experiment/` | Prototypes and exploration |

One concern per branch. Compound changes make review harder and commits harder to
bisect if something breaks later.

---

## Why This Works

Design decisions require context, memory, and reasoning — the chat session has all three.
Mechanical verification requires precision and repeatability — Claude Code has those.
Neither is trying to do the other's job.

The PR summary is the handoff artifact. It translates the reasoning from Phase 1 into
instructions Phase 2 can execute without needing to reconstruct the conversation.

This is the same principle behind any good code review process: the author explains
their intent, the reviewer checks the implementation. The unusual part is that both
roles are played by AI instances with different capabilities and contexts.
