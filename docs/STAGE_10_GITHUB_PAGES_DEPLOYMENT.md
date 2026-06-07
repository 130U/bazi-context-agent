# Stage 10 GitHub Pages Deployment

## Goal

Publish the `site/` directory as a static GitHub Pages demo.

## Preferred deployment

Use GitHub Actions and Pages artifact upload.

Required file:

```text
.github/workflows/deploy-pages.yml
```

Workflow requirements:

- Trigger on pushes to `master` or `main`.
- Deploy only static `site/` directory.
- Do not expose API keys.
- Do not build or deploy server code.
- Do not run real OpenAI calls.

## Repository About metadata

After deployment, set GitHub repository About fields:

```text
Description:
BaZi derived-function engine with user-controlled context profiles and context-aware forecasting.

Website:
https://<owner>.github.io/bazi-context-agent/

Topics:
bazi, astrology, typescript, ai, forecast, privacy, evaluation
```

If Codex cannot use GitHub credentials, it should output manual commands rather than blocking.

Suggested command:

```bash
gh repo edit --description "BaZi derived-function engine with user-controlled context profiles and context-aware forecasting." --homepage "https://<owner>.github.io/bazi-context-agent/" --add-topic bazi --add-topic astrology --add-topic typescript --add-topic ai --add-topic forecast --add-topic privacy --add-topic evaluation
```
