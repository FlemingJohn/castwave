import assert from "node:assert/strict";
import { test } from "node:test";
import { restoreMissingText } from "./restoreMissingText.ts";

const STORY = `The fog lay thick over Baker Street. Holmes looked up from his violin. "Watson, we have a visitor." Watson set down his paper. "At this hour, Holmes?"`;

test("restoreMissingText puts a dropped sentence back in its place", () => {
  const lines = [
    { speaker: "Narrator", text: "The fog lay thick over Baker Street.", startsParagraph: true },
    { speaker: "Holmes", text: "Watson, we have a visitor.", startsParagraph: false },
    { speaker: "Narrator", text: "Watson set down his paper.", startsParagraph: false },
    { speaker: "Watson", text: "At this hour, Holmes?", startsParagraph: false },
  ];
  const restored = restoreMissingText(STORY, lines);
  assert.equal(restored.length, 5);
  assert.deepEqual(restored[1], { speaker: "Narrator", text: "Holmes looked up from his violin.", startsParagraph: false });
  assert.equal(restored[2]?.speaker, "Holmes");
});

test("restoreMissingText leaves a complete script alone", () => {
  const lines = [
    { speaker: "Narrator", text: "The fog lay thick over Baker Street. Holmes looked up from his violin.", startsParagraph: true },
    { speaker: "Holmes", text: "Watson, we have a visitor.", startsParagraph: false },
    { speaker: "Narrator", text: "Watson set down his paper.", startsParagraph: false },
    { speaker: "Watson", text: "At this hour, Holmes?", startsParagraph: false },
  ];
  assert.deepEqual(restoreMissingText(STORY, lines), lines);
});

test("restoreMissingText keeps the story when the script is empty", () => {
  const restored = restoreMissingText(`"Run!" she shouted.`, []);
  assert.deepEqual(
    restored.map((line) => line.text),
    ["Run!", "she shouted."],
  );
});
