$goal
请只修复 Stage 5D 审计中的 FAIL/PARTIAL 项，不要扩展新功能。

禁止：
1. 不要进入 Stage 5E。
2. 不要做 Future Forecast。
3. 不要接新 AI provider。
4. 不要修改 /api/ranking。
5. 不要修改 /api/prediction 行为。
6. 不要让 context_box 影响 rectification。
7. 不要让 AI 影响 rectification。
8. 不要创建真实 .env。
9. 不要写真实 API key。
10. 不要做登录、支付、数据库、用户系统。
11. 不要做紫微、奇门、风水。

请先复述 FAIL/PARTIAL 项，然后做最小修复。

允许修复：
- 补测试；
- 修评分公式；
- 修 config 读取；
- 修 EventTimingFit 输出字段；
- 修 DefaultChart protection；
- 修 evidence table；
- 修 missing_information / warnings；
- 修 context_box 泄漏；
- 修 API metadata。

修复后运行：

npm test

完成后中文汇报：

1. 修复了哪些问题；
2. 修改了哪些文件；
3. 新增/修改了哪些测试；
4. 测试结果；
5. Stage 5D 是否现在 PASS；
6. 是否可以 commit。

不要自动 commit。
