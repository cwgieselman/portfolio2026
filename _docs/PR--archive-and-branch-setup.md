# Claude Code Handoff — Archive & Branch Setup
*Generated March 22, 2026. Execute in Zed before starting any build work.*

---

## Context

The INFICON Impact Manager page is transitioning from the FF Grid macro layout to a bento beat series. Before touching any source files, we need to:

1. Commit current uncommitted changes to `main`
2. Create a git tag freezing the FF Grid era
3. Populate the `_archive/` directory (already created, git-ignored)
4. Add `_archive/` to `.gitignore`
5. Create a Claude docs snapshot in `/Users/craiggieselman/Documents/Claude/`
6. Cut a new working branch

Do these steps in order. Do not start build work until all six are done.

---

## Step 1 — Commit uncommitted changes

Check what's uncommitted:

```bash
git status
git diff --stat
```

Review the diff. Commit everything on `main` with an appropriate message. If there are multiple logical units, split into multiple commits. Use conventional commit format (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:` etc.).

---

## Step 2 — Tag the current commit

After committing, tag `main` at HEAD:

```bash
git tag v-inficon-ff-grid
```

This tag is the authoritative freeze point for the FF Grid era INFICON page. The archive files are convenience copies; this tag is the real record.

---

## Step 3 — Populate `_archive/inficon-ff-grid/`

The directory structure already exists. Copy files into it.

**Source files** — copy as-is, no modification:

```bash
cp src/inficon-impact-manager/index.njk \
   _archive/inficon-ff-grid/source/index.njk

cp src/_data/pages/inficon-impact-manager/page.yml \
   _archive/inficon-ff-grid/source/page.yml

cp src/assets/scss/placements/_inficon-impact-manager.scss \
   _archive/inficon-ff-grid/source/_inficon-impact-manager.scss
```

**Static files** — compiled output from `_site/` and `src/assets/css/`:

```bash
# Compiled HTML
cp _site/portfolio/inficon-impact-manager/index.html \
   _archive/inficon-ff-grid/static/index.html

# Compiled CSS
cp src/assets/css/main.css \
   _archive/inficon-ff-grid/static/assets/scss/main.css

# JS (referenced by page)
cp src/assets/js/comparison-components.js \
   _archive/inficon-ff-grid/static/assets/js/comparison-components.js

# All inficon--* image variants from _site/assets/images/
cp _site/assets/images/inficon--* \
   _archive/inficon-ff-grid/static/assets/images/
```

Verify the copy:

```bash
ls _archive/inficon-ff-grid/source/
ls _archive/inficon-ff-grid/static/assets/images/ | wc -l
```

Source should have 3 files. Images should have 20+ files (originals + optimized variants).

---

## Step 4 — Add `_archive/` to `.gitignore`

Add this line to `.gitignore` with the other project-specific ignores (near the `_staging/` entry):

```
# Personal convenience archive — not source, not deployed
_archive/
```

Confirm it's ignored:

```bash
git check-ignore -v _archive/inficon-ff-grid/README.md
```

Should return a match. If not, check `.gitignore` syntax.

---

## Step 5 — Claude docs snapshot

Copy the three source files to the Claude docs folder as a code snapshot. This lets Claude reference the FF Grid era implementation in future sessions without checking out the tag.

```bash
mkdir -p "/Users/craiggieselman/Documents/Claude/REF/inficon-ff-grid"

cp _archive/inficon-ff-grid/source/index.njk \
   "/Users/craiggieselman/Documents/Claude/REF/inficon-ff-grid/index.njk"

cp _archive/inficon-ff-grid/source/page.yml \
   "/Users/craiggieselman/Documents/Claude/REF/inficon-ff-grid/page.yml"

cp _archive/inficon-ff-grid/source/_inficon-impact-manager.scss \
   "/Users/craiggieselman/Documents/Claude/REF/inficon-ff-grid/_inficon-impact-manager.scss"
```

---

## Step 6 — Cut the working branch

```bash
git checkout -b build/inficon-bento-series
```

All build work for the new bento beat series happens on this branch. No commits to `main` until the work is reviewed and merged.

---

## Verification checklist

- [ ] `git log --oneline -5` shows clean commits on `main`
- [ ] `git tag` shows `v-inficon-ff-grid`
- [ ] `_archive/inficon-ff-grid/source/` has 3 files
- [ ] `_archive/inficon-ff-grid/static/assets/images/` has 20+ files
- [ ] `git check-ignore -v _archive/` confirms ignored
- [ ] Claude docs REF folder has 3 files
- [ ] `git branch` shows `build/inficon-bento-series` as current branch

Once all boxes checked, report back. Build work starts in the next session.
