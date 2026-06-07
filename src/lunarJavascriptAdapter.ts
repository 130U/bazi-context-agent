import { StaticBaziAdapter } from "./staticBaziAdapter.ts";
import { BaziAdapterError, type BaziDerivationOptions, type BaziDerivedProfile, type BaziEngineAdapter, type FixedPillars, type RecordedBirthTime } from "./baziTypes.ts";

type LunarModule = Record<string, unknown>;

async function loadLunarJavascript(): Promise<LunarModule | null> {
  try {
    return (await import("lunar-javascript")) as LunarModule;
  } catch {
    return null;
  }
}

export class LunarJavascriptAdapter implements BaziEngineAdapter {
  adapter_id = "lunar-javascript-adapter";
  source_library = "6tail/lunar-javascript";
  supports_recorded_birth_time = true;
  supports_birth_datetime = true;
  supports_fixed_pillars = true;
  supports_luck_cycles = false;
  supports_annual_fortunes = false;

  private fallback = new StaticBaziAdapter();

  async isAvailable(): Promise<boolean> {
    return (await loadLunarJavascript()) !== null;
  }

  async deriveFromRecordedBirthTime(input: RecordedBirthTime, _options: BaziDerivationOptions = {}): Promise<BaziDerivedProfile> {
    const lunar = await loadLunarJavascript();
    if (!lunar) {
      throw new BaziAdapterError("LIBRARY_UNAVAILABLE", "lunar-javascript is not installed; use StaticBaziAdapter fallback for Stage 5B.", this.source_library);
    }
    if (!input.time) throw new BaziAdapterError("MISSING_BIRTH_TIME", "Recorded birth time is required for LunarJavascriptAdapter.", this.source_library);
    throw new BaziAdapterError("LIBRARY_ERROR", "LunarJavascriptAdapter mapping is reserved for Stage 5C spike after dependency installation.", this.source_library);
  }

  deriveFromFixedPillars(input: FixedPillars, options: BaziDerivationOptions = {}): BaziDerivedProfile {
    const profile = this.fallback.deriveFromFixedPillars(input, {
      ...options,
      calculationMode: options.calculationMode ?? "fixed_pillars"
    });
    return {
      ...profile,
      profile_id: options.profileId ?? `lunar_pending_${profile.source_chart_id}`,
      source_libraries: [this.source_library, "static-adapter"],
      assumptions: [
        ...profile.assumptions,
        "lunar-javascript fixed-pillar enrichment is pending Stage 5C spike."
      ],
      warnings: [
        ...profile.warnings,
        "LunarJavascriptAdapter is present as a safe wrapper but has not imported a runtime dependency in Stage 5B."
      ]
    };
  }
}

export const lunarJavascriptAdapter = new LunarJavascriptAdapter();
