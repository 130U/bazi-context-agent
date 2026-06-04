# QUESTIONNAIRE ENGINE ROUND 02

The questionnaire engine is a TypeScript business module, not a UI.

It reads `configs/question_bank.v1.json` and supports:

- `getQuestionsByLayer(bank, layer)`;
- `validateAnswer(question, answer)`;
- `isQuestionVisible(question, answers)`;
- `getNextQuestion(session)`.

Supported answer types:

- `single_choice`;
- `multi_choice`;
- `short_text`;
- `date`;
- `time_or_range`;
- `year_event`;
- `year_event_list`.

Validation covers required answers, legal options, max text length, reasonable year format, event type presence, max items, optional skip answers, career condition, childbearing condition, and optional birth posture.

Question text remains in `configs/question_bank.v1.json`; business logic references question ids and metadata only.
