# Stage 10 Acceptance Checklist

## Repo hygiene

- [ ] Root is clean and conventional.
- [ ] Startup/operator files are moved out of root.
- [ ] Historical files are archived, not deleted.
- [ ] README links still work.
- [ ] `AGENTS.md` remains in root.

## Public demo

- [ ] `site/index.html` exists.
- [ ] `site/styles.css` exists.
- [ ] `site/app.js` exists.
- [ ] `site/data/demo-session.json` exists.
- [ ] Demo has guided input panel.
- [ ] Demo has live preview/report panel.
- [ ] Demo has export/copy controls.
- [ ] Demo uses Duke Blue `#012169`.
- [ ] Demo uses serif display typography.
- [ ] Demo is static/local-only.
- [ ] Demo does not require login.
- [ ] Demo does not call real OpenAI.

## GitHub Pages

- [ ] `.github/workflows/deploy-pages.yml` exists.
- [ ] Workflow deploys `site/`.
- [ ] README contains demo CTA.
- [ ] GitHub About update instructions or commands are provided.

## Public messaging

- [ ] README explains technical stack.
- [ ] README explains deterministic derived-function pipeline.
- [ ] README explains user-controlled context profile.
- [ ] README explains local-first privacy.
- [ ] README explains holdout benchmark.
- [ ] README does not reveal hidden strategy or private weights.

## Safety

- [ ] No real `.env`.
- [ ] No real API key.
- [ ] No ranking/rectification/forecast/evaluation semantic changes.
- [ ] No login/payment/database/user system.
- [ ] npm test passes.
