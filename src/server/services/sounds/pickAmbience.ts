import "server-only";
import type { AmbienceName } from "@/types/AmbienceName";

export function pickAmbience(storyText: string): AmbienceName | undefined {
  let bestAmbience: AmbienceName | undefined;
  let bestCount = 0;
  for (const rule of AMBIENCE_RULES) {
    const count = (storyText.match(rule.pattern) ?? []).length;
    if (count > bestCount) {
      bestAmbience = rule.ambience;
      bestCount = count;
    }
  }
  return bestAmbience;
}

const AMBIENCE_RULES: { pattern: RegExp; ambience: AmbienceName }[] = [
  { pattern: /\b(rain(s|ed|ing|y)?|storm(s|y)?|drizzle|downpour|wet)\b/gi, ambience: "rain" },
  { pattern: /\b(wind(s|y)?|gale|gust(s)?|howl(s|ed|ing)?)\b/gi, ambience: "wind" },
  { pattern: /\b(fire(place|side)?|hearth|flames?|campfire)\b/gi, ambience: "fire" },
  { pattern: /\b(forest|woods?|trees|pines?|birds?|meadow)\b/gi, ambience: "forest" },
  { pattern: /\b(city|street|traffic|crowd|market|carriage)\b/gi, ambience: "city" },
];
