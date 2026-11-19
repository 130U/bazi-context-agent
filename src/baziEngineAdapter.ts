import type { BaziDerivedProfile } from "./baziTypes.ts";

export const REQUIRED_BAZI_DERIVED_PROFILE_FIELDS = [
  "profile_id",
  "source_chart_id",
  "source_libraries",
  "calculation_mode",
  "pillars",
  "day_master",
  "five_elements",
  "ten_gods",
  "hidden_stems",
  "nayin",
  "stars",
  "shensha",
  "relations",
  "assumptions",
  "warnings"
] as const;

export function emptyBaziRelations(): BaziDerivedProfile["relations"] {
  return {
    clashes: [],
    combinations: [],
    punishments: [],
    harms: []
  };
}

export function emptyFiveElements(): BaziDerivedProfile["five_elements"] {
  return {
    wood: null,
    fire: null,
    earth: null,
    metal: null,
    water: null
  };
}

export function validateBaziDerivedProfile(profile: BaziDerivedProfile): string[] {
  const errors: string[] = [];
  for (const field of REQUIRED_BAZI_DERIVED_PROFILE_FIELDS) {
    if (!(field in profile)) errors.push(`missing:${field}`);
  }
  if (!profile.pillars?.year || !profile.pillars?.month || !profile.pillars?.day || !profile.pillars?.hour) errors.push("missing:pillars");
  if (!Array.isArray(profile.source_libraries) || profile.source_libraries.length === 0) errors.push("missing:source_libraries");
  if (!Array.isArray(profile.assumptions)) errors.push("invalid:assumptions");
  if (!Array.isArray(profile.warnings)) errors.push("invalid:warnings");
  if (!Array.isArray(profile.relations?.clashes)) errors.push("invalid:relations.clashes");
  if (!Array.isArray(profile.relations?.combinations)) errors.push("invalid:relations.combinations");
  if (!Array.isArray(profile.relations?.punishments)) errors.push("invalid:relations.punishments");
  if (!Array.isArray(profile.relations?.harms)) errors.push("invalid:relations.harms");
  return errors;
}
