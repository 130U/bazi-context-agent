import { validateForecastInput } from "./forecastInputValidator.ts";
import { assertForecastInputBoundary } from "./futureForecastPolicy.ts";
import { buildFutureForecastPromptInput } from "./futureForecastPromptBuilder.ts";
import { validateFutureForecastResult } from "./futureForecastSchema.ts";
import type { FutureForecastRequest, FutureForecastResult } from "./futureForecastTypes.ts";
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

export async function runFutureForecast(request: FutureForecastRequest): Promise<FutureForecastResult> {
  if (!request.forecast_input) throw new FutureForecastError("MISSING_FORECAST_INPUT", "Future forecast requires forecast_input.");
  const forecastInput = clone(request.forecast_input);
  const validation = validateForecastInput(forecastInput);
  if (!validation.valid) throw new FutureForecastError("INVALID_FORECAST_INPUT", validation.errors.join("; "));
  assertForecastInputBoundary(forecastInput);

  const prompt = buildFutureForecastPromptInput(forecastInput);
  const provider = createMockFutureForecastProvider();
  const result = await provider.forecast({ ...request, forecast_input: forecastInput }, prompt);
  const resultValidation = validateFutureForecastResult(result);
  if (!resultValidation.valid) throw new FutureForecastError("FORECAST_SCHEMA_VALIDATION_FAILED", resultValidation.errors.join("; "));
  return result;
}
