# Local Web Server Round 03

## 推荐实现

使用 Node.js 内置 HTTP server。

要求：
- 不引入 Express，除非 Codex 发现当前项目已经使用 Express；默认不要新增依赖。
- 不引入 React / Next.js / Vite / Vue / Svelte。
- server 只服务本地 demo。

## Scripts

在 `package.json` 中增加一个脚本：

```json
{
  "scripts": {
    "ui": "node src/server.ts"
  }
}
```

如果项目已有 script 命名规范，可以使用 `web` 或 `demo:ui`，但必须在汇报中说明。

## Server Requirements

- 默认 host: `127.0.0.1`
- 默认 port: `3000`
- 支持 `PORT` 环境变量。
- server module 应该导出可测试的 createServer 或 handler。
- 测试必须能 start 和 close server，避免端口残留。

## Routes / Handlers

最低要求：
- `GET /` returns HTML。
- `GET /api/questionnaire` returns question bank or grouped questionnaire summary。
- `POST /api/symbol-prior` returns HourGroupPrior。
- `POST /api/candidates` returns candidate charts。
- `POST /api/ranking` returns Top 3 ranking。

如果实现为 internal handlers 而非真实 HTTP routes，也可以，但 UI 必须能调用。
