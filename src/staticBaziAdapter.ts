import { emptyBaziRelations, emptyFiveElements, validateBaziDerivedProfile } from "./baziEngineAdapter.ts";
import { BaziAdapterError, type BaziDerivationOptions, type BaziDerivedProfile, type BaziEngineAdapter, type FixedPillars, type RecordedBirthTime } from "./baziTypes.ts";

function profileId(sourceChartId: string): string {
  return `static_profile_${sourceChartId}`;
}

export class StaticBaziAdapter implements BaziEngineAdapter {
  adapter_id = "static-bazi-adapter";
  source_library = "static-adapter";
  supports_recorded_birth_time = false;
  supports_birth_datetime = false;
  supports_fixed_pillars = true;
  supports_luck_cycles = false;
  supports_annual_fortunes = false;

  deriveFromRecordedBirthTime(_input: RecordedBirthTime): BaziDerivedProfile {
    throw new BaziAdapterError("MISSING_FIXED_PILLARS", "StaticBaziAdapter requires fixed pillars and cannot derive from recorded birth time.", this.source_library);
  }

  deriveFromFixedPillars(input: FixedPillars, options: BaziDerivationOptions = {}): BaziDerivedProfile {
    if (!input?.year || !input.month || !input.day || !input.hour) {
      throw new BaziAdapterError("MISSING_FIXED_PILLARS", "Fixed pillars must include year, month, day, and hour pillars.", this.source_library);
    }
    const sourceChartId = options.sourceChartId ?? "fixed_pillars";
    const profile: BaziDerivedProfile = {
      profile_id: options.profileId ?? profileId(sourceChartId),
      source_chart_id: sourceChartId,
      source_libraries: [this.source_library],
      calculation_mode: options.calculationMode ?? "fixed_pillars",
      pillars: input,
      day_master: input.day.stem,
      five_elements: emptyFiveElements(),
      ten_gods: [],
      hidden_stems: [],
      nayin: [],
      stars: [],
      shensha: [],
      relations: emptyBaziRelations(),
      luck_cycles: [],
      annual_fortunes: [],
      assumptions: [
        "Fixed pillars were supplied directly.",
        "Static adapter performs shape normalization only."
      ],
      warnings: [
        "StaticBaziAdapter does not compute complete five-element strength.",
        "StaticBaziAdapter does not compute full luck cycles or annual fortunes.",
        "A calendar adapter is required for full luck-cycle and annual-fortune derivation."
      ]
    };
    const errors = validateBaziDerivedProfile(profile);
    if (errors.length > 0) throw new BaziAdapterError("INVALID_DERIVED_PROFILE", errors.join("; "), this.source_library);
    return profile;
  }
}

export const staticBaziAdapter = new StaticBaziAdapter();
