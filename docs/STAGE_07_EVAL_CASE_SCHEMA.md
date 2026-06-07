# Stage 7 Eval Case Schema

## EvalCase

```ts
type EvalCase = {
  case_id: string;
  schema_version: "stage7.v1";
  anonymized: boolean;

  cutoff_date: string;
  forecast_horizon: "3_months" | "6_months" | "1_year" | "3_years" | "10_years";

  target_domains: ForecastDomain[];
  hidden_targets: HiddenTarget[];

  allowed_inputs: {
    recorded_birth_time?: RecordedBirthTime;
    selected_chart?: unknown;
    default_chart?: unknown;
    derivative_profile?: BaziDerivedProfile;
    context_box?: ContextFact[];
    known_life_events?: LifeEvent[];
    user_question: string;
  };

  redaction_policy: {
    redacted_fields: string[];
    redacted_terms: string[];
    post_cutoff_events_removed: boolean;
  };

  mode_overrides?: Record<string, unknown>;

  metadata: {
    source: "synthetic" | "user_contributed" | "curated_private";
    quality: "low" | "medium" | "high";
    notes?: string[];
  };
};
```

## HiddenTarget

```ts
type HiddenTarget = {
  target_id: string;
  domain: ForecastDomain;
  label: string;
  occurred?: boolean;
  year?: number;
  confidence: number;
  acceptable_answers: string[];
  unacceptable_leakage_terms: string[];
};
```

## EvalCase rule

Never put the hidden target in `allowed_inputs`.
