# BaZi Context Agent

**Which hour were you born, and what is happening in your life now? I built a system where the second answer can never change the first.**

[Open the experience](https://www.theodoreoy.com/bazi-context-agent/) · [Full story](../README.md) · [中文](README.zh-CN.md)

```text
Derivative function = BaZi variables + derived BaZi structure
Initial value       = user-controlled real-world context
Forecast            = derivative function + initial value + current date + forecast horizon
```

- Chart derivation, candidate generation, and ranking are deterministic code.
- Context enters after the working-chart lock and has no path back to the ranking.
- Models join only after the lock, and the public experience calls none.
- Four evaluation modes and a leakage guard separate recall of known facts from forecasting.
- 146 automated tests, strict types, generated-config parity, and static security checks form the release gate.
