# Stage 10 Visual Design

## Design direction

Use a restrained editorial-intelligence interface:

- warm-white canvas with graphite text;
- copper accents and low-saturation green status cues;
- system typography with compact display tracking and comfortable body leading;
- evidence-first hierarchy with minimal, purposeful depth;
- right-side report-contract preview;
- high contrast;
- no ornamental metaphysics clichés.

## Color tokens

```css
--paper: #F4F0E8;
--surface: #FFFDF8;
--ink: #20211E;
--muted: #686861;
--copper: #A65F3F;
--green: #5D7265;
```

## Typography

Use local/system fonts only:

```css
font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

Use tighter tracking for large headings and comfortable leading for body/UI.

Do not load paid fonts or external font files.

## Layout inspiration

Borrow general patterns, not proprietary assets:

- editorial split workspace;
- explicit fixture input + structured report contract;
- cards with progressive disclosure;
- “Explore the walkthrough” CTA above the fold;
- four-stage pipeline and status strip for deterministic / local / no-key demo.

## Accessibility

- Maintain text contrast.
- Use visible focus states.
- Buttons must be keyboard reachable.
- Buttons should respond immediately on press.
- Respect `prefers-reduced-motion`, `prefers-reduced-transparency`, and `prefers-contrast`.
- Avoid tiny low-contrast text.
