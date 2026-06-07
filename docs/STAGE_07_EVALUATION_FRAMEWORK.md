# Stage 7 Evaluation Framework

## Why evaluation is needed

Without evaluation, the product can look accurate simply because it has already collected many facts from the user.

Stage 7 separates:

```text
known facts
hidden targets
model predictions
scoring
```

The benchmark must detect when a prediction is actually just leakage from disclosed facts.

## Evaluation philosophy

1. Use historical holdout whenever possible.
2. Freeze an evaluation cutoff date.
3. Hide target outcomes after the cutoff.
4. Build separate input modes.
5. Compare outputs against hidden truth.
6. Track leakage violations separately from accuracy.
7. Avoid using user-provided target facts as predictions.

## Example

If evaluating education prediction:

```text
Allowed inputs:
- family background
- childhood city
- parental education
- early academic pattern
- major life events before cutoff

Hidden target:
- final highest education
- elite school indicator
```

The model cannot receive `highest_education` if that is the hidden target.

## Benchmark modes

The core comparison is:

```text
D = selected/rectified Bazi derivative + initial value
```

against:

```text
A = derivative only
B = initial value only
C = default chart + initial value
```

This tests whether the selected chart and context together add measurable value.
