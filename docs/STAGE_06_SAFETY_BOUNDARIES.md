# Stage 6 Safety Boundaries

## Forecast language

Use calibrated language:

```text
higher likelihood
risk window
opportunity window
watch for
likely pressure area
not deterministic
```

Avoid:

```text
guaranteed
certainly
must happen
medical diagnosis
legal advice
investment recommendation
```

## Known facts

Known facts must be labeled as known facts. They must not be presented as predictions.

## Sensitive data

The forecast result must not include:

```text
API keys
.env content
GitHub tokens
local absolute paths
raw provider secrets
```

## User agency

The forecast should include action-oriented guidance, but it must preserve user agency:

```text
recommended_actions
decision checkpoints
questions to clarify
```

## Boundaries metadata

Every result must include:

```text
ai_used_for_forecast
ai_used_for_ranking=false
ai_used_for_rectification=false
ranking_modified=false
rectification_modified=false
selected_chart_modified=false
secrets_included=false
```
