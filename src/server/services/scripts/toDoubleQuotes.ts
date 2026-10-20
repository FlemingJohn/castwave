import "server-only";

const DOUBLE_QUOTE = /["“”]/;
const SINGLE_QUOTED_SPEECH = /(^|[\s([—–])['‘](?=\S)([^\n]*?[,.!?…—–;:])['’](?=$|[\s)\],.;:!?—–])/gmu;

export function toDoubleQuotes(text: string) {
  if (DOUBLE_QUOTE.test(text)) {
    return text;
  }
  return text.replace(SINGLE_QUOTED_SPEECH, (_, before: string, speech: string) => `${before}"${speech}"`);
}
