import type { CandidateChart, EvidenceItem, LifeEvent } from "./types.ts";

export interface EventBacktestResult {
  event_timing_fit: number;
  evidence: EvidenceItem[];
  missing_information: string[];
  contradictions: EvidenceItem[];
}

export function scoreEventBacktest(candidate: CandidateChart, events: LifeEvent[]): EventBacktestResult {
  if (events.length === 0) {
    return {
      event_timing_fit: 0.5,
      evidence: [{ code: "event_backtest_stub", message: "no life events supplied; neutral deterministic placeholder", value: 0.5 }],
      missing_information: ["major life event years"],
      contradictions: []
    };
  }

  const stableHash = [...candidate.hourBranch].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const eventSignal = events.reduce((sum, event) => sum + event.year + event.type.length, 0);
  const score = 0.45 + (((stableHash + eventSignal) % 30) / 100);

  return {
    event_timing_fit: Number(score.toFixed(2)),
    evidence: [
      {
        code: "event_backtest_stub",
        message: "deterministic placeholder until full BaZi calendar backtest is implemented",
        value: Number(score.toFixed(2))
      }
    ],
    missing_information: [],
    contradictions: []
  };
}
