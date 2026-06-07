# Stage 7 Modes A/B/C/D

## Mode A: derivative_only

Input:

```text
BaziDerivedProfile only
```

Purpose:

```text
Measures what the Bazi derivative function contributes by itself.
```

No context_box.

## Mode B: initial_value_only

Input:

```text
context_box + known_life_events only
```

Purpose:

```text
Measures what the questionnaire initial value contributes by itself.
```

No BaziDerivedProfile.

## Mode C: default_chart_plus_initial_value

Input:

```text
DefaultChart-derived BaziDerivedProfile + initial_value
```

Purpose:

```text
Measures whether using the user-recorded time without rectification is enough.
```

## Mode D: selected_chart_plus_initial_value_full_system

Input:

```text
SelectedChart / RectificationResultV2 + BaziDerivedProfile + initial_value
```

Purpose:

```text
Measures the full product.
```

## Claim

The product claim is supported only if:

```text
D > A
D > B
D >= C
```

Across enough high-quality eval cases.

## Important

Stage 7 should not fake superiority. If D does not win, report it.
