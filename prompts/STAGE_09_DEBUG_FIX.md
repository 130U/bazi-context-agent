$goal
Fix only Stage 9 audit failures. Do not add new product functionality.

Allowed fixes:
- README wording;
- missing bilingual sections;
- missing CONTRIBUTING.md;
- missing SECURITY.md;
- missing issue templates;
- missing release checklist docs;
- accidental disclosure wording;
- missing privacy/AI-boundary language.

Forbidden:
- modifying ranking;
- modifying rectification;
- modifying forecast logic;
- adding new provider;
- writing real API keys;
- creating real .env;
- adding login/payment/database;
- making repo public.

Run npm test after fixes and report in Chinese.
Do not commit.
