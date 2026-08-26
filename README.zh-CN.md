# 八字 Context Agent

一个 deterministic-first 的八字校盘与上下文增强预测研究原型。

交互体验：https://www.theodoreoy.com/bazi-context-agent/

## 核心公式

```text
导函数 = 八字八变量 + 八字派生结构
初始值 = 用户可控的现实上下文
未来预测 = 导函数 + 初始值 + 当前日期 + 预测周期
```

## 差异点

- 定盘、候选盘、校盘走确定性 pipeline。
- AI 只在定盘和校盘完成后用于预测、解释和报告。
- context_box 可以用于预测，但不能回流影响 ranking 或 rectification。
- A/B/C/D evaluation 用于区分「复述已知事实」和「预测」。
- 公开 Pages 版本只使用标签页内存；本地预览与 API 服务复用同一套正式界面，不再维护第二套 UI。
- 严格 TypeScript 检查、生成配置一致性、静态站点校验和 140+ 自动化测试共同构成发布门禁。

详见主 README。
