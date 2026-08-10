# Stage 10 Repo Hygiene

## Problem

The GitHub root currently looks cluttered to a casual visitor because early-stage workflow files and PM startup files are visible beside core project files.

A public repository should make the first screen clean:

```text
README.md
README.en.md
README.zh-CN.md
AGENTS.md
CODE_OF_CONDUCT.md
package.json
tsconfig.json
src/
tests/
docs/
configs/
fixtures/
examples/
prompts/
site/
.github/
```

## Files that should stay in root

Keep:

```text
README.md
README.en.md
README.zh-CN.md
AGENTS.md
CODE_OF_CONDUCT.md
package.json
package-lock.json
tsconfig.json
.gitignore
```

## Files that should move out of root

Move if present:

```text
00_PM_README_先读我.md
START_HERE_第一次复制这个.md
env.stage4.example
*.stage*.example if sitting in root
one-off PM workflow notes
old direct-to-Codex starter files
```

Recommended destinations:

```text
docs/archive/startup/
docs/archive/operator-prompts/
examples/
```

Examples:

```text
00_PM_README_先读我.md
  → docs/archive/startup/00_PM_README_先读我.md

START_HERE_第一次复制这个.md
  → docs/archive/startup/START_HERE_第一次复制这个.md

env.stage4.example
  → examples/stage4.env.example
```

## Rules

- Do not delete historical files unless clearly duplicated and approved.
- Prefer `git mv` so history is preserved.
- Update README links if moved files were referenced.
- Do not move package/config files required by tests.
- Do not move `AGENTS.md`; it remains root-level agent guidance.
