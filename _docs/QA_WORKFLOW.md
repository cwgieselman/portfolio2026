# QA & Drift Reconciliation Workflow

This project enforces deterministic rendering through:

- CONTRACT.md (normative rules)
- Executor safelist logic
- Token canonicalization
- Generated keeper docs
- System report gating

This document defines how to reconcile documentation and code drift.

---

## When to Run This Process

Run drift reconciliation when:

- A new component is added
- Executor routing changes
- Token schema changes
- Error marker conventions change
- Contract sections are added or modified
- System report surfaces unexpected behavior

---

## Step 1 — Refresh Generated Keepers

Run:

- Docs: Generate (keepers)
- Docs: System Report

Ensure the repo is in a known-good state before auditing.

---

## Step 2 — Open Audit Scope

Open:

- README.md
- CONTRACT.md
- content-cell.njk
- Any modified components
- _docs/generated/*
- Relevant token files

Audit only against the current repo snapshot.

---

## Step 3 — Extract Claims vs Observed Behavior

Using Codex:

1. Extract normative claims from README + CONTRACT.
2. Extract observed behavior from code + generated docs.
3. Produce a Doc Drift Report.

Each drift item must include:
- Files
- Evidence (quoted)
- Severity
- Recommended fix (update docs or update code)

---

## Step 4 — Resolve Drift Directionally

For each drift:

Decide whether:
- The contract is correct → update code
- The code is correct → update contract

Never “blend” the two.

Make the smallest possible patch.

---

## Step 5 — Re-Validate

After changes:

- Run Docs: System Report
- Run Docs: Generate (keepers)
- Run Docs: Diff (generated)

Confirm:
- No regressions
- No unexpected drift
- Deterministic behavior preserved

Commit regenerated snapshots if stable.

---

## Error Marker Convention

All required-field validation must emit structured markers:

~~~html
<!-- <SCOPE>_ERROR: <message> -->
~~~

Examples:
- EXECUTOR_ERROR
- UNKNOWN_INCLUDE
- CONTENT_ERROR
- FIGURE_ERROR

Silent failure is not permitted.

---

## Regression Gate Philosophy

Must-pass gates:
- System report
- No token fallback patterns
- No implicit param reshaping
- Executor retains explicit safelist

Optional gates:
- HTML snapshot diff
- Visual regression
- Accessibility sanity checks

---

This workflow keeps the system self-consistent and prevents silent architectural drift.

---

## Drift Report Usage Policy

`DRIFT_REPORT.md` is not a required artifact for every branch.

It exists to reconcile structural drift between:

- CONTRACT.md (normative rules)
- Code (executor, components, tokens)
- Generated keeper docs

### When to Generate a Drift Report

Create or update a drift report when a branch introduces **structural changes**, including:

- Adding or removing executor includes
- Modifying component param contracts
- Changing token schema or canonical token files
- Altering error marker conventions
- Updating structural invariants in CONTRACT.md
- Significant architectural refactors

In these cases:

1. Run the QA workflow.
2. Generate `DRIFT_REPORT.md`.
3. Resolve drift directionally (update docs *or* update code).
4. Recheck System Health `Docs: Report`.
5. Commit reconciled changes.
6. Optionally archive the report under `_docs/audits/`.

---

### When a Drift Report Is Not Required

Do **not** generate a drift report for:

- Visual styling changes
- Copy/content updates
- Non-structural component tweaks
- Minor refactors that do not change contract behavior

For these branches:

1. Check System Health `Docs: Report`.
2. Regenerate Docs (if needed): `Docs: Docs`.
3. Commit normally.

---

### Report Lifecycle

`DRIFT_REPORT.md` is a working reconciliation artifact.

It may be:

- Overwritten during active audit work
- Archived for major architectural milestones
- Deleted after reconciliation is complete

It is not intended to be a permanent per-branch log.

---

This keeps the QA process lightweight for feature work,
while preserving rigor for structural evolution.
