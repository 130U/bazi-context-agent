import { loadQuestionBank, loadScoringConfig } from "./config.ts";
import { generateCandidateCharts } from "./candidateGeneration.ts";
import { rankCandidates } from "./ranking.ts";
import { scoreSymbolPrior } from "./symbolPrior.ts";
import type { BirthInput, ContextFact, LifeEvent, SymbolAnswer } from "./types.ts";

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

const events: LifeEvent[] = [
  { year: 2013, type: "education", description: "demo education turn" },
  { year: 2020, type: "relocation", description: "demo relocation" }
];

const contextFacts: ContextFact[] = [
  { id: "education", value: "demo", source: "user_answer", confidence: 0.8, factType: "known_user_fact" }
];

loadQuestionBank();
const scoringConfig = loadScoringConfig();
const priors = scoreSymbolPrior(symbolAnswers, birthInput, scoringConfig);
const candidates = generateCandidateCharts(birthInput, priors, scoringConfig);
const ranked = rankCandidates(candidates, priors, events, contextFacts, scoringConfig);

console.log(JSON.stringify({ ranked }, null, 2));
