# NO AI BOUNDARY ROUND 02

Round 02 remains deterministic.

Forbidden before candidate ranking:

- OpenAI;
- Anthropic;
- Gemini;
- LangChain;
- LlamaIndex;
- any LLM call;
- API keys or `.env` secrets;
- prompt-based birth-hour decisions.

Allowed:

- deterministic questionnaire validation;
- deterministic symbol scoring;
- deterministic candidate generation;
- deterministic event backtest stub;
- deterministic ranking.

Tests scan the candidate-ranking path for AI provider imports or calls.
