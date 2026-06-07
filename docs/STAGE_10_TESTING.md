# Stage 10 Testing

## Required checks

1. `npm test` passes.
2. `site/index.html` exists.
3. `site/styles.css` exists.
4. `site/app.js` exists.
5. Static demo can be opened locally.
6. GitHub Pages workflow exists.
7. README includes interactive demo CTA.
8. Root clutter files moved or documented.
9. No real API key.
10. No `.env` file.
11. No changes to ranking, rectification, forecast, or evaluation logic.
12. No login/payment/database/user system added.

## Optional local static check

If a static server is available:

```bash
npx http-server site
```

But do not add a dependency just for this unless necessary.
