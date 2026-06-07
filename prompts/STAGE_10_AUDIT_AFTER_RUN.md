$goal
Audit Stage 10 after implementation. Do not modify code and do not commit.

Run:
npm test

If PowerShell needs Node path:
$env:Path='C:\Program Files\nodejs;' + $env:Path; npm.cmd test

Check:

1. Root hygiene
   - Root contains only conventional root files.
   - `00_PM_README_先读我.md` is not in root.
   - `START_HERE_第一次复制这个.md` is not in root.
   - `env.stage4.example` is not in root.
   - Moved files exist in archive/examples locations.

2. Static demo
   - `site/index.html` exists.
   - `site/styles.css` exists.
   - `site/app.js` exists.
   - `site/data/demo-session.json` exists.
   - Demo includes a guided panel.
   - Demo includes a forecast/report preview.
   - Demo includes export JSON/Markdown or copy buttons.
   - Demo uses Duke Blue #012169.
   - Demo uses serif display typography.
   - Demo does not call real APIs.
   - Demo does not require login.

3. GitHub Pages
   - `.github/workflows/deploy-pages.yml` exists.
   - Workflow deploys `site/`.
   - Workflow does not expose secrets.
   - README has demo CTA.

4. Messaging
   - README highlights deterministic BaZi derived-function pipeline.
   - README highlights user-controlled context profile.
   - README highlights local-first privacy.
   - README highlights evaluation/holdout benchmark.
   - README does not reveal hidden trick / unfair advantage / exact private weights / private prompts.

5. Boundaries
   - No real `.env`.
   - No real API key.
   - No changes to ranking/rectification/forecast/evaluation semantics.
   - No login/payment/database/user system.
   - No React/Next/Vite/Vue/Svelte unless already present before Stage 10.

6. Checklist
   - Read `pm_checklists/STAGE_10_ACCEPTANCE.md`.
   - Output PASS / FAIL / PARTIAL for each item.

Final output:
- Stage 10 PASS / FAIL / PARTIAL
- whether it can be committed
- minimal fixes if needed
