import assert from "node:assert/strict";
import { test } from "node:test";
import { pickAmbience } from "./pickAmbience.ts";

test("pickAmbience picks the setting mentioned most", () => {
  assert.equal(pickAmbience("Rain lashed the window. The rain did not stop. A tree swayed."), "rain");
});

test("pickAmbience returns nothing when no setting is mentioned", () => {
  assert.equal(pickAmbience("She opened the letter and smiled."), undefined);
});
