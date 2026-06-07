# Stage 10 Visual Design

## Design direction

Use a modern AI product interface:

- deep Duke Blue background;
- glassmorphism panels;
- serif display headline;
- restrained sans-serif UI labels;
- right-side live preview;
- subtle gradients;
- high contrast;
- no ornamental metaphysics clichés.

## Color tokens

```css
--duke-blue: #012169;
--duke-royal: #00539B;
--paper: #F8F6EF;
--ink: #101828;
--muted: #667085;
--line: rgba(255,255,255,0.18);
--glass: rgba(255,255,255,0.10);
--gold: #C99700;
```

## Typography

Use local/system fonts only:

```css
font-family: Georgia, "Times New Roman", ui-serif, serif;
```

for hero headings, and:

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

for body/UI.

Do not load paid fonts or external font files.

## Layout inspiration

Borrow general patterns, not proprietary assets:

- AI workspace split layout;
- conversational input + structured output;
- cards with progressive disclosure;
- “Try demo” CTA above the fold;
- status badges for deterministic / local / no-key demo.

## Accessibility

- Maintain text contrast.
- Use visible focus states.
- Buttons must be keyboard reachable.
- Avoid tiny low-contrast text.
