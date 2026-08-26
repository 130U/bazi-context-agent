import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { pathToFileURL } from "node:url";
import { generateCandidateHours } from "./candidateGeneration.ts";
import { createDefaultChart, generateCandidateChartsV2, normalizeBoundaryFlags } from "./chartGenerationStage5C.ts";
import { normalizeContextBox } from "./contextBox.ts";
import { loadQuestionBank, loadScoringConfig } from "./config.ts";
import { scoreEventBacktest } from "./eventBacktest.ts";
import { assertEvalCase } from "./evalCaseSchema.ts";
import { classifyPredictionDomain } from "./predictionDomain.ts";
import { buildForecastInput, ForecastInputBuildError } from "./forecastInputBuilder.ts";
import { FutureForecastError, runFutureForecast } from "./futureForecastEngine.ts";
import { runBenchmark } from "./benchmarkRunner.ts";
import { runPredictionWithConfiguredProvider } from "./predictionProvider.ts";
import { rankCandidates } from "./ranking.ts";
import { buildPredictionReport } from "./reportBuilder.ts";
import { reportToMarkdown } from "./reportMarkdown.ts";
import { runRectificationV2 } from "./rectificationV2.ts";
import { scoreSymbolPrior } from "./symbolPrior.ts";
import { validateForecastInput } from "./forecastInputValidator.ts";
import { PUBLIC_SITE_CSP, servePublicSite } from "./publicSite.ts";
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
import type { PredictionRequest, PredictionResult, RankingSnapshot } from "./predictionTypes.ts";
import type { RectificationLifeEvent, RectificationV2Request } from "./rectificationTypes.ts";
import type { ReportExportFormat } from "./reportTypes.ts";
import type { RecordedBirthTime } from "./baziTypes.ts";
import type { EvaluationModeId, ModeOutput } from "./evalTypes.ts";

type JsonValue = Record<string, unknown>;

const MAX_JSON_BODY_BYTES = 256 * 1024;

class HttpInputError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const HOUR_GROUP_KEYS: HourGroupId[] = ["G1_zi_wu_mao_you", "G2_yin_shen_si_hai", "G3_chen_xu_chou_wei"];
const UNCERTAINTY_RANGES = new Set<BirthInput["uncertaintyRange"]>(["recorded_only", "adjacent_1_shichen", "adjacent_2_shichen", "full_day", "auto"]);
const CHART_SEX_VALUES = new Set<ChartSex>(["male", "female", "prefer_not_to_say"]);

function json(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, {
    "cache-control": "no-store",
    "content-security-policy": `${PUBLIC_SITE_CSP}; sandbox`,
    "content-type": "application/json; charset=utf-8",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff"
  });
  response.end(JSON.stringify(body));
}

function error(response: ServerResponse, status: number, code: string, message: string): void {
  json(response, status, { error: { code, message } });
}

async function readJson(request: IncomingMessage): Promise<JsonValue> {
  const contentType = request.headers["content-type"]?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/json") {
    throw new HttpInputError(415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type must be application/json.");
  }
  const advertisedLength = Number(request.headers["content-length"]);
  if (Number.isFinite(advertisedLength) && advertisedLength > MAX_JSON_BODY_BYTES) {
    throw new HttpInputError(413, "PAYLOAD_TOO_LARGE", "Request body exceeds the 256 KB limit.");
  }
  const chunks: Buffer[] = [];
  let receivedBytes = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    receivedBytes += buffer.byteLength;
    if (receivedBytes > MAX_JSON_BODY_BYTES) {
      throw new HttpInputError(413, "PAYLOAD_TOO_LARGE", "Request body exceeds the 256 KB limit.");
    }
    chunks.push(buffer);
  }
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as JsonValue;
  } catch {
    throw new HttpInputError(400, "INVALID_JSON", "Request body must contain valid JSON.");
  }
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function arrayOfStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function exportFormat(value: unknown): ReportExportFormat {
  return value === "markdown" ? "markdown" : "json";
}

function normalizeBirthInput(input: unknown): BirthInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("birth_input is required.");
  const record = input as JsonValue;
  const birthDate = text(record.birthDate ?? record.birth_date);
  const birthplace = text(record.birthplace ?? record.birth_place);
  const recordedTime = text(record.recordedTime ?? record.recorded_time);
  const uncertaintyRange = text(record.uncertaintyRange ?? record.uncertainty_range) as BirthInput["uncertaintyRange"];
  const chartSex = text(record.chartSex ?? record.chart_sex) as ChartSex;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) throw new Error("birth_input.birth_date must use YYYY-MM-DD.");
  if (!birthplace || birthplace.length > 120) throw new Error("birth_input.birthplace is required and must not exceed 120 characters.");
  if (!UNCERTAINTY_RANGES.has(uncertaintyRange)) throw new Error("birth_input.uncertainty_range is invalid.");
  if (!CHART_SEX_VALUES.has(chartSex)) throw new Error("birth_input.chart_sex is invalid.");
  if (uncertaintyRange !== "full_day" && !/^([01]\d|2[0-3]):[0-5]\d$/.test(recordedTime)) {
    throw new Error("birth_input.recorded_time must use HH:MM unless the full day is uncertain.");
  }
  return {
    birthDate,
    birthplace,
    recordedTime: recordedTime || undefined,
    uncertaintyRange,
    boundaryFlags: arrayOfStrings(record.boundaryFlags ?? record.boundary_flags) as BoundaryFlag[],
    chartSex
  };
}

function normalizeSymbolAnswers(input: unknown): SymbolAnswer[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((item): item is JsonValue => Boolean(item) && typeof item === "object" && !Array.isArray(item))
    .map((item) => ({
      questionId: text(item.questionId ?? item.question_id),
      answerId: text(item.answerId ?? item.answer_id ?? item.value)
    }))
    .filter((item) => item.questionId.length > 0 && item.answerId.length > 0);
}

function normalizeLifeEvents(input: unknown): LifeEvent[] {
  if (!Array.isArray(input)) return [];
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

function normalizeRectificationLifeEvents(input: unknown): RectificationLifeEvent[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((item): item is JsonValue => Boolean(item) && typeof item === "object" && !Array.isArray(item))
    .map((item, index) => ({
      event_id: text(item.event_id, `event_${item.year ?? index + 1}`),
      year: Number(item.year),
      month: typeof item.month === "number" ? item.month : undefined,
      event_type: text(item.event_type ?? item.type, "major_turning_point"),
      description: typeof item.description === "string" ? item.description : undefined,
      importance: text(item.importance, "medium") as RectificationLifeEvent["importance"]
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

function normalizeRecordedBirthTime(input: unknown): RecordedBirthTime {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("recorded_birth_time is required.");
  }
  const record = input as JsonValue;
  const birthDate = text(record.birth_date ?? record.date);
  if (!birthDate) throw new Error("recorded_birth_time.birth_date is required.");
  const birthTime = typeof (record.birth_time ?? record.time) === "string" ? text(record.birth_time ?? record.time) : undefined;
  return {
    ...(record as unknown as RecordedBirthTime),
    birth_date: birthDate,
    date: birthDate,
    birth_time: birthTime,
    time: birthTime,
    certainty: text(record.certainty, "exact_to_minute") as RecordedBirthTime["certainty"],
    boundary_flags: normalizeBoundaryFlags(record.boundary_flags),
    assumptions: arrayOfStrings(record.assumptions)
  };
}

function labels(prior: HourGroupPriorResult): Record<"G1" | "G2" | "G3", { label: string; score: number }> {
  const byGroup = new Map<HourGroupId, HourGroupPrior>(prior.entries.map((entry) => [entry.group, entry]));
  return {
    G1: { label: byGroup.get("G1_zi_wu_mao_you")?.label ?? "子午卯酉", score: prior.prior.G1_zi_wu_mao_you },
    G2: { label: byGroup.get("G2_yin_shen_si_hai")?.label ?? "寅申巳亥", score: prior.prior.G2_yin_shen_si_hai },
    G3: { label: byGroup.get("G3_chen_xu_chou_wei")?.label ?? "辰戌丑未", score: prior.prior.G3_chen_xu_chou_wei }
  };
}

function priorFromPayload(payload: unknown, scoringConfig: ScoringConfig): HourGroupPriorResult | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as JsonValue;
  if (record.prior && Array.isArray(record.entries)) return record as unknown as HourGroupPriorResult;
  const values = record as Partial<Record<HourGroupId, unknown>>;
  if (!HOUR_GROUP_KEYS.some((group) => typeof values[group] === "number")) return null;
  const uniformPrior = scoringConfig.legacy_ranking.uniform_group_prior;
  const prior = {
    G1_zi_wu_mao_you: Number(values.G1_zi_wu_mao_you ?? uniformPrior),
    G2_yin_shen_si_hai: Number(values.G2_yin_shen_si_hai ?? uniformPrior),
    G3_chen_xu_chou_wei: Number(values.G3_chen_xu_chou_wei ?? uniformPrior)
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

export async function handleRequest(request: IncomingMessage, response: ServerResponse): Promise<void> {
  const url = new URL(request.url ?? "/", "http://127.0.0.1");
  try {
    if (!url.pathname.startsWith("/api/")) return servePublicSite(request, response);
    const origin = request.headers.origin;
    if (origin && new URL(origin).host !== request.headers.host) {
      return error(response, 403, "ORIGIN_NOT_ALLOWED", "Cross-origin API requests are not allowed.");
    }
    if (request.method === "GET" && url.pathname === "/api/questionnaire") {
      const bank = loadQuestionBank();
      return json(response, 200, { layers: bank.stages.map((stage) => stage.id), questions: bank });
    }
    if (request.method === "POST" && url.pathname === "/api/symbol-prior") {
      const body = await readJson(request);
      const scoringConfig = loadScoringConfig();
      const birthInput = (body.birth_input ?? body.birthInput) as JsonValue | undefined;
      const chartSex = text(birthInput?.chart_sex ?? birthInput?.chartSex) as ChartSex;
      if (!CHART_SEX_VALUES.has(chartSex)) return error(response, 400, "INVALID_CHART_SEX", "birth_input.chart_sex is required.");
      const symbolPrior = scoreSymbolPrior({ answers: normalizeSymbolAnswers(body.answers ?? body.symbol_answers), chartSex, scoringConfig });
      return json(response, 200, { ...labels(symbolPrior), evidence: symbolPrior.evidence, prior: symbolPrior });
    }
    if (request.method === "POST" && url.pathname === "/api/candidates") {
      const body = await readJson(request);
      const scoringConfig = loadScoringConfig();
      const birthInput = normalizeBirthInput(body.birth_input ?? body.birthInput);
      const prior = priorFromPayload(body.hour_group_prior, scoringConfig) ?? scoreSymbolPrior({ answers: [], chartSex: birthInput.chartSex, scoringConfig });
      const candidates = generateCandidateHours(birthInput, prior, scoringConfig);
      return json(response, 200, { candidates });
    }
    if (request.method === "POST" && url.pathname === "/api/default-chart") {
      const body = await readJson(request);
      const recordedBirthTime = normalizeRecordedBirthTime(body.recorded_birth_time ?? body.recordedBirthTime);
      const defaultChart = await createDefaultChart(recordedBirthTime);
      return json(response, 200, {
        default_chart: defaultChart,
        metadata: {
          ai_used: false,
          context_box_used: false,
          ranking_performed: false,
          stage: "5C"
        }
      });
    }
    if (request.method === "POST" && url.pathname === "/api/candidate-charts-v2") {
      const body = await readJson(request);
      const recordedBirthTime = normalizeRecordedBirthTime(body.recorded_birth_time ?? body.recordedBirthTime);
      const result = await generateCandidateChartsV2({
        recorded_birth_time: recordedBirthTime
      });
      return json(response, 200, result);
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
    if (request.method === "POST" && url.pathname === "/api/rectification-v2") {
      const body = await readJson(request);
      if (!body.default_chart || typeof body.default_chart !== "object") return error(response, 400, "MISSING_DEFAULT_CHART", "Rectification v2 requires default_chart.");
      const rectificationRequest: RectificationV2Request = {
        default_chart: body.default_chart as RectificationV2Request["default_chart"],
        candidates: Array.isArray(body.candidates) ? (body.candidates as RectificationV2Request["candidates"]) : [],
        life_events: normalizeRectificationLifeEvents(body.life_events ?? body.lifeEvents),
        symbol_prior: body.symbol_prior,
        bazi_derived_profiles: Array.isArray(body.bazi_derived_profiles) ? (body.bazi_derived_profiles as RectificationV2Request["bazi_derived_profiles"]) : undefined,
        options: body.options && typeof body.options === "object" ? (body.options as RectificationV2Request["options"]) : undefined
      };
      return json(response, 200, {
        result: runRectificationV2(rectificationRequest),
        metadata: {
          stage: "5D",
          ai_used: false,
          context_box_used_for_rectification: false,
          ranking_modified_by_ai: false
        }
      });
    }
    if (request.method === "POST" && url.pathname === "/api/forecast-input") {
      const body = await readJson(request);
      try {
        const forecastInput = buildForecastInput({
          current_date: typeof body.current_date === "string" ? body.current_date : undefined,
          timezone: typeof body.timezone === "string" ? body.timezone : undefined,
          user_question: typeof body.user_question === "string" ? body.user_question : undefined,
          forecast_horizon: typeof body.forecast_horizon === "string" ? body.forecast_horizon : undefined,
          forecast_domains: Array.isArray(body.forecast_domains) ? body.forecast_domains.map(String) : undefined,
          selected_chart: body.selected_chart as Parameters<typeof buildForecastInput>[0]["selected_chart"],
          rectification_result: body.rectification_result as Parameters<typeof buildForecastInput>[0]["rectification_result"],
          derivative_profile: body.derivative_profile as Parameters<typeof buildForecastInput>[0]["derivative_profile"],
          context_box: Array.isArray(body.context_box) ? body.context_box : [],
          known_life_events: Array.isArray(body.known_life_events) ? body.known_life_events : [],
          current_state: body.current_state,
          preferences: body.preferences
        });
        const validation = validateForecastInput(forecastInput);
        if (!validation.valid) return error(response, 400, "INVALID_FORECAST_INPUT_SCHEMA", validation.errors.join("; "));
        return json(response, 200, {
          forecast_input: forecastInput,
          validation,
          metadata: {
            stage: "5E",
            ai_used: false,
            ready_for_stage6: true,
            selected_chart_modified: false,
            rectification_result_modified: false
          }
        });
      } catch (caught) {
        if (caught instanceof ForecastInputBuildError) return error(response, 400, caught.code, caught.message);
        throw caught;
      }
    }
    if (request.method === "POST" && url.pathname === "/api/future-forecast") {
      const body = await readJson(request);
      try {
        const forecastInput = body.forecast_input;
        if (!forecastInput || typeof forecastInput !== "object") return error(response, 400, "MISSING_FORECAST_INPUT", "Future forecast requires forecast_input.");
        const result = await runFutureForecast({
          forecast_input: forecastInput as Parameters<typeof runFutureForecast>[0]["forecast_input"],
          options: body.options && typeof body.options === "object" ? (body.options as Parameters<typeof runFutureForecast>[0]["options"]) : undefined
        });
        return json(response, 200, {
          forecast_result: result,
          metadata: {
            stage: "6",
            schema_validated: true,
            ai_used_for_forecast: result.policy.ai_used_for_forecast,
            ai_used_for_ranking: false,
            ai_used_for_rectification: false
          }
        });
      } catch (caught) {
        if (caught instanceof FutureForecastError) return error(response, 400, caught.code, caught.message);
        throw caught;
      }
    }
    if (request.method === "POST" && url.pathname === "/api/benchmark") {
      const body = await readJson(request);
      const cases = Array.isArray(body.cases) ? body.cases.map(assertEvalCase) : [];
      if (cases.length === 0) return error(response, 400, "MISSING_EVAL_CASES", "Benchmark requires cases.");
      const modeOutputs =
        body.mode_outputs && typeof body.mode_outputs === "object"
          ? (body.mode_outputs as Record<string, Partial<Record<EvaluationModeId, ModeOutput>>>)
          : undefined;
      return json(response, 200, {
        benchmark_result: runBenchmark({ cases, mode_outputs: modeOutputs }),
        metadata: {
          stage: "7",
          ai_used: false,
          real_network_used: false,
          ranking_modified: false,
          rectification_modified: false,
          forecast_input_modified: false
        }
      });
    }
    if (request.method === "POST" && url.pathname === "/api/prediction") {
      const body = await readJson(request);
      const snapshot = body.rankingSnapshot ?? body.ranking_snapshot;
      if (!snapshot || typeof snapshot !== "object") return error(response, 400, "MISSING_RANKING_SNAPSHOT", "Prediction requires a frozen rankingSnapshot.");
      const rankingSnapshot = snapshot as unknown as RankingSnapshot;
      const question = text(body.question, "general prediction");
      const domain = text(body.domain, classifyPredictionDomain(question));
      const predictionRequest: PredictionRequest = {
        question,
        domain: classifyPredictionDomain(`${domain} ${question}`),
        rankingSnapshot,
        contextBox: normalizeContextBox(body.contextBox ?? body.context_box),
        lifeEvents: normalizeLifeEvents(body.lifeEvents ?? body.life_events)
      };
      const prediction = await runPredictionWithConfiguredProvider(predictionRequest);
      if (prediction.error) return error(response, prediction.error.code === "PROVIDER_CONFIG_ERROR" ? 400 : 502, prediction.error.code, prediction.error.message);
      return json(response, 200, prediction.result);
    }
    if (request.method === "POST" && url.pathname === "/api/report") {
      const body = await readJson(request);
      const snapshot = body.rankingSnapshot ?? body.ranking_snapshot;
      if (!snapshot || typeof snapshot !== "object") return error(response, 400, "MISSING_RANKING_SNAPSHOT", "Report requires a frozen rankingSnapshot.");
      const predictionResult = body.predictionResult ?? body.prediction_result;
      if (!predictionResult || typeof predictionResult !== "object") return error(response, 400, "MISSING_PREDICTION_RESULT", "Report requires a predictionResult.");
      const rankingSnapshot = snapshot as unknown as RankingSnapshot;
      const report = buildPredictionReport({
        rankingSnapshot,
        contextBox: normalizeContextBox(body.contextBox ?? body.context_box),
        predictionResult: predictionResult as PredictionResult,
        exportFormat: exportFormat(body.exportFormat ?? body.export_format)
      });
      const format = exportFormat(body.exportFormat ?? body.export_format);
      if (format === "markdown") return json(response, 200, { format, report, markdown: reportToMarkdown(report) });
      return json(response, 200, { format, report });
    }
    return error(response, 404, "NOT_FOUND", "Route not found.");
  } catch (caught) {
    if (caught instanceof HttpInputError) return error(response, caught.status, caught.code, caught.message);
    return error(response, 400, "INVALID_INPUT", "Invalid request.");
  }
}

export function createBaziUiServer(): Server {
  const server = createServer((request, response) => {
    void handleRequest(request, response);
  });
  server.requestTimeout = 15_000;
  server.headersTimeout = 10_000;
  server.keepAliveTimeout = 5_000;
  server.maxRequestsPerSocket = 100;
  return server;
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
