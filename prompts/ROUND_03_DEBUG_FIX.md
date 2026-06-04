$goal
只修 Round 03 的测试或本地 UI 启动问题。不要开发新功能。

请先复现问题：
1. 运行 `npm test`。
2. 如有 UI 启动问题，运行 `npm run ui` 或 package.json 中对应命令。
3. 读取失败日志。

修复规则：
- 做最小修改。
- 不要改 scoring weights。
- 不要改 question bank 语义。
- 不要引入 React/Next/Vite/Vue/Svelte。
- 不要接 AI。
- 不要做登录、支付、用户系统。
- 不要添加数据库。
- 不要重写第一轮和第二轮的 deterministic scoring。

优先修复：
1. handler/API 输出字段缺失；
2. server start/close 不稳定；
3. Windows PATH 或端口占用问题；
4. tests 对字段命名和实际接口不一致；
5. UI 没有调用已有模块，而是硬编码结果。

完成后：
- 重新运行 npm test。
- 用中文汇报修改文件、失败原因、修复方式、测试结果。
- 测试通过前不要 commit。
