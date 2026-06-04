# State Management Round 03

Round 03 不做数据库和持久化用户系统。

## State Strategy

使用浏览器端 session object 或 server 内存中的临时对象即可。

推荐最简单结构：

```ts
type UiSession = {
  birthInput?: BirthInput;
  symbolAnswers?: SymbolAnswer[];
  hourGroupPrior?: HourGroupPrior;
  candidates?: CandidateChart[];
  lifeEvents?: LifeEvent[];
  contextFacts?: ContextFact[];
  ranking?: CandidateScore[];
};
```

## Privacy

- 不写入真实用户数据到 repo。
- 不把 demo 输入持久化到数据库。
- 不生成包含真实私人命例的 fixture。
- fixture 只能使用虚构样例。

## Ranking Boundary

Context facts 可以展示在 Step 4，但 Round 03 不应让 context_box 影响 candidate ranking，除非现有 deterministic ranking 已明确支持该字段。

必须在 UI 中说明：context_box 用于 Round 04 之后的 AI prediction，不是 Round 03 的定盘依据。
