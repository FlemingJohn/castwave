import "server-only";
import type { DraftLine } from "@/types/DraftLine";

export function restoreMissingText(storyText: string, lines: DraftLine[]) {
  const restoredLines = [...lines];
  let lastMatch = 0;
  for (const piece of splitIntoPieces(storyText)) {
    const foundAt = findPiece(restoredLines, piece.normalized, lastMatch);
    if (foundAt !== -1) {
      lastMatch = foundAt;
      continue;
    }
    const insertAt = restoredLines.length === 0 ? 0 : lastMatch + 1;
    restoredLines.splice(insertAt, 0, { speaker: "Narrator", text: piece.text, startsParagraph: piece.startsParagraph });
    lastMatch = insertAt;
  }
  return restoredLines;
}

type Piece = {
  text: string;
  normalized: string;
  startsParagraph: boolean;
};

function splitIntoPieces(storyText: string) {
  const paragraphs = storyText.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  return paragraphs.flatMap((paragraph) => {
    const quotesAndNarration = paragraph.match(/["“][^"”]*["”]|[^"“”]+/g) ?? [];
    const sentences = quotesAndNarration.flatMap((part) => part.match(/[^.!?…]+[.!?…]*["”']?/g) ?? []);
    const pieces: Piece[] = sentences
      .map((sentence) => sentence.replace(/["“”]/g, "").trim())
      .map((text) => ({ text, normalized: normalize(text), startsParagraph: false }))
      .filter((piece) => piece.normalized.length >= 3);
    const firstPiece = pieces[0];
    if (firstPiece) {
      firstPiece.startsParagraph = true;
    }
    return pieces;
  });
}

function findPiece(lines: DraftLine[], normalizedPiece: string, startAt: number) {
  for (let index = startAt; index < lines.length; index++) {
    const line = lines[index];
    const nextLine = lines[index + 1];
    const lineText = normalize(line ? line.text : "");
    const twoLinesText = normalize(`${line ? line.text : ""} ${nextLine ? nextLine.text : ""}`);
    if (lineText.includes(normalizedPiece) || twoLinesText.includes(normalizedPiece)) {
      return index;
    }
  }
  return -1;
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
