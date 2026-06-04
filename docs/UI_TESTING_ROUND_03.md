# UI Testing Round 03

Round 03 必须保持已有测试通过，并新增最小 UI/server 测试。

## Required Tests

1. **Server Start/Close**
   - server 可以创建。
   - server 可以监听随机端口。
   - server 可以关闭。

2. **Home HTML**
   - `GET /` 或 equivalent handler 返回 HTML。
   - HTML 中包含产品名或关键步骤。

3. **Questionnaire API**
   - 返回四层问卷：birth_input, symbol_prior, event_backtest, context_box。

4. **Symbol API**
   - 返回 G1/G2/G3。
   - 包含中文 label：子午卯酉、寅申巳亥、辰戌丑未。

5. **Candidate API**
   - 返回 2–6 candidates。

6. **Ranking API**
   - 返回 Top 3。
   - 每个 candidate 有 confidence。
   - 返回 evidence table。
   - 返回 contradictions。
   - 返回 missing_information。

7. **No AI Boundary**
   - src 下无 AI provider import/call。
   - candidate ranking 前无 AI。

8. **No Heavy UI Framework**
   - package.json 不包含 React, Next, Vite, Vue, Svelte。
   - src 不包含 TSX/JSX。

## Test Command

使用现有测试方式：

```powershell
$env:Path='C:\Program Files\nodejs;' + $env:Path; npm test
```

或普通：

```bash
npm test
```
