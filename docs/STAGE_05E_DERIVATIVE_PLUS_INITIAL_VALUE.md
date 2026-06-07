# Stage 5E: Derivative Function + Initial Value

## Unified product language

```text
导函数 = 八字 + 八字派生运势结构
initial value = 问卷得到的现实初始状态
未来预测 = AI 使用「导函数 + initial value」推未来
```

## Derivative function

`derivative_function` is the `BaziDerivedProfile`.

It may include:

```text
- eight variables / four pillars
- day master
- five elements
- ten gods
- hidden stems
- nayin
- stars
- shensha
- relations: clash, combination, punishment, harm
- luck cycles
- annual fortunes
- source library metadata
- assumptions
- warnings
```

## Initial value

`initial_value` comes from questionnaire/context.

It may include:

```text
- growth city
- family support
- parental education and occupation
- sibling structure
- birth order
- education level
- current identity
- actual career/education path
- inner preferred direction
- preferred life outcomes
- recent focus/anxiety
- known life events
```

## Why separate these two

Stage 6 forecast must be able to say:

```text
Chart signal:
...

Initial-value adjustment:
...

Actual prediction:
...
```

This separation prevents the AI from pretending that known user facts are predictions.

## Example

Bad:

```text
I predict you have elite education.
```

If user already disclosed it, correct:

```text
Known fact:
The user disclosed elite education.

Chart signal:
The BaZi profile suggests unstable but high-pressure learning pattern.

Initial-value adjustment:
Strong family support and elite education raise career baseline.

Prediction:
The next transition is more likely to involve high-competition professional or entrepreneurial environments.
```
