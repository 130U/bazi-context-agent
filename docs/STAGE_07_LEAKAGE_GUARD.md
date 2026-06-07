# Stage 7 Leakage Guard

## Why leakage matters

The system collects rich personal information. It must not claim to predict a fact the user already disclosed.

## Leakage types

### Direct leakage

Hidden target appears exactly in input.

Example:

```text
hidden target = Ivy League graduate degree
input context contains = Ivy League graduate degree
```

### Semantic leakage

Hidden target appears in a paraphrase.

Example:

```text
hidden target = overseas graduate school
input contains = studied at a top US graduate program
```

### Temporal leakage

Post-cutoff event appears in input.

Example:

```text
cutoff = 2020
input contains = moved to New York in 2022
```

### Report leakage

Prediction output says “known fact” when the fact was hidden, or reveals hidden label from fixture metadata.

## LeakageGuard output

```ts
type LeakageGuardResult = {
  passed: boolean;
  violations: LeakageViolation[];
  redacted_input: unknown;
};
```

## Rule

If leakage is detected, the eval case must be marked invalid or the score must be strongly penalized.
