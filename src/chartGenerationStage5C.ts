import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { getBaziEngineAdapter } from "./baziAdapterFactory.ts";
import { getHourBranchForTime, wrapBranchIndex } from "./hourDefinitions.ts";
import { EARTHLY_BRANCHES, type EarthlyBranch } from "./types.ts";
import type {
  BaziCalculationMode,
  BaziDerivedProfile,
  BaziEngineAdapter,
  BirthTimeCertainty,
  BoundaryFlag,
  CandidateChartV2,
  CandidateGenerationInput,
  ChartGenerationPolicy,
  ChartGenerationResult,
  DefaultChart,
  FixedPillars,
  RecordedBirthCertainty,
  RecordedBirthTime
} from "./baziTypes.ts";

const DEFAULT_POLICY: ChartGenerationPolicy = {
  version: "stage5c.v1",
  default_candidate_limit: 6,
  full_day_candidate_limit: 12,
  unknown_date_day_span: 1,
  recorded_time_prior_scores: {
    exact_to_minute: 1,
    within_1_hour: 0.85,
    approximate_hour: 0.7,
    time_range: 0.6,
    part_of_day: 0.45,
    unknown_time: 0.2,
    unknown_date: 0.05
  },
  part_of_day_windows: {
    morning: ["Mao", "Chen", "Si"],
    afternoon: ["Wu", "Wei", "Shen"],
    evening: ["You", "Xu", "Hai"],
    night: ["Hai", "Zi", "Chou"],
    unknown: []
  },
  metadata: {
    ai_allowed: false,
    context_box_allowed: false,
    ranking_allowed: false
  }
};

const BRANCH_WINDOWS: Record<EarthlyBranch, Array<[number, number]>> = {
  Zi: [
    [0, 60],
    [23 * 60, 24 * 60]
  ],
  Chou: [[60, 180]],
  Yin: [[180, 300]],
  Mao: [[300, 420]],
  Chen: [[420, 540]],
  Si: [[540, 660]],
  Wu: [[660, 780]],
  Wei: [[780, 900]],
  Shen: [[900, 1020]],
  You: [[1020, 1140]],
  Xu: [[1140, 1260]],
  Hai: [[1260, 1380]]
};

const BRANCH_REPRESENTATIVE_TIMES: Record<EarthlyBranch, string> = {
  Zi: "00:30",
  Chou: "02:00",
  Yin: "04:00",
  Mao: "06:00",
  Chen: "08:00",
  Si: "10:00",
  Wu: "12:00",
  Wei: "14:00",
  Shen: "16:00",
  You: "18:00",
  Xu: "20:00",
  Hai: "22:00"
};

const CANONICAL_BOUNDARY: Record<string, BoundaryFlag> = {
  near_zi_boundary: "near_zi_hour",
  near_jieqi: "near_solar_term",
  date_uncertain: "near_date_boundary",
  timezone_uncertain: "possible_timezone_issue"
};

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function jsonPolicyPath(): string {
  return fileURLToPath(new URL("../configs/chart_generation_policy.stage5c.json", import.meta.url));
}

export function loadChartGenerationPolicy(): ChartGenerationPolicy {
  try {
    const parsed = JSON.parse(readFileSync(jsonPolicyPath(), "utf8")) as Partial<ChartGenerationPolicy>;
    return {
      ...DEFAULT_POLICY,
      ...parsed,
      recorded_time_prior_scores: {
        ...DEFAULT_POLICY.recorded_time_prior_scores,
        ...(parsed.recorded_time_prior_scores ?? {})
      },
      part_of_day_windows: {
        ...DEFAULT_POLICY.part_of_day_windows,
        ...(parsed.part_of_day_windows ?? {})
      },
      metadata: DEFAULT_POLICY.metadata
    };
  } catch {
    return DEFAULT_POLICY;
  }
}

export function normalizeBirthTimeCertainty(certainty: RecordedBirthCertainty | undefined): BirthTimeCertainty {
  if (certainty === "exact") return "exact_to_minute";
  if (certainty === "approximate") return "approximate_hour";
  if (certainty === "range") return "time_range";
  return certainty ?? "exact_to_minute";
}

export function normalizeBoundaryFlags(flags: unknown): BoundaryFlag[] {
  if (!Array.isArray(flags)) return [];
  return unique(
    flags
      .filter((flag): flag is string => typeof flag === "string" && flag.length > 0)
      .map((flag) => CANONICAL_BOUNDARY[flag] ?? (flag as BoundaryFlag))
  );
}

function birthDate(input: RecordedBirthTime): string {
  const date = input.birth_date ?? input.date;
  if (!date) throw new Error("RecordedBirthTime requires birth_date or date.");
  return date;
}

function birthTime(input: RecordedBirthTime): string | undefined {
  const time = input.birth_time ?? input.time;
  return time && time !== "unknown" ? time : undefined;
}

function normalizedRecordedBirthTime(input: RecordedBirthTime, overrides: Partial<RecordedBirthTime> = {}): RecordedBirthTime {
  const date = overrides.birth_date ?? overrides.date ?? input.birth_date ?? input.date;
  const time = overrides.birth_time ?? overrides.time ?? input.birth_time ?? input.time;
  return {
    ...input,
    ...overrides,
    calendar_type: overrides.calendar_type ?? input.calendar_type ?? "solar",
    birth_date: date,
    date,
    birth_time: time,
    time,
    certainty: overrides.certainty ?? input.certainty ?? "exact_to_minute",
    boundary_flags: normalizeBoundaryFlags(overrides.boundary_flags ?? input.boundary_flags),
    assumptions: unique([...(input.assumptions ?? []), ...(overrides.assumptions ?? [])])
  };
}

function priorScore(certainty: BirthTimeCertainty, policy: ChartGenerationPolicy): number {
  return policy.recorded_time_prior_scores[certainty] ?? DEFAULT_POLICY.recorded_time_prior_scores[certainty] ?? 0.5;
}

function branchIndex(branch: EarthlyBranch): number {
  return EARTHLY_BRANCHES.indexOf(branch);
}

function adjacentBranches(branch: EarthlyBranch): EarthlyBranch[] {
  const index = branchIndex(branch);
  return [EARTHLY_BRANCHES[wrapBranchIndex(index - 1)], EARTHLY_BRANCHES[wrapBranchIndex(index + 1)]];
}

function timeToMinutes(time: string): number | null {
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return hour * 60 + minute;
}

function rangeIntervals(start: string, end: string): Array<[number, number]> {
  const startMinute = timeToMinutes(start);
  const endMinute = timeToMinutes(end);
  if (startMinute === null || endMinute === null) return [];
  if (startMinute <= endMinute) return [[startMinute, endMinute]];
  return [
    [startMinute, 24 * 60],
    [0, endMinute]
  ];
}

function overlaps(a: [number, number], b: [number, number]): boolean {
  return a[0] < b[1] && b[0] < a[1];
}

function branchesForRange(start: string, end: string): EarthlyBranch[] {
  const intervals = rangeIntervals(start, end);
  if (intervals.length === 0) return [];
  return EARTHLY_BRANCHES.filter((branch) => BRANCH_WINDOWS[branch].some((window) => intervals.some((interval) => overlaps(window, interval))));
}

function branchesForPartOfDay(partOfDay: string | undefined, policy: ChartGenerationPolicy): EarthlyBranch[] {
  const configured = policy.part_of_day_windows[partOfDay ?? "unknown"] ?? [];
  const roman = configured.filter((branch): branch is EarthlyBranch => (EARTHLY_BRANCHES as readonly string[]).includes(branch));
  if (roman.length > 0) return roman;
  const fallback: Record<string, EarthlyBranch[]> = {
    morning: ["Mao", "Chen", "Si"],
    afternoon: ["Wu", "Wei", "Shen"],
    evening: ["You", "Xu", "Hai"],
    night: ["Hai", "Zi", "Chou"],
    unknown: []
  };
  return fallback[partOfDay ?? "unknown"] ?? [];
}

function addDays(date: string, offset: number): string {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  parsed.setUTCDate(parsed.getUTCDate() + offset);
  return parsed.toISOString().slice(0, 10);
}

function fixedPillarsForBranch(fixedPillars: FixedPillars | undefined, branch: EarthlyBranch | null): FixedPillars | undefined {
  if (!fixedPillars) return undefined;
  if (!branch) return fixedPillars;
  return {
    ...fixedPillars,
    hour: {
      stem: fixedPillars.hour.stem,
      branch
    }
  };
}

async function deriveProfile(
  adapter: BaziEngineAdapter,
  chartId: string,
  input: RecordedBirthTime,
  branch: EarthlyBranch | null,
  mode: BaziCalculationMode
): Promise<{ profile?: BaziDerivedProfile; warnings: string[]; fixed_pillars?: FixedPillars }> {
  const fixedPillars = fixedPillarsForBranch(input.fixed_pillars, branch);
  try {
    if (fixedPillars && adapter.supports_fixed_pillars) {
      return {
        profile: await adapter.deriveFromFixedPillars(fixedPillars, { sourceChartId: chartId, calculationMode: mode }),
        warnings: [],
        fixed_pillars: fixedPillars
      };
    }
    return {
      profile: await adapter.deriveFromRecordedBirthTime(input, { sourceChartId: chartId, calculationMode: mode }),
      warnings: [],
      fixed_pillars: fixedPillars
    };
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "adapter derivation failed";
    return {
      warnings: [`adapter_warning:${message}`],
      fixed_pillars: fixedPillars
    };
  }
}

function defaultMetadata(): ChartGenerationResult["metadata"] {
  return {
    ai_used: false,
    context_box_used: false,
    ranking_performed: false,
    stage: "5C"
  };
}

export async function createDefaultChart(
  recordedBirthTime: RecordedBirthTime,
  adapter?: BaziEngineAdapter,
  policy = loadChartGenerationPolicy()
): Promise<DefaultChart> {
  const normalized = normalizedRecordedBirthTime(recordedBirthTime);
  const certainty = normalizeBirthTimeCertainty(normalized.certainty);
  const hasRecordedTime = Boolean(birthTime(normalized));
  const boundaryFlags = normalizeBoundaryFlags(normalized.boundary_flags);
  const selectedAdapter = adapter ?? (await getBaziEngineAdapter());
  const timeBranch = birthTime(normalized) ? getHourBranchForTime(birthTime(normalized) as string) : null;
  const chartId = "default_chart";
  const derived = await deriveProfile(selectedAdapter, chartId, normalized, timeBranch, "recorded_time");
  const warnings = [...derived.warnings];
  if (boundaryFlags.includes("near_solar_term")) warnings.push("near_solar_term_stub: exact solar-term expansion is deferred in Stage 5C.");
  return {
    chart_id: chartId,
    chart_role: "default",
    source: "recorded_birth_time",
    recorded_time_prior_score: priorScore(certainty, policy),
    birth_input: normalized,
    recorded_birth_time: normalized,
    fixed_pillars: derived.fixed_pillars,
    derived_profile: derived.profile,
    boundary_flags: boundaryFlags,
    assumptions: unique([
      hasRecordedTime ? "recorded_time_used_as_default_chart" : "unknown_time_has_no_protected_default_hour",
      ...(normalized.assumptions ?? [])
    ]),
    warnings,
    protection_policy: {
      protected_as_default: hasRecordedTime,
      can_be_overridden_only_by_strong_evidence: hasRecordedTime
    }
  };
}

function candidateSourceForReason(reason: string): CandidateChartV2["source"] {
  if (reason === "default") return "recorded_time";
  if (reason === "adjacent") return "adjacent_hour";
  if (reason === "range") return "uncertain_range";
  if (reason === "part_of_day") return "part_of_day";
  if (reason === "unknown_time") return "full_day";
  if (reason === "unknown_date") return "date_expansion";
  if (reason === "date_boundary") return "date_boundary";
  if (reason === "solar_term") return "solar_term_boundary";
  return "recorded_time_window";
}

async function buildCandidate(input: {
  recordedBirthTime: RecordedBirthTime;
  adapter: BaziEngineAdapter;
  branch: EarthlyBranch;
  date: string;
  reason: string;
  isDefault?: boolean;
  certainty: BirthTimeCertainty;
  policy: ChartGenerationPolicy;
  boundaryFlags: BoundaryFlag[];
  warnings?: string[];
}): Promise<CandidateChartV2> {
  const candidateId = input.isDefault ? "candidate_default" : `candidate_${input.date}_${input.branch}_${input.reason}`;
  const candidateBirthTime = normalizedRecordedBirthTime(input.recordedBirthTime, {
    birth_date: input.date,
    date: input.date,
    birth_time: BRANCH_REPRESENTATIVE_TIMES[input.branch],
    time: BRANCH_REPRESENTATIVE_TIMES[input.branch],
    fixed_pillars: fixedPillarsForBranch(input.recordedBirthTime.fixed_pillars, input.branch),
    certainty: input.recordedBirthTime.certainty,
    boundary_flags: input.boundaryFlags
  });
  const derived = await deriveProfile(input.adapter, candidateId, candidateBirthTime, input.branch, "candidate_time");
  return {
    candidate_id: candidateId,
    chart_role: "candidate",
    source: candidateSourceForReason(input.reason),
    birth_input: candidateBirthTime,
    candidate_birth_time: candidateBirthTime,
    candidate_date: input.date,
    hour_branch: input.branch,
    hour_branch_key: input.branch,
    fixed_pillars: derived.fixed_pillars,
    derived_profile: derived.profile,
    is_default_chart: input.isDefault ?? false,
    recorded_time_prior_score: input.isDefault ? priorScore(input.certainty, input.policy) : Math.max(0.05, priorScore(input.certainty, input.policy) - 0.15),
    generation_reasons: unique([input.reason, ...(input.isDefault ? ["default_chart_candidate"] : [])]),
    boundary_flags: input.boundaryFlags,
    assumptions: ["candidate_generated_without_rectification_scoring"],
    warnings: unique([...(input.warnings ?? []), ...derived.warnings])
  };
}

function candidateBranches(recordedBirthTime: RecordedBirthTime, certainty: BirthTimeCertainty, boundaryFlags: BoundaryFlag[], policy: ChartGenerationPolicy): Array<{ branch: EarthlyBranch; reason: string }> {
  const time = birthTime(recordedBirthTime);
  const recordedBranch = time ? getHourBranchForTime(time) : null;
  const result: Array<{ branch: EarthlyBranch; reason: string }> = [];
  const push = (branch: EarthlyBranch | null, reason: string) => {
    if (branch) result.push({ branch, reason });
  };

  push(recordedBranch, "default");

  if ((certainty === "within_1_hour" || certainty === "approximate_hour") && recordedBranch) {
    for (const branch of adjacentBranches(recordedBranch)) push(branch, "adjacent");
  }
  if (certainty === "time_range") {
    const range = recordedBirthTime.time_range;
    const branches = range ? branchesForRange(range.start, range.end) : [];
    for (const branch of branches) push(branch, "range");
  }
  if (certainty === "part_of_day") {
    for (const branch of branchesForPartOfDay(recordedBirthTime.part_of_day, policy)) push(branch, "part_of_day");
  }
  if (certainty === "unknown_time") {
    for (const branch of EARTHLY_BRANCHES) push(branch, "unknown_time");
  }
  if (boundaryFlags.includes("near_hour_boundary") && recordedBranch) {
    for (const branch of adjacentBranches(recordedBranch)) push(branch, "adjacent");
  }
  if (boundaryFlags.includes("near_zi_hour")) {
    for (const branch of ["Hai", "Zi", "Chou"] as EarthlyBranch[]) push(branch, "adjacent");
  }

  const seen = new Set<string>();
  return result.filter((entry) => {
    const key = `${entry.branch}:${entry.reason === "default" ? "default" : "expanded"}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function generateCandidateChartsV2(input: CandidateGenerationInput): Promise<ChartGenerationResult> {
  const policy = input.generation_policy ?? loadChartGenerationPolicy();
  const adapter = input.adapter ?? (await getBaziEngineAdapter());
  const normalized = normalizedRecordedBirthTime(input.recorded_birth_time);
  const certainty = normalizeBirthTimeCertainty(normalized.certainty);
  const boundaryFlags = normalizeBoundaryFlags(normalized.boundary_flags);
  const warnings: string[] = [];
  const defaultChart = input.default_chart ?? (await createDefaultChart(normalized, adapter, policy));
  const baseDate = birthDate(normalized);
  const branches = candidateBranches(normalized, certainty, boundaryFlags, policy);
  if (boundaryFlags.includes("near_solar_term")) warnings.push("near_solar_term_stub: exact solar-term expansion is deferred in Stage 5C.");
  if (boundaryFlags.includes("possible_timezone_issue")) warnings.push("timezone_issue_stub: timezone correction is deferred in Stage 5C.");
  if (boundaryFlags.includes("possible_dst_issue")) warnings.push("dst_issue_stub: daylight-saving correction is deferred in Stage 5C.");

  const candidateSpecs: Array<{ branch: EarthlyBranch; reason: string; date: string; warnings?: string[] }> = [];
  if (certainty === "unknown_date") {
    const span = policy.unknown_date_day_span ?? 1;
    const dateBranches = birthTime(normalized) ? [getHourBranchForTime(birthTime(normalized) as string) ?? "Zi"] : [...EARTHLY_BRANCHES];
    for (let offset = -span; offset <= span; offset += 1) {
      for (const branch of dateBranches) {
        candidateSpecs.push({
          branch,
          date: addDays(baseDate, offset),
          reason: offset === 0 && birthTime(normalized) ? "default" : "unknown_date",
          warnings: ["unknown_date_low_confidence"]
        });
      }
    }
  } else {
    for (const entry of branches) candidateSpecs.push({ ...entry, date: baseDate });
    if (boundaryFlags.includes("near_date_boundary")) {
      const branch = birthTime(normalized) ? getHourBranchForTime(birthTime(normalized) as string) ?? "Zi" : "Zi";
      candidateSpecs.push({ branch, date: addDays(baseDate, -1), reason: "date_boundary", warnings: ["near_date_boundary_expansion"] });
      candidateSpecs.push({ branch, date: addDays(baseDate, 1), reason: "date_boundary", warnings: ["near_date_boundary_expansion"] });
    }
  }

  if (boundaryFlags.includes("near_solar_term")) {
    const branch = birthTime(normalized) ? getHourBranchForTime(birthTime(normalized) as string) ?? "Zi" : "Zi";
    candidateSpecs.push({ branch, date: baseDate, reason: "solar_term", warnings: ["near_solar_term_stub"] });
  }

  const seen = new Set<string>();
  const deduped = candidateSpecs.filter((spec) => {
    const key = `${spec.date}:${spec.branch}:${spec.reason === "default" ? "default" : "expanded"}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const cap = certainty === "unknown_time" ? policy.full_day_candidate_limit : certainty === "unknown_date" ? 36 : Math.max(policy.default_candidate_limit, 6);
  const candidates = await Promise.all(
    deduped.slice(0, cap).map((spec) =>
      buildCandidate({
        recordedBirthTime: normalized,
        adapter,
        branch: spec.branch,
        date: spec.date,
        reason: spec.reason,
        isDefault: spec.reason === "default" && spec.date === baseDate,
        certainty,
        policy,
        boundaryFlags,
        warnings: spec.warnings
      })
    )
  );
  const combinedWarnings = unique([...warnings, ...defaultChart.warnings, ...candidates.flatMap((candidate) => candidate.warnings)]);
  return {
    default_chart: defaultChart,
    candidates,
    generation_summary: {
      candidate_count: candidates.length,
      uncertainty_level: certainty,
      boundary_flags: boundaryFlags,
      warnings: combinedWarnings
    },
    metadata: defaultMetadata()
  };
}
