# UI Flow Round 03

Round 03 的 UI 是 MVP prototype，不是正式产品前端。目标是让 PM 可以在浏览器中验证产品流程是否顺。

## 页面流程

### Step 1: Birth Input

展示并收集：
- 出生日期。
- 出生地。
- 记录出生时间。
- 时间不确定范围。
- 是否接近午夜、节气、时辰边界。
- 传统排盘用性别。

UI 说明：记录时间只是 prior，不是最终定盘依据。

### Step 2: Symbol Prior

展示并收集：
- 发旋。
- 胎次。
- 兄弟姐妹。
- 小指长度。
- 脸型。
- 自然睡姿。
- 出生姿势，如果知道。
- 童年家庭结构。

输出：
- G1 = 子午卯酉。
- G2 = 寅申巳亥。
- G3 = 辰戌丑未。
- 每组 normalized prior。

UI 必须提示：symbol prior 是弱先验，不能单独定盘。

### Step 3: Event Backtest

展示并收集：
- 1–3 个重大转折年份。
- 学业 / 考试 / 留学年份。
- 迁移年份。
- 感情年份。
- 健康 / 意外 / 手术年份。
- 家庭变化年份。
- 事业年份，条件题。
- 子女 / 生育年份，条件题。
- 最好年份 / 最差年份。

输出：
- event_timing_fit。
- matched_rules。
- contradictions。
- missing_information。

### Step 4: Context Box Preview

展示并收集：
- 成长城市。
- 父母教育和职业。
- 家庭支持方式。
- 家庭价值观。
- 当前最高教育经历。
- 当前身份。
- 内心真正想做的方向。
- 实际走过的方向。
- 最看重的人生结果。
- 过去 3 年主要投入或焦虑。

本轮只做 preview，不做 AI prediction。

### Step 5: Ranking Result

展示：
- Top 3 candidates。
- total score。
- confidence。
- evidence table。
- contradictions。
- missing_information。

UI 文案必须区分：
- symbol prior。
- event backtest evidence。
- context facts。
- actual prediction。

Round 03 不做 actual prediction。
