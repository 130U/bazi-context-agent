# Prior art

A BaZi reading product sits where an old divination practice meets three well-studied failure modes: readings that
feel right because they are general, predictions that score well because the answer leaked into the input, and
language models that agree with their users. I studied each before designing the system. This page records what
each line of work establishes, where it stops, and what BaZi Context Agent takes from it or adds beyond it.

## The short version

| Work | What it establishes | Where it stops | What BaZi Context Agent does |
| --- | --- | --- | --- |
| Traditional birth-hour rectification | Candidate hours are tested against dated life events and against signs of the three hour groups | Done by a practitioner who already knows the client's story; weights live in the practitioner's head | Encodes the evidence types as configuration, and asks about the present only after the hour is locked |
| Forer (1949) | Generic descriptions are accepted as accurate personal portraits | A demonstration about readers, not a design rule | Makes fit impossible to manufacture: the story cannot reach the hour |
| Carlson (1985) | Readings can be judged double-blind against facts the reader never saw | A one-off experiment | Builds the blind comparison into a permanent harness with four modes |
| Kaufman et al. (2012) | Leakage, information about the target in the input, makes measured performance an artifact | Formulated for data mining | Treats context-driven rectification as leakage and prevents it by construction |
| Sharma et al. (2023) | Assistants trained on human preferences tend to agree with what the user believes | Describes the model, not the product around it | Keeps every model off the ranking path, enforced by a source scan |
| Chat-based AI readings | A language model can interpret a chart fluently and personally | The model chooses, explains and is judged by the same conversation | Separates choosing (code) from interpreting (after the lock) |

## Notes

### Traditional birth-hour rectification

When a client is unsure of the hour, a practitioner compares candidate hours against events whose dates are known:
a move, a marriage, a death in the family, the best and worst years. The practice also uses signs associated with
the three hour groups (Zi-Wu-Mao-You, Yin-Shen-Si-Hai, Chen-Xu-Chou-Wei), such as birth order. The evidence types
are sound and I kept them. What the practice cannot do is separate the evidence from the practitioner: the same
person who hears the life story chooses the hour, with weights no one can inspect. BaZi Context Agent writes every
question and weight into configuration, scores dated events at 55%, hour-group signs at 25% and the birth record at
20%, and treats hour-group signs as a weak prior that cannot finalize the hour on its own.

### Forer, "The fallacy of personal validation" (1949)

[doi](https://doi.org/10.1037/h0059240) · Forer gave his students one generic personality sketch, presented as
individual, and they rated it as highly accurate. The result explains why fit is weak evidence for any reading. A
reading system that tunes the chart to the client's story adds a second, structural layer to the same effect: the
selected hour fits because the story selected it. The working-chart lock removes that layer.

### Carlson, "A double-blind test of astrology" (1985)

[doi](https://doi.org/10.1038/318419a0) · Published in Nature, the study asked astrologers to match charts to
personality profiles they could not otherwise identify, and scored the matches against chance. Its lasting
contribution is the design: a reading is judged against facts it was never shown. BaZi Context Agent turns that
design into a standing instrument, with holdout construction, temporal filtering and four modes that isolate what
the chart, the context and rectification each contribute.

### Kaufman, Rosset, Perlich and Stitelman, "Leakage in data mining" (2012)

[doi](https://doi.org/10.1145/2382577.2382579) · The paper defines leakage as information about the target that
reaches the model's inputs, shows how common and how flattering it is, and argues that it must be prevented when
the data is built rather than detected afterwards. Choosing a birth hour with the present-life story is leakage in a
reading: the story is the target the reading will be judged on. The two-stage design prevents it at the source, and
the evaluation harness carries a leakage guard that penalizes any mode whose input contains its own target.

### Sharma et al., "Towards understanding sycophancy in language models" (2023)

[arXiv](https://arxiv.org/abs/2310.13548) · Across several production assistants the paper finds a consistent
tendency to agree with the user's stated views, and traces it to human preference data. For a reading product the
consequence is direct: a model asked which hour fits a person drifts toward the hour the person hopes for. No model
sits on the ranking path. Tests read the ranking modules and the server and fail on any provider import or call,
and in the research pipeline optional providers join only after the lock.

### Chat-based AI readings

The common AI reading product hands the chart and the conversation to one model, which chooses, explains and
predicts in the same exchange. It is fluent and personal, and every one of the failure modes above applies at once:
the model sees the story before it sees the hour, it is inclined to agree, and nothing it says can be scored against
held-out facts. The sibling project [Divination and Destiny Studies](https://github.com/130U/ENGINEERING-Divination-and-Destiny-Studies)
takes the opposite position deliberately, letting a model compare candidates under strict evidence rules. The two
products mark the ends of the design space.

## Where the product goes further

1. **A temporal wall.** The working-chart lock separates choosing the hour from reading the present, enforced at the
   engine, the server and the source level.
2. **Rectification as readable configuration.** Every question and weight in two files, with fail-closed scoring.
3. **Earned confidence.** An adaptive stop at a margin and coverage gate, a visibly provisional lock, and a symmetric
   start when the time is unknown.
4. **A chart as a derivative.** Forecasts are solutions from the person's present, at a chosen date and horizon.
5. **An instrument before any claim.** Four modes, holdout construction and a leakage guard.
