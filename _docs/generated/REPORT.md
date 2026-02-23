This report is generated from repository state.
If any FAIL appears, code must be reconciled with CONTRACT.md before proceeding.

# Stabilization Report (Generated)
Generated on: 2026-02-23T02:04:46.011Z

## Summary
- FAIL: 0
- WARN: 0
- PASS: 13

## Checks
- [PASS] Executor exists
- [PASS] Executor: no `or {}` param defaults
- [PASS] Executor: missing params render EXECUTOR_ERROR comment
- [PASS] Executor: unknown include renders visible comment
- [PASS] Executor: include dispatch is whitelisted (safe include item.include)
- [PASS] Richtext: no implicit defaults (`or "..."` or `| default()`)
- [PASS] Figure: uses passthrough <img>
- [PASS] Figure: no async image shortcode logic inside component
- [PASS] Figure: warns if src not under /assets/images/
- [PASS] Eleventy: async image shortcode inactive (stabilize baseline)
- [PASS] SCSS: no var(--token, fallback) usage
- [PASS] SCSS: no token typos like --scale--*
- [PASS] CONTRACT: image split policy documented (src vs srcFile)
