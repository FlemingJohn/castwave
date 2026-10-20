const ORDINALS = [
  ["first", "one", "1", "won"],
  ["second", "two", "2", "too", "to"],
];
const STRONG_ORDINALS = ["first", "second"];
const STEM_LENGTH = 4;
const SMALL_WORDS = new Set(
  "the and you your for with from into onto that this then will want lets let's i'll ill i'm just option number choose pick say".split(
    " ",
  ),
);

export function matchSpokenChoice(transcript: string, labels: string[]) {
  const spoken = toWords(transcript);
  if (spoken.length === 0) {
    return -1;
  }
  const byWords = labels.map((label) => countSharedWords(spoken, toWords(label)));
  const best = Math.max(...byWords);
  if (best > 0 && byWords.filter((score) => score === best).length === 1) {
    return byWords.indexOf(best);
  }
  return matchOrdinal(spoken, labels.length);
}

function toWords(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}'\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function countSharedWords(spoken: string[], label: string[]) {
  const meaningful = label.filter((word) => word.length > 2 && !SMALL_WORDS.has(word));
  return meaningful.filter((word) => spoken.some((said) => said.slice(0, STEM_LENGTH) === word.slice(0, STEM_LENGTH)))
    .length;
}

function matchOrdinal(spoken: string[], choiceCount: number) {
  const strong = STRONG_ORDINALS.findIndex((ordinal) => spoken.includes(ordinal));
  if (strong !== -1 && strong < choiceCount) {
    return strong;
  }
  const isShortAnswer = spoken.length <= 3;
  const matches = ORDINALS.flatMap((words, position) =>
    position < choiceCount && isShortAnswer && words.some((word) => spoken.includes(word)) ? [position] : [],
  );
  return matches.length === 1 ? (matches[0] ?? -1) : -1;
}
