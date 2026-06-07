# Stage 10 Archive Policy

## Purpose

Historical development prompts and PM startup files are useful, but they should not clutter the repository root.

## Archive locations

```text
docs/archive/startup/
docs/archive/stage-prompts/
docs/archive/operator-notes/
```

## Rules

- Preserve context.
- Prefer `git mv`.
- Do not delete without approval.
- Do not move files used by tests/build.
- Update links after moving.
- Keep `prompts/` for active stage prompts.
