$goal
Stop and correct Stage 9 scope creep.

Stage 9 is only GitHub release polish:
- README;
- docs;
- contribution/security files;
- issue templates;
- release checklist.

Remove or revert any changes that:
- alter chart ranking;
- alter rectification;
- alter forecast logic;
- add new provider;
- add login/payment/database;
- expose secrets;
- claim guaranteed accuracy;
- expose private scoring/prompt internals.

Run npm test and report.
Do not commit.
