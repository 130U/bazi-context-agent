# Stage 10 README and About Update

## README goals

README must immediately answer:

1. What is this?
2. How is it different from “paste BaZi into ChatGPT”?
3. How do I try it?
4. What is the architecture?
5. What are the privacy and AI boundaries?
6. How do I run locally?
7. How is it evaluated?

## Required CTA

At the top of `README.md`, include:

```md
[Try the interactive demo](https://<owner>.github.io/bazi-context-agent/)
```

If the exact Pages URL is not known yet, use a placeholder and instruct the user to replace it after GitHub Pages deployment.

## Public differentiation

Say:

```text
This project separates deterministic BaZi-derived structure from user-controlled context profiles, then combines them for context-aware forecasting.
```

Do not say:

```text
questionnaire trick
hidden extraction
unfair advantage
secret data collection
```

## About section

Codex should attempt to update GitHub About metadata only if GitHub CLI is authenticated.

If not authenticated, it should print manual steps.
