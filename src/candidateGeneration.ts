import { EARTHLY_BRANCHES, type BirthInput, type BoundaryFlag, type CandidateChart, type CandidateSource, type EarthlyBranch, type HourGroupPrior, type HourGroupPriorResult, type ScoringConfig } from "./types.ts";
import { getHourBranchForTime, getHourDefinition, getHourGroupBranches, wrapBranchIndex } from "./hourDefinitions.ts";
import { loadScoringConfig } from "./config.ts";

function branchIndex(branch: EarthlyBranch): number {
  return EARTHLY_BRANCHES.indexOf(branch);
}

function boundaryRecord(flags: BoundaryFlag[]): Record<string, boolean> {
  return {
    near_midnight: flags.includes("near_midnight") || flags.includes("near_zi_hour"),
    near_hour_boundary: flags.includes("near_hour_boundary"),
    near_solar_term: flags.includes("near_solar_term"),
    possible_date_offset: flags.includes("date_may_shift")
  };
}

function addCandidate(
  candidates: Map<EarthlyBranch, CandidateChart>,
  branch: EarthlyBranch,
  source: CandidateSource,
  input: BirthInput,
  symbolPriorFit: number,
  scoringConfig: ScoringConfig,
  reason: string,
  missing: string[] = []
): void {
  const definition = getHourDefinition(branch);
  const existing = candidates.get(branch);
  if (existing) {
    existing.source_reasons = [...new Set([...existing.source_reasons, reason])];
    existing.missing_information = [...new Set([...existing.missing_information, ...missing])];
    return;
  }
  const flags = boundaryRecord(input.boundaryFlags);
  candidates.set(branch, {
    candidate_id: `candidate_${branch}`,
    branch,
    hour_name_cn: definition.hourNameCn,
    hour_group: definition.group,
    source_reasons: [reason],
    symbol_prior_fit: symbolPriorFit,
    birth_record_plausibility: scoringConfig.birth_record_plausibility[source],
    boundary_flags: flags,
    missing_information: missing,
    early_zi: branch === "Zi" && flags.near_midnight,
    late_zi: branch === "Zi" && flags.near_midnight,
    possible_date_offset: flags.possible_date_offset || (branch === "Zi" && flags.near_midnight)
  });
}

function priorFit(prior: HourGroupPriorResult, branch: EarthlyBranch, scoringConfig: ScoringConfig): number {
  const definition = getHourDefinition(branch);
  return prior.prior[definition.group] ?? scoringConfig.legacy_ranking.uniform_group_prior;
}

function sortedPriorEntries(prior: HourGroupPriorResult): HourGroupPrior[] {
  return [...prior.entries].sort((a, b) => b.prior - a.prior);
}

export function generateCandidateHours(input: BirthInput, prior: HourGroupPriorResult, scoringConfig = loadScoringConfig()): CandidateChart[] {
  const selection = scoringConfig.legacy_candidate_generation;
  const candidates = new Map<EarthlyBranch, CandidateChart>();
  const recordedBranch = input.recordedTime ? getHourBranchForTime(input.recordedTime) : null;
  const missingForBoundary = input.boundaryFlags.includes("near_solar_term") ? ["solar-term calendar calculation"] : [];
  const dateMissing = input.boundaryFlags.includes("date_may_shift") ? ["date-offset pillar calculation"] : [];

  if (!recordedBranch) {
    for (const entry of sortedPriorEntries(prior)) {
      for (const branch of getHourGroupBranches(entry.group)) {
        addCandidate(candidates, branch, "symbol_prior_added", input, priorFit(prior, branch, scoringConfig), scoringConfig, "unknown time: selected by strongest symbol-prior groups", [
          "recorded birth time",
          ...missingForBoundary,
          ...dateMissing
        ]);
        if (candidates.size >= selection.maximum_candidates) return [...candidates.values()];
      }
    }
  } else {
    const idx = branchIndex(recordedBranch);
    addCandidate(candidates, recordedBranch, "recorded", input, priorFit(prior, recordedBranch, scoringConfig), scoringConfig, "recorded birth time", [
      ...missingForBoundary,
      ...dateMissing
    ]);
    const shouldAddAdjacent = input.uncertaintyRange !== "recorded_only" || input.boundaryFlags.includes("near_hour_boundary") || input.boundaryFlags.includes("near_midnight");
    const adjacentRange = input.uncertaintyRange === "adjacent_2_shichen"
      ? selection.adjacent_2_shichen_radius
      : selection.adjacent_1_shichen_radius;
    if (shouldAddAdjacent) {
      for (let offset = 1; offset <= adjacentRange; offset += 1) {
        const prev = EARTHLY_BRANCHES[wrapBranchIndex(idx - offset)];
        const next = EARTHLY_BRANCHES[wrapBranchIndex(idx + offset)];
        addCandidate(candidates, prev, "adjacent", input, priorFit(prior, prev, scoringConfig), scoringConfig, "adjacent hour from uncertainty or boundary");
        addCandidate(candidates, next, "adjacent", input, priorFit(prior, next, scoringConfig), scoringConfig, "adjacent hour from uncertainty or boundary");
      }
    }
  }

  if (input.boundaryFlags.includes("near_midnight") || input.boundaryFlags.includes("near_zi_hour")) {
    for (const branch of ["Hai", "Zi", "Chou"] as const) {
      addCandidate(candidates, branch, "boundary_expanded", input, priorFit(prior, branch, scoringConfig), scoringConfig, "Zi-hour midnight boundary expansion", [
        "early/late Zi date rollover convention"
      ]);
    }
  }

  for (const entry of sortedPriorEntries(prior)) {
    if ([...candidates.values()].some((candidate) => candidate.hour_group === entry.group)) continue;
    const branch = getHourGroupBranches(entry.group)[0];
    addCandidate(candidates, branch, "symbol_prior_added", input, priorFit(prior, branch, scoringConfig), scoringConfig, "added to cover strongest missing symbol-prior group");
    if (candidates.size >= selection.maximum_candidates) break;
  }

  const result = [...candidates.values()].slice(0, selection.maximum_candidates);
  if (result.length < selection.minimum_candidates && result[0]) {
    const branch = EARTHLY_BRANCHES[wrapBranchIndex(branchIndex(result[0].branch) + selection.adjacent_1_shichen_radius)];
    addCandidate(candidates, branch, "adjacent", input, priorFit(prior, branch, scoringConfig), scoringConfig, "minimum candidate coverage");
  }
  return [...candidates.values()].slice(0, selection.maximum_candidates);
}

export function generateCandidateCharts(input: BirthInput, symbolPriors: HourGroupPrior[] | HourGroupPriorResult, scoringConfig = loadScoringConfig()): CandidateChart[] {
  const priorResult: HourGroupPriorResult = Array.isArray(symbolPriors)
    ? {
        prior: {
          G1_zi_wu_mao_you: symbolPriors.find((entry) => entry.group === "G1_zi_wu_mao_you")?.prior ?? scoringConfig.legacy_ranking.uniform_group_prior,
          G2_yin_shen_si_hai: symbolPriors.find((entry) => entry.group === "G2_yin_shen_si_hai")?.prior ?? scoringConfig.legacy_ranking.uniform_group_prior,
          G3_chen_xu_chou_wei: symbolPriors.find((entry) => entry.group === "G3_chen_xu_chou_wei")?.prior ?? scoringConfig.legacy_ranking.uniform_group_prior
        },
        raw_scores: { G1_zi_wu_mao_you: 0, G2_yin_shen_si_hai: 0, G3_chen_xu_chou_wei: 0 },
        entries: symbolPriors,
        evidence: symbolPriors.flatMap((entry) => entry.evidence),
        missing_information: [],
        warning: "Symbol evidence is weak and cannot determine birth hour alone."
      }
    : symbolPriors;
  return generateCandidateHours(input, priorResult, scoringConfig);
}
