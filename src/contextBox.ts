import type { ContextFact } from "./types.ts";
import type { KnownFact } from "./predictionTypes.ts";

type RawRecord = Record<string, unknown>;

function asRecord(value: unknown): RawRecord | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as RawRecord) : null;
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

export function normalizeContextBox(input: unknown): ContextFact[] {
  if (!Array.isArray(input)) return [];
  return input.flatMap((item, index): ContextFact[] => {
    const record = asRecord(item);
    if (!record) return [];
    const value = typeof record.value === "string" || Array.isArray(record.value) ? record.value : JSON.stringify(record.value ?? "");
    return [{
      id: text(record.id ?? record.field, `context_${index + 1}`),
      value,
      source: "user_answer",
      confidence: typeof record.confidence === "number" ? Math.max(0, Math.min(1, record.confidence)) : 0.5,
      factType: "known_user_fact"
    }];
  });
}

export function contextFactsToKnownFacts(contextBox: ContextFact[]): KnownFact[] {
  return contextBox.map((fact) => ({
    fact: `${fact.id}: ${Array.isArray(fact.value) ? fact.value.join(", ") : fact.value}`,
    source: fact.source,
    confidence: fact.confidence
  }));
}
