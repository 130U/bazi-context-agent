$goal
Implement Stage 9: GitHub Release Polish.

Current objective:
Polish the repository for GitHub presentation with a bilingual README, public architecture docs, privacy/security/contribution files, and release checklist.

Critical product messaging:
- The public README must highlight the project's uniqueness.
- The README must be bilingual English/Chinese.
- The README must explain the derivative-function + initial-value thesis at a high level.
- The README must not reveal proprietary internal scoring heuristics or private prompt strategies.
- Do not describe the questionnaire as a hidden trick.
- Do state that user-controlled context can personalize forecasts.

Read first:
- AGENTS.md
- docs/PROJECT_ROADMAP_V4_DERIVED_FUNCTION.md
- docs/STAGE_09_ROADMAP.md
- docs/README_BILINGUAL_GUIDE.md
- docs/PUBLIC_MESSAGING_GUIDE_STAGE9.md
- docs/TECH_STACK_AND_ARCHITECTURE_STAGE9.md
- docs/AI_BOUNDARY_PRIVACY_STAGE9.md
- docs/EVALUATION_BENCHMARK_STAGE9.md
- docs/GITHUB_RELEASE_CHECKLIST_STAGE9.md
- docs/STAGE_09_NON_GOALS.md
- configs/public_messaging.stage9.json
- pm_checklists/STAGE_09_ACCEPTANCE.md

Tasks:
1. Update root README.md with the bilingual structure.
2. Ensure README highlights:
   - deterministic chart derivation;
   - BaZi derived-function engine;
   - context-aware forecast;
   - local-first privacy;
   - AI boundary;
   - holdout evaluation;
   - tech stack;
   - limitations.
3. Add or update CONTRIBUTING.md.
4. Add or update SECURITY.md.
5. Add GitHub issue templates if absent.
6. Add docs listed in Stage 9 files if missing.
7. Do not auto-add a LICENSE unless one already exists or the user has explicitly approved a license.
8. If no LICENSE exists, keep README license section as TBD and document the license decision in docs/LICENSE_DECISION_STAGE9.md.
9. Add tests or lightweight checks only if appropriate.
10. Run npm test.

Boundaries:
- Do not modify /api/ranking.
- Do not modify rectification or forecast logic.
- Do not create a real .env.
- Do not write real API keys.
- Do not add login, payment, database, or user accounts.
- Do not make the repository public.
- Do not claim guaranteed accuracy.

Completion report in Chinese:
1. Modified files;
2. README sections updated;
3. Whether README is bilingual;
4. Whether proprietary internals were avoided;
5. Whether tests passed;
6. Whether Stage 09 acceptance is satisfied.
Do not commit until asked.
