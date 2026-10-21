import "server-only";

const CHARACTERS_PER_MINUTE = 900;

export function fitToLength(text: string, minutes: number) {
  const limit = minutes * CHARACTERS_PER_MINUTE;
  if (text.length <= limit) {
    return text;
  }
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const kept: string[] = [];
  let length = 0;
  for (const paragraph of paragraphs) {
    if (kept.length > 0 && length + paragraph.length > limit) {
      break;
    }
    kept.push(paragraph);
    length += paragraph.length + 2;
  }
  const fitted = kept.join("\n\n");
  return fitted.length <= limit * 1.5 ? fitted : cutAtSentence(fitted, limit);
}

function cutAtSentence(text: string, limit: number) {
  const slice = text.slice(0, limit);
  const lastStop = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("! "), slice.lastIndexOf("? "));
  return lastStop > limit / 2 ? slice.slice(0, lastStop + 1) : slice;
}
