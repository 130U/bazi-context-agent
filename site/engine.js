import { buildLocalForecast } from "./core/forecast.js";
import {
  answerQuestion,
  createSession,
  getNextQuestion,
  getStageOneQuestions,
  lockWorkingChart,
  normalizeIntake,
  scoreSession
} from "./core/rectification.js";
import { validateRuntimeConfig } from "./core/shared.js";

export {
  answerQuestion,
  buildLocalForecast,
  createSession,
  getNextQuestion,
  getStageOneQuestions,
  lockWorkingChart,
  normalizeIntake,
  scoreSession,
  validateRuntimeConfig
};

export const createInitialState = createSession;
export const selectNextQuestion = getNextQuestion;
export const applyAnswer = answerQuestion;
export const lockChart = lockWorkingChart;
export const createForecast = buildLocalForecast;
