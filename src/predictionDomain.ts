import { loadPredictionDomainsConfig } from "./config.ts";
import { PREDICTION_DOMAINS, type PredictionDomain, type PredictionDomainsConfig } from "./predictionTypes.ts";

const FALLBACK_KEYWORDS: Record<PredictionDomain, string[]> = {
  education: ["education", "school", "exam", "study", "degree"],
  career: ["career", "job", "work", "startup", "business"],
  wealth: ["wealth", "money", "income", "asset", "invest"],
  relationship: ["relationship", "love", "marriage", "partner"],
  health: ["health", "body", "stress", "sleep"],
  migration: ["migration", "move", "abroad", "city", "visa"],
  personality: ["personality", "habit", "strength", "weakness"],
  family: ["family", "parent", "sibling", "support"],
  general: []
};

export function classifyPredictionDomain(question: string, config: PredictionDomainsConfig = loadPredictionDomainsConfig()): PredictionDomain {
  const normalized = question.toLowerCase();
  let best: { domain: PredictionDomain; hits: number } = { domain: config.default_domain ?? "general", hits: 0 };
  for (const domain of config.domains) {
    const keywords = [...domain.keywords, ...(FALLBACK_KEYWORDS[domain.id] ?? [])];
    const hits = keywords.filter((keyword) => keyword.length > 0 && normalized.includes(keyword.toLowerCase())).length;
    if (hits > best.hits) best = { domain: domain.id, hits };
  }
  return PREDICTION_DOMAINS.includes(best.domain) ? best.domain : "general";
}
