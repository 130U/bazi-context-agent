# API Contract Round 03

Round 03 的 API/handler 是 UI 和 deterministic core 之间的薄层。它不能重新实现 scoring，也不能调用 AI。

## GET /api/questionnaire

Response:

```json
{
  "layers": ["birth_input", "symbol_prior", "event_backtest", "context_box"],
  "questions": {}
}
```

必须从 `configs/question_bank.v1.json` 或现有 questionnaire engine 读取。

## POST /api/symbol-prior

Request:

```json
{
  "answers": []
}
```

Response:

```json
{
  "G1": { "label": "子午卯酉", "score": 0.33 },
  "G2": { "label": "寅申巳亥", "score": 0.33 },
  "G3": { "label": "辰戌丑未", "score": 0.34 },
  "evidence": []
}
```

## POST /api/candidates

Request:

```json
{
  "birth_input": {},
  "hour_group_prior": {}
}
```

Response:

```json
{
  "candidates": []
}
```

Candidate count should normally be 2–6.

## POST /api/ranking

Request:

```json
{
  "birth_input": {},
  "symbol_answers": [],
  "life_events": [],
  "context_facts": []
}
```

Response:

```json
{
  "top_candidates": [],
  "evidence_table": [],
  "contradictions": [],
  "missing_information": []
}
```

Every top candidate must include:
- candidate_id。
- score。
- confidence。
- evidence。

## Error Shape

Errors should be structured:

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "..."
  }
}
```
