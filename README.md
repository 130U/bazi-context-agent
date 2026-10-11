# BaZi Context Agent

**Explore traditional BaZi interpretations through birth-hour comparison and personal context.**

[Try it](https://www.theodoreoy.com/bazi-context-agent/) · [How it works](docs/ARCHITECTURE.md)

I built this project around a simple idea: comparing possible birth hours and understanding someone's present circumstances are different tasks. The application handles them in sequence, so personal context can shape an interpretation without changing how the birth-hour candidates were ranked.

## The experience

Start with your recorded birth time or a range of possible times. The questionnaire compares hour-branch candidates using traditional symbolic rules and dated life events, then shows the reasons behind their ranking. You choose a working candidate before moving on to questions about your current situation.

The report brings those two inputs together. It offers monthly support and transition windows, shows how an alternative candidate would change the interpretation, and gives you a downloadable record. Seasonal branch rules mapped to Gregorian months provide the calendar for the public experience.

Everything runs in the browser without an account or API key. Answers stay in the current tab, and you decide when to export them.

## The design

The candidate comparison is deterministic: the same answers and configuration produce the same ranking. Questions and scoring weights live in editable configuration files, while personal context enters through a separate layer after selection.

The local TypeScript application extends that design with structured reports, optional model providers, and an evaluation harness that compares chart inputs and personal context separately. The [context input builder](src/forecastInputBuilder.ts) and [evaluation design](docs/EVALUATION.md) show how those pieces fit together.

## Run locally

Requires Node.js 24+.

```bash
git clone https://github.com/130U/bazi-context-agent.git
cd bazi-context-agent
npm ci --ignore-scripts
npm run check
npm run preview
```

Open [localhost:4173](http://127.0.0.1:4173). To use the local research APIs, stop the preview and run `npm run ui`, then open [localhost:3000](http://127.0.0.1:3000). In Windows PowerShell, use `npm.cmd` if needed.

[Architecture](docs/ARCHITECTURE.md) · [Provider setup](examples/stage4b.env.example) · [Privacy](docs/PRIVACY.md)
