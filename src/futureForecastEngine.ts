import { validateForecastInput } from "./forecastInputValidator.ts";
import { allowedStage6Domains, assertForecastInputBoundary, getFutureForecastProvider } from "./futureForecastPolicy.ts";
import { buildFutureForecastPromptInput } from "./futureForecastPromptBuilder.ts";
import { validateFutureForecastResult } from "./futureForecastSchema.ts";
import type { FutureForecastProvider, FutureForecastRequest, FutureForecastResult } from "./futureForecastTypes.ts";
import { createMockFutureForecastProvider } from "./mockFutureForecastProvider.ts";

export class FutureForecastError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "FutureForecastError";
    this.code = code;
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function providerForRequest(request: FutureForecastRequest): FutureForecastProvider {
  const provider = getFutureForecastProvider(request.options?.provider);
  if (provider === "mock" || provider === "mock_fallback") return createMockFutureForecastProvider();
  return createMockFutureForecastProvider();
}

function validateForecastInputForStage6(forecastInput: FutureForecastRequest["forecast_input"]): void {
  const validation = validateForecastInput(forecastInput);
  if (validation.valid) return;
  const stage6Domains = allowedStage6Domains();
  const toleratedDomainErrors = validation.errors.filter((entry) => {
    const match = entry.match(/^Invalid forecast domain: (.+)$/);
    return match ? stage6Domains.includes(match[1] as never) : false;
  });
  if (toleratedDomainErrors.length !== validation.errors.length) {
    throw new FutureForecastError("INVALID_FORECAST_INPUT", validation.errors.join("; "));
  }
}

export async function runFutureForecast(request: FutureForecastRequest): Promise<FutureForecastResult> {
  if (!request.forecast_input) throw new FutureForecastError("MISSING_FORECAST_INPUT", "Future forecast requires forecast_input.");
  const forecastInput = clone(request.forecast_input);
  validateForecastInputForStage6(forecastInput);
  assertForecastInputBoundary(forecastInput);

  const prompt = buildFutureForecastPromptInput(forecastInput);
  const provider = providerForRequest(request);
  const result = await provider.forecast({ ...request, forecast_input: forecastInput }, prompt);
  const resultValidation = validateFutureForecastResult(result);
  if (!resultValidation.valid) throw new FutureForecastError("FORECAST_SCHEMA_VALIDATION_FAILED", resultValidation.errors.join("; "));
  return result;
}
