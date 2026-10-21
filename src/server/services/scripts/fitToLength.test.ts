import assert from "node:assert/strict";
import { test } from "node:test";
import { fitToLength } from "./fitToLength.ts";

const PARAGRAPH = "The fog lay thick over Baker Street. ".repeat(10).trim();

test("fitToLength keeps short text as it is", () => {
  assert.equal(fitToLength("A short story.", 1), "A short story.");
});

test("fitToLength stops at the end of a paragraph", () => {
  const text = Array.from({ length: 8 }, () => PARAGRAPH).join("\n\n");
  const fitted = fitToLength(text, 1);
  assert.ok(fitted.length <= 900);
  assert.ok(fitted.endsWith("Baker Street."));
  assert.equal(fitted.split("\n\n").length, Math.floor(900 / (PARAGRAPH.length + 2)));
});

test("fitToLength cuts one long paragraph at a sentence", () => {
  const fitted = fitToLength(PARAGRAPH.repeat(5), 1);
  assert.ok(fitted.length <= 900);
  assert.ok(fitted.endsWith("."));
});
