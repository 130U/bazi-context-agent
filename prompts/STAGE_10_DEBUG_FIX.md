$goal
Fix only Stage 10 audit failures. Do not expand scope.

Allowed fixes:
- move root clutter into archive folders;
- update README links;
- fix static demo HTML/CSS/JS;
- fix GitHub Pages workflow;
- fix privacy/secret redaction copy;
- fix tests around root hygiene or site existence.

Forbidden:
- changing ranking;
- changing rectification;
- changing forecast engine;
- changing evaluation engine;
- adding real AI calls;
- adding real `.env`;
- adding API keys;
- adding login/payment/database/user system;
- changing repo visibility.

After fixing, run npm test and report results in Chinese.
Do not commit.
