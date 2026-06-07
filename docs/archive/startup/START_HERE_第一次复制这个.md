# START HERE：第一次复制给 Codex 的内容

如果你已经把本文件包放进 repo，请打开 Codex，输入 `/goal`，然后复制下面整段。

如果 `/goal` 不可用，直接作为普通 prompt 粘贴。

```text
$goal
Read AGENTS.md first.

Then read:
- docs/GOAL.md
- docs/MVP_SPEC.md
- docs/GAME_RULES.md
- docs/QUESTIONNAIRE_SPEC.md
- docs/SCORING_SPEC.md
- docs/DATA_SCHEMA.md
- docs/AI_POLICY.md
- configs/question_bank.v1.json
- configs/scoring_weights.v1.json

Build Round 01 only.

Required Round 01 outcome:
1. Create a TypeScript project skeleton.
2. Add core data types from docs/DATA_SCHEMA.md.
3. Load question_bank.v1.json and scoring_weights.v1.json.
4. Implement deterministic symbol prior scoring.
5. Implement candidate generation as a clean deterministic stub.
6. Implement event backtest scoring as a clean deterministic stub.
7. Output Top 3 candidate ranking from demo data.
8. Add tests for config loading, symbol scoring, fetal-order scoring, score formula, and no-AI-before-ranking boundary.
9. Add README instructions to run tests.

Hard constraints:
- Do not call AI.
- Do not add OpenAI API integration yet.
- Do not build full UI yet.
- Do not let AI decide birth hour.
- Keep scope limited to Round 01.

Done when:
- tests run or exact blocker is reported
- changed files are summarized
- remaining TODOs are listed
```
