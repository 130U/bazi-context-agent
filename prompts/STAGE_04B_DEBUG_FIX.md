$goal
只修复 Stage 4B 审计中的 FAIL/PARTIAL 项，不要扩展新功能。

禁止：

- 不要进入 Stage 4C。
- 不要开发报告导出。
- 不要做 UI polish。
- 不要修改 `/api/ranking` 边界。
- 不要让 OpenAI provider 进入 ranking path。
- 不要让 context_box 回流 ranking。
- 不要创建真实 `.env`。
- 不要写入真实 API key。
- 不要在测试中发真实 OpenAI 网络请求。
- 不要把 key 暴露到 browser HTML/JS。
- 不要引入 `langchain`、`llamaindex`、`@ai-sdk` 或 agent framework。
- 不要做登录、支付、数据库、用户系统。

请先复述审计中的 FAIL/PARTIAL 项，然后逐项最小修复。

允许修复：

- provider selection bug
- env handling bug
- fake client 测试
- schema validation bug
- `/api/prediction` policy 字段缺失
- 缺少测试
- 错误地读取真实 key
- 错误地让 provider 影响 ranking
- 文档/checklist 不一致

修复后运行：

```powershell
$env:Path='C:\Program Files\nodejs;' + $env:Path; npm.cmd test
```

完成后中文汇报：

1. 修复了哪些问题；
2. 修改了哪些文件；
3. 新增/修改了哪些测试；
4. 测试结果；
5. Stage 4B 是否现在 PASS；
6. 是否可以 commit。

不要自动 commit。
