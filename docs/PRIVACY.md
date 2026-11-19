# Privacy / 隐私

## Principles

- The public app holds the session in the tab's memory and writes nothing to `localStorage`, `sessionStorage`, cookies or a backend; exiting, closing or refreshing the tab ends it.
- No account, cloud sync, telemetry or remote database.
- A session leaves the tab only through an export the person starts.
- Research API reports are redacted before export.

## Sensitive data

The system may handle family background, education, career, relationship, health-year events, migration, preferences, and current concerns. An export can contain all of it, so the person who exports a session keeps the file.

## Secrets

Do not include API keys, tokens, `.env` content, or local paths in reports or exports.
