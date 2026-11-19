import { generateCandidateHours } from "./candidateGeneration.ts";
import { loadQuestionBank, loadScoringConfig } from "./config.ts";
import { scoreEventBacktest } from "./eventBacktest.ts";
import { rankCandidates } from "./ranking.ts";
import { scoreSymbolPrior } from "./symbolPrior.ts";
import type { BirthInput, ContextFact, LifeEvent, SymbolAnswer } from "./types.ts";

const bank = loadQuestionBank();
const scoringConfig = loadScoringConfig();

const birthInput: BirthInput = {
  birthDate: "1995-04-12",
  birthplace: "demo-city",
  recordedTime: "22:35",
  uncertaintyRange: "adjacent_1_shichen",
  boundaryFlags: ["near_midnight"],
  chartSex: "female"
};

const symbolAnswers: SymbolAnswer[] = [
  { questionId: "B1_hair_whorl", answerId: "one_offset" },
  { questionId: "B2_fetal_order", answerId: "1" },
  { questionId: "B4_little_finger_length", answerId: "aligned" }
];

const lifeEvents: LifeEvent[] = [
  { year: 2013, type: "education", description: "demo education turn" },
  { year: 2020, type: "migration", description: "demo relocation" },
  { year: 2023, type: "career_transition", description: "demo career change" }
];

const contextFacts: ContextFact[] = [
  { id: "education", value: "demo", source: "user_answer", confidence: 0.8, factType: "known_user_fact" }
];

const symbolPrior = scoreSymbolPrior({ answers: symbolAnswers, chartSex: birthInput.chartSex, scoringConfig });
const candidates = generateCandidateHours(birthInput, symbolPrior, scoringConfig);
const eventBacktests = scoreEventBacktest(candidates, lifeEvents);
const ranking = rankCandidates({
  candidates,
  symbol_prior_result: symbolPrior,
  event_backtest_results: eventBacktests,
  contextFacts,
  scoringConfig
});

console.log(
  JSON.stringify(
    {
      question_bank: { version: bank.version, layers: bank.stages.map((stage) => stage.id) },
      symbol_prior: symbolPrior,
      candidates,
      event_scoring_note: eventBacktests[0]?.warning,
      top_3: ranking.top_3,
      warning: ranking.warning
    },
    null,
    2
  )
);
