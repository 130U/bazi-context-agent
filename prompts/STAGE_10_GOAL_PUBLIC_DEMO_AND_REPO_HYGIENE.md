$goal
Execute Stage 10: Public Demo + Repository Hygiene.

Stage 10 goals:
1. Clean the GitHub repository root so a visitor sees a professional project, not scattered stage files.
2. Add an interactive static demo panel that visitors can open via GitHub Pages.
3. Update README and About-facing copy so the project’s unique value is clear without revealing private strategy.
4. Keep all existing deterministic / forecast / evaluation logic untouched.

Please read and follow:
- AGENTS.md
- docs/STAGE_10_ROADMAP.md
- docs/STAGE_10_REPO_HYGIENE.md
- docs/STAGE_10_PUBLIC_DEMO_PANEL.md
- docs/STAGE_10_GITHUB_PAGES_DEPLOYMENT.md
- docs/STAGE_10_VISUAL_DESIGN.md
- docs/STAGE_10_README_AND_ABOUT.md
- docs/STAGE_10_ARCHIVE_POLICY.md
- docs/STAGE_10_TESTING.md
- docs/STAGE_10_NON_GOALS.md
- pm_checklists/STAGE_10_ACCEPTANCE.md
- configs/site_design.stage10.json
- configs/repo_hygiene.stage10.json
- configs/github_about.stage10.json
- configs/public_demo_copy.stage10.json

Tasks:

1. Repo hygiene
   - Move root-level startup/operator files out of the root when present:
     - 00_PM_README_先读我.md → docs/archive/startup/
     - START_HERE_第一次复制这个.md → docs/archive/startup/
     - env.stage4.example → examples/stage4.env.example
   - Use git mv where possible.
   - Do not delete historical files.
   - Keep root conventional.

2. Interactive demo panel
   - Implement or refine `site/index.html`, `site/styles.css`, `site/app.js`, and `site/data/demo-session.json`.
   - Use Duke Navy Blue #012169 as the main background.
   - Use serif display headings.
   - Use modern AI workspace layout:
     - left guided input card;
     - right live forecast/report preview;
     - progress rail;
     - status badges;
     - export buttons.
   - Demo must be static and local-only.
   - Do not call real OpenAI.
   - Do not require login.
   - Do not require backend server.

3. GitHub Pages
   - Add `.github/workflows/deploy-pages.yml` to deploy the `site/` directory.
   - It must not expose secrets.
   - It must not build or deploy server code.
   - It must run only static deployment steps.

4. README and About polish
   - Update README CTA to include an interactive demo link.
   - Keep bilingual README structure.
   - Public messaging must highlight:
     - deterministic BaZi derived-function pipeline;
     - user-controlled context profile;
     - context-aware forecast;
     - local-first privacy;
     - holdout benchmark.
   - Do not mention hidden tricks, unfair advantage, questionnaire-as-secret, private prompts, or private weights.
   - If `gh` is authenticated, optionally update GitHub About metadata using `gh repo edit`.
   - If not authenticated, output manual instructions.

5. Tests and boundaries
   - Run npm test.
   - Do not modify ranking, rectification, forecast, evaluation, storage, or privacy logic.
   - Do not create real `.env`.
   - Do not write API keys.
   - Do not add login/payment/database/user system.

Report in Chinese:
- files moved;
- files added;
- site files created;
- workflow status;
- README updates;
- tests result;
- whether GitHub About metadata was updated;
- whether Stage 10 acceptance passed.

Do not commit unless explicitly requested.
