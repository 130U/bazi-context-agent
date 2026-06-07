# Stage 8 Session Schema

## SessionState

```ts
type SessionState = {
  session_id: string;
  schema_version: "stage8.session.v1";
  created_at: string;
  updated_at: string;

  birth_input?: unknown;
  questionnaire_answers?: unknown[];
  symbol_prior?: unknown;

  default_chart?: unknown;
  candidate_charts?: unknown[];
  rectification_result?: unknown;
  bazi_derived_profile?: unknown;

  context_box: ContextFactControl[];
  known_life_events?: unknown[];

  forecast_input?: unknown;
  future_forecast_result?: unknown;
  reports?: unknown[];

  user_controls: UserControlState;
  privacy_metadata: PrivacyMetadata;
};
```

## ContextFactControl

```ts
type ContextFactControl = {
  fact_id: string;
  category: string;
  field: string;
  value: unknown;
  source: string;
  confidence?: number;
  fact_type?: "direct_fact" | "inferred_fact" | "derived_fact";
  visibility: {
    use_in_forecast: boolean;
    include_in_export: boolean;
    include_in_report: boolean;
  };
  deleted_at?: string | null;
};
```

## UserControlState

```ts
type UserControlState = {
  persistent_storage_enabled: boolean;
  export_redaction_enabled: boolean;
  report_redaction_enabled: boolean;
  hidden_fact_ids: string[];
  deleted_fact_ids: string[];
};
```

## PrivacyMetadata

```ts
type PrivacyMetadata = {
  local_only: boolean;
  cloud_sync_enabled: false;
  secrets_included: false;
  api_keys_included: false;
  last_exported_at?: string;
  last_cleared_at?: string;
};
```

## Rule

Deleted facts must not preserve sensitive value in hidden metadata.
