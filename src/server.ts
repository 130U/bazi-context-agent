import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { pathToFileURL } from "node:url";
import { generateCandidateHours } from "./candidateGeneration.ts";
import { loadQuestionBank, loadScoringConfig } from "./config.ts";
import { scoreEventBacktest } from "./eventBacktest.ts";
import { rankCandidates } from "./ranking.ts";
import { scoreSymbolPrior } from "./symbolPrior.ts";
import type {
  BirthInput,
  BoundaryFlag,
  CandidateChart,
  CandidateRankingResult,
  ChartSex,
  ContextFact,
  EventBacktestResult,
  HourGroupId,
  HourGroupPrior,
  HourGroupPriorResult,
  LifeEvent,
  ScoringConfig,
  SymbolAnswer
} from "./types.ts";

type JsonValue = Record<string, unknown>;

const DEFAULT_BIRTH_INPUT: BirthInput = {
  birthDate: "1998-05-10",
  birthplace: "demo-city",
  recordedTime: "22:50",
  uncertaintyRange: "auto",
  boundaryFlags: ["near_hour_boundary", "near_zi_hour"],
  chartSex: "female"
};

const DEFAULT_SYMBOL_ANSWERS: SymbolAnswer[] = [
  { questionId: "B1_hair_whorl", answerId: "one_offset" },
  { questionId: "B4_little_finger_length", answerId: "aligned" },
  { questionId: "B6_sleep_posture", answerId: "side" }
];

const DEFAULT_LIFE_EVENTS: LifeEvent[] = [
  { year: 2018, type: "education", description: "fictional education event" },
  { year: 2021, type: "career", description: "fictional career direction change" }
];

const HOUR_GROUP_KEYS: HourGroupId[] = ["G1_zi_wu_mao_you", "G2_yin_shen_si_hai", "G3_chen_xu_chou_wei"];

function json(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

function html(response: ServerResponse, body: string): void {
  response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  response.end(body);
}

function error(response: ServerResponse, status: number, code: string, message: string): void {
  json(response, status, { error: { code, message } });
}

async function readJson(request: IncomingMessage): Promise<JsonValue> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as JsonValue;
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function arrayOfStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normalizeBirthInput(input: unknown): BirthInput {
  const record = (input && typeof input === "object" ? input : {}) as JsonValue;
  return {
    birthDate: text(record.birthDate ?? record.birth_date, DEFAULT_BIRTH_INPUT.birthDate),
    birthplace: text(record.birthplace ?? record.birth_place, DEFAULT_BIRTH_INPUT.birthplace),
    recordedTime: text(record.recordedTime ?? record.recorded_time, DEFAULT_BIRTH_INPUT.recordedTime),
    uncertaintyRange: text(record.uncertaintyRange ?? record.uncertainty_range, DEFAULT_BIRTH_INPUT.uncertaintyRange) as BirthInput["uncertaintyRange"],
    boundaryFlags: arrayOfStrings(record.boundaryFlags ?? record.boundary_flags) as BoundaryFlag[],
    chartSex: text(record.chartSex ?? record.chart_sex, DEFAULT_BIRTH_INPUT.chartSex) as ChartSex
  };
}

function normalizeSymbolAnswers(input: unknown): SymbolAnswer[] {
  if (!Array.isArray(input)) return DEFAULT_SYMBOL_ANSWERS;
  return input
    .filter((item): item is JsonValue => Boolean(item) && typeof item === "object" && !Array.isArray(item))
    .map((item) => ({
      questionId: text(item.questionId ?? item.question_id),
      answerId: text(item.answerId ?? item.answer_id ?? item.value)
    }))
    .filter((item) => item.questionId.length > 0 && item.answerId.length > 0);
}

function normalizeLifeEvents(input: unknown): LifeEvent[] {
  if (!Array.isArray(input)) return DEFAULT_LIFE_EVENTS;
  return input
    .filter((item): item is JsonValue => Boolean(item) && typeof item === "object" && !Array.isArray(item))
    .map((item) => ({
      year: Number(item.year),
      type: text(item.type ?? item.event_type, "major_turning") as LifeEvent["type"],
      description: typeof item.description === "string" ? item.description : undefined,
      confidence: typeof item.confidence === "number" ? item.confidence : undefined
    }))
    .filter((item) => Number.isInteger(item.year));
}

function normalizeContextFacts(input: unknown): ContextFact[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((item): item is JsonValue => Boolean(item) && typeof item === "object" && !Array.isArray(item))
    .map((item, index) => ({
      id: text(item.id ?? item.field, `context_${index + 1}`),
      value: typeof item.value === "string" || Array.isArray(item.value) ? item.value : JSON.stringify(item.value ?? ""),
      source: "user_answer" as const,
      confidence: typeof item.confidence === "number" ? item.confidence : 0.5,
      factType: "known_user_fact" as const
    }));
}

function labels(prior: HourGroupPriorResult): Record<"G1" | "G2" | "G3", { label: string; score: number }> {
  const byGroup = new Map<HourGroupId, HourGroupPrior>(prior.entries.map((entry) => [entry.group, entry]));
  return {
    G1: { label: byGroup.get("G1_zi_wu_mao_you")?.label ?? "子午卯酉", score: prior.prior.G1_zi_wu_mao_you },
    G2: { label: byGroup.get("G2_yin_shen_si_hai")?.label ?? "寅申巳亥", score: prior.prior.G2_yin_shen_si_hai },
    G3: { label: byGroup.get("G3_chen_xu_chou_wei")?.label ?? "辰戌丑未", score: prior.prior.G3_chen_xu_chou_wei }
  };
}

function priorFromPayload(payload: unknown): HourGroupPriorResult | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as JsonValue;
  if (record.prior && Array.isArray(record.entries)) return record as unknown as HourGroupPriorResult;
  const values = record as Partial<Record<HourGroupId, unknown>>;
  if (!HOUR_GROUP_KEYS.some((group) => typeof values[group] === "number")) return null;
  const prior = {
    G1_zi_wu_mao_you: Number(values.G1_zi_wu_mao_you ?? 1 / 3),
    G2_yin_shen_si_hai: Number(values.G2_yin_shen_si_hai ?? 1 / 3),
    G3_chen_xu_chou_wei: Number(values.G3_chen_xu_chou_wei ?? 1 / 3)
  };
  return {
    prior,
    raw_scores: prior,
    entries: HOUR_GROUP_KEYS.map((group) => ({ group, label: group, prior: prior[group], evidence: [] })),
    evidence: [],
    missing_information: [],
    warning: "Symbol evidence is weak and cannot determine birth hour alone."
  };
}

export function rankCandidatesForRectification(input: {
  candidates: CandidateChart[];
  symbolPrior: HourGroupPriorResult;
  eventBacktests: EventBacktestResult[];
  scoringConfig: ScoringConfig;
}): CandidateRankingResult {
  return rankCandidates({
    candidates: input.candidates,
    symbol_prior_result: input.symbolPrior,
    event_backtest_results: input.eventBacktests,
    contextFacts: [],
    scoringConfig: input.scoringConfig
  }) as CandidateRankingResult;
}

function runDeterministicFlow(payload: JsonValue = {}) {
  const scoringConfig = loadScoringConfig();
  const birthInput = normalizeBirthInput(payload.birth_input ?? payload.birthInput);
  const symbolAnswers = normalizeSymbolAnswers(payload.symbol_answers ?? payload.symbolAnswers ?? payload.answers);
  const lifeEvents = normalizeLifeEvents(payload.life_events ?? payload.lifeEvents);
  const contextFacts = normalizeContextFacts(payload.context_facts ?? payload.contextFacts);
  const symbolPrior = scoreSymbolPrior({ answers: symbolAnswers, chartSex: birthInput.chartSex, scoringConfig });
  const candidates = generateCandidateHours(birthInput, symbolPrior, scoringConfig);
  const eventBacktests = scoreEventBacktest(candidates, lifeEvents);
  const ranking = rankCandidatesForRectification({ candidates, symbolPrior, eventBacktests, scoringConfig });
  return { birthInput, symbolAnswers, lifeEvents, contextFacts, symbolPrior, candidates, eventBacktests, ranking };
}

function homePage(): string {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>BaZi Context Agent</title>
  <style>
    :root { color-scheme: light; font-family: Arial, "Microsoft YaHei", sans-serif; background: #f6f7f9; color: #1f2933; }
    body { margin: 0; }
    main { max-width: 1040px; margin: 0 auto; padding: 28px 20px 48px; }
    h1 { margin: 0 0 8px; font-size: 32px; }
    h2 { font-size: 19px; margin: 0 0 12px; }
    section { border-top: 1px solid #d9dee7; padding: 22px 0; }
    .notice { padding: 12px 14px; border-left: 4px solid #2f6fed; background: #eef4ff; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 12px; }
    .item { border: 1px solid #d9dee7; border-radius: 8px; background: white; padding: 12px; }
    .label { font-size: 12px; color: #52606d; margin-bottom: 6px; }
    pre { overflow: auto; white-space: pre-wrap; background: #111827; color: #f9fafb; border-radius: 8px; padding: 14px; }
    button { border: 0; border-radius: 6px; padding: 10px 14px; background: #1f6feb; color: white; cursor: pointer; }
  </style>
</head>
<body>
<main>
  <h1>BaZi Context Agent</h1>
  <p class="notice">Recorded birth time is a prior, not truth. Symbol prior is weak and cannot determine the chart alone. Context box is saved for later prediction review and is not used for Round 03 chart ranking.</p>
  <section id="birth_input"><h2>Step 1: birth_input</h2><div class="grid" data-layer="birth_input"></div></section>
  <section id="symbol_prior"><h2>Step 2: symbol_prior</h2><div class="grid" data-layer="symbol_prior"></div><pre id="prior">Loading prior...</pre></section>
  <section id="event_backtest"><h2>Step 3: event_backtest</h2><div class="grid" data-layer="event_backtest"></div><pre id="candidates">Loading candidates...</pre></section>
  <section id="context_box"><h2>Step 4: context_box preview</h2><div class="grid" data-layer="context_box"></div><pre id="context-preview">Context facts preview only; not part of Round 03 ranking.</pre></section>
  <section id="ranking_result"><h2>Step 5: ranking_result</h2><button id="run">Run deterministic ranking</button><pre id="ranking">Waiting...</pre></section>
</main>
<script>
const sample = {
  birth_input: { birth_date: "1998-05-10", birth_place: "Shanghai, China", recorded_time: "22:50", uncertainty_range: "auto", boundary_flags: ["near_hour_boundary", "near_zi_hour"], chart_sex: "female" },
  symbol_answers: [
    { question_id: "B1_hair_whorl", value: "one_offset" },
    { question_id: "B4_little_finger_length", value: "aligned" },
    { question_id: "B6_sleep_posture", value: "side" }
  ],
  life_events: [
    { year: 2018, event_type: "education", description: "fictional education event" },
    { year: 2021, event_type: "career", description: "fictional direction change" }
  ],
  context_facts: [{ field: "desired_direction", value: "fictional creative technology direction", confidence: 0.5 }]
};
async function post(url, body) {
  const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  return res.json();
}
function renderQuestions(data) {
  for (const stage of data.questions.stages) {
    const target = document.querySelector('[data-layer="' + stage.id + '"]');
    if (!target) continue;
    target.innerHTML = stage.questions.map((q) => '<div class="item"><div class="label">' + q.id + '</div>' + q.title + '</div>').join('');
  }
}
async function run() {
  const ranking = await post('/api/ranking', sample);
  document.getElementById('ranking').textContent = JSON.stringify(ranking, null, 2);
}
async function init() {
  const questionnaire = await fetch('/api/questionnaire').then((res) => res.json());
  renderQuestions(questionnaire);
  document.getElementById('prior').textContent = JSON.stringify(await post('/api/symbol-prior', { answers: sample.symbol_answers, birth_input: sample.birth_input }), null, 2);
  document.getElementById('candidates').textContent = JSON.stringify(await post('/api/candidates', { birth_input: sample.birth_input }), null, 2);
  document.getElementById('context-preview').textContent = JSON.stringify(sample.context_facts, null, 2);
  document.getElementById('run').addEventListener('click', run);
  run();
}
init();
</script>
</body>
</html>`;
}

export async function handleRequest(request: IncomingMessage, response: ServerResponse): Promise<void> {
  const url = new URL(request.url ?? "/", "http://127.0.0.1");
  try {
    if (request.method === "GET" && url.pathname === "/") return html(response, homePage());
    if (request.method === "GET" && url.pathname === "/api/questionnaire") {
      const bank = loadQuestionBank();
      return json(response, 200, { layers: bank.stages.map((stage) => stage.id), questions: bank });
    }
    if (request.method === "POST" && url.pathname === "/api/symbol-prior") {
      const body = await readJson(request);
      const scoringConfig = loadScoringConfig();
      const birthInput = normalizeBirthInput(body.birth_input ?? body.birthInput);
      const symbolPrior = scoreSymbolPrior({ answers: normalizeSymbolAnswers(body.answers ?? body.symbol_answers), chartSex: birthInput.chartSex, scoringConfig });
      return json(response, 200, { ...labels(symbolPrior), evidence: symbolPrior.evidence, prior: symbolPrior });
    }
    if (request.method === "POST" && url.pathname === "/api/candidates") {
      const body = await readJson(request);
      const scoringConfig = loadScoringConfig();
      const birthInput = normalizeBirthInput(body.birth_input ?? body.birthInput);
      const prior = priorFromPayload(body.hour_group_prior) ?? scoreSymbolPrior({ answers: DEFAULT_SYMBOL_ANSWERS, chartSex: birthInput.chartSex, scoringConfig });
      const candidates = generateCandidateHours(birthInput, prior, scoringConfig);
      return json(response, 200, { candidates });
    }
    if (request.method === "POST" && url.pathname === "/api/ranking") {
      const flow = runDeterministicFlow(await readJson(request));
      return json(response, 200, {
        top_candidates: flow.ranking.top_3,
        candidates: flow.ranking.candidates,
        evidence_table: flow.ranking.evidence_table,
        contradictions: flow.ranking.contradictions,
        missing_information: flow.ranking.missing_information,
        should_not_force_single_hour: flow.ranking.should_not_force_single_hour,
        ranking_context_policy: "context_box_preview_only_not_used_for_ranking",
        context_facts_used_for_ranking: 0,
        context_box_preview: flow.contextFacts,
        candidates_considered: flow.candidates,
        symbol_prior: { ...labels(flow.symbolPrior), warning: flow.symbolPrior.warning },
        event_backtest: flow.eventBacktests
      });
    }
    return error(response, 404, "NOT_FOUND", "Route not found.");
  } catch (caught) {
    return error(response, 400, "INVALID_INPUT", caught instanceof Error ? caught.message : "Invalid request.");
  }
}

export function createBaziUiServer(): Server {
  return createServer((request, response) => {
    void handleRequest(request, response);
  });
}

export function startBaziUiServer(port = Number(process.env.PORT ?? 3000), host = "127.0.0.1"): Server {
  const server = createBaziUiServer();
  server.listen(port, host, () => {
    const address = server.address();
    const actualPort = typeof address === "object" && address ? address.port : port;
    console.log(`BaZi Context Agent UI: http://${host}:${actualPort}`);
  });
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startBaziUiServer();
}
