import type { PredictionPolicy, PredictionProviderId, RankingSnapshot } from "./predictionTypes.ts";

export function mockPredictionPolicy(provider: PredictionProviderId = "mock", schemaVersion = "1.0"): PredictionPolicy {
  return {
    ai_used_for_ranking: false,
    ranking_modified_by_ai: false,
    provider,
    schema_version: schemaVersion,
    output_schema_validated: true
  };
}

export function cloneRankingSnapshot(snapshot: RankingSnapshot): RankingSnapshot {
  return JSON.parse(JSON.stringify(snapshot)) as RankingSnapshot;
}

export function assertRankingSnapshotUnchanged(before: RankingSnapshot, after: RankingSnapshot): void {
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    throw new Error("prediction_must_not_mutate_ranking_snapshot");
  }
}
