$goal
请只修复 Stage 5B 审计中的 FAIL/PARTIAL 项，不要扩展新功能。

禁止：
- 不要进入 Stage 5C；
- 不要做 rectification v2；
- 不要做 future forecast；
- 不要修改 /api/ranking scoring；
- 不要让 context_box 影响 ranking；
- 不要接新 AI provider；
- 不要创建真实 .env；
- 不要写 API key；
- 不要做登录、支付、数据库、用户系统。

允许修复：
- 类型缺失；
- BaziDerivedProfile 字段缺失；
- StaticBaziAdapter 输出结构不完整；
- adapter factory fallback bug；
- 测试缺失；
- 文档/checklist 不一致；
- lunar adapter import 边界问题。

修复后运行：

npm test

完成后中文汇报：
1. 修复了哪些问题；
2. 修改了哪些文件；
3. 测试结果；
4. Stage 5B 是否现在 PASS；
5. 是否可以 commit。

不要自动 commit。
