$goal
请只修 Stage 4 build/test/debug 问题，不要扩展新功能。

流程：
1. 复现失败：运行 npm test。
2. 找到最小失败原因。
3. 做最小修改。
4. 再运行 npm test。
5. 汇报修改文件、失败原因、测试结果。

禁止：
- 不要让 AI 参与 ranking。
- 不要改 scoring weights。
- 不要新增 UI 框架。
- 不要新增登录/支付/数据库。
- 不要提交真实 API key。
