# Stage 6 Domain Forecasts

## Supported domains

```text
career
wealth
relationship
education
migration
health
family
personal_growth
general
```

## Domain selection

The engine should derive forecast domains from:

```text
ForecastInput.forecast_request.forecast_domains
user_question
context_box
```

Domain classification can be deterministic for Stage 6. AI may provide domain-specific text but must not invent unsupported domains.

## Domain structure

Each domain forecast must include:

```text
conclusion
forecast
confidence
derivative_basis
initial_value_basis
time_windows
caveats
```

## Health domain guard

For health, output must remain general and non-medical:

```text
Use "压力/恢复/作息/风险意识" language.
Do not diagnose.
Do not recommend medical treatment.
```

## Wealth domain guard

For wealth, avoid financial certainty:

```text
Do not give investment advice.
Do not guarantee gains/losses.
Use risk and timing language.
```
