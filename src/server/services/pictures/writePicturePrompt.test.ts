import assert from "node:assert/strict";
import { test } from "node:test";
import { writePicturePrompt } from "./writePicturePrompt.ts";

const REQUEST = {
  storyTitle: "The Wax Whisper",
  sceneTitle: "The Night Shift",
  sceneText: "The guard walks past the silent figures.",
  seed: 7,
};

test("writePicturePrompt describes the scene in the house style", () => {
  const prompt = writePicturePrompt(REQUEST);
  assert.match(prompt, /The Night Shift/);
  assert.match(prompt, /silent figures/);
  assert.match(prompt, /no text/);
});

test("writePicturePrompt asks for rain when the story's ambience is rain", () => {
  assert.match(writePicturePrompt({ ...REQUEST, ambience: "rain" }), /heavy rain/);
  assert.doesNotMatch(writePicturePrompt(REQUEST), /rain/);
});
