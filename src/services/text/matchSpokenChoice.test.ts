import assert from "node:assert/strict";
import { test } from "node:test";
import { matchSpokenChoice } from "./matchSpokenChoice.ts";

const LABELS = ["Walk through the door", "Run to the front door"];

test("matchSpokenChoice picks the choice whose words were said", () => {
  assert.equal(matchSpokenChoice("I'll walk through the door.", LABELS), 0);
  assert.equal(matchSpokenChoice("Run!", LABELS), 1);
  assert.equal(matchSpokenChoice("I'm running to the front", LABELS), 1);
});

test("matchSpokenChoice understands first, second, one and two", () => {
  assert.equal(matchSpokenChoice("The second one.", LABELS), 1);
  assert.equal(matchSpokenChoice("One.", LABELS), 0);
  assert.equal(matchSpokenChoice("Option two", LABELS), 1);
});

test("matchSpokenChoice gives up when the words fit both choices or neither", () => {
  assert.equal(matchSpokenChoice("The door.", LABELS), -1);
  assert.equal(matchSpokenChoice("Hello there", LABELS), -1);
  assert.equal(matchSpokenChoice("", LABELS), -1);
});
