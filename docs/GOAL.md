# GOAL

用传统验时辰 symbol 做弱先验，
用重大人生年份做确定性回测，
用信息框补足用户现实初始值，
最后让 AI 在已定八字和已知上下文上做预测，而不是让 AI 参与定八字。

## MVP Boundary

Round 01 only proves the deterministic spine:

- collect structured birth input;
- collect traditional symbol answers;
- generate candidate hour groups with deterministic code;
- score candidates with deterministic code;
- output Top 3 candidates and evidence;
- keep AI out of candidate ranking.
