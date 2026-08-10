# Stage 10 Visual Design

## Design direction

Use a quiet, question-led evidence gallery:

- neutral gallery-white canvas with charcoal text;
- one restrained blue accent plus semantic red only for adjustment pressure;
- system typography with compact display tracking and comfortable body leading;
- evidence-first hierarchy with minimal, purposeful depth;
- one thesis and a two-stage method rail on the welcome view;
- one question at a time in Stage 1;
- dated time windows, domain outlook, provenance, and uncertainty in Stage 2;
- high contrast;
- no ornamental metaphysics clichés, looping orbits, or decorative card walls.

## Color tokens

```css
--canvas: #F7F7F5;
--surface: #FFFFFF;
--ink: #202124;
--muted: #6F7378;
--accent: #496A9B;
--accent-dark: #2F4F7D;
```

## Typography

Use local/system fonts only:

```css
font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

Use tighter tracking for large headings and comfortable leading for body/UI.

Do not load paid fonts or external font files.

## Layout inspiration

Borrow general principles, not proprietary assets or page composition:

- question-led curiosity and generous whitespace;
- stable navigation with a clear task endpoint;
- progressively disclosed evidence rather than decorative density;
- a report that separates inference, context, provenance, and uncertainty;
- no copied artwork, brand colors, navigation taxonomy, or content-feed layout.

## Privacy interaction

- Public sessions stay in tab memory only.
- Do not offer save or resume controls in the Pages experience.
- Entry, refresh, page exit, and explicit exit remove this app's known legacy storage keys.
- The primary destructive control says “退出并清除”; never clear unrelated same-origin storage.

## Accessibility

- Maintain text contrast.
- Use visible focus states.
- Buttons must be keyboard reachable.
- Buttons should respond immediately on press.
- Respect `prefers-reduced-motion`, `prefers-reduced-transparency`, and `prefers-contrast`.
- Avoid tiny low-contrast text.
