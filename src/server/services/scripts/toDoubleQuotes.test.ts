import assert from "node:assert/strict";
import { test } from "node:test";
import { toDoubleQuotes } from "./toDoubleQuotes.ts";

test("toDoubleQuotes turns single-quoted speech into double-quoted speech", () => {
  const story = "'Who's there?' asked Clara. 'Only me,' he said. 'I don't know.'";
  assert.equal(toDoubleQuotes(story), `"Who's there?" asked Clara. "Only me," he said. "I don't know."`);
});

test("toDoubleQuotes handles curly single quotes", () => {
  assert.equal(toDoubleQuotes("‘Come in,’ she said."), `"Come in," she said.`);
});

test("toDoubleQuotes leaves apostrophes and possessives alone", () => {
  const story = "It's the boys' room, and Tom's dog isn't here.";
  assert.equal(toDoubleQuotes(story), story);
});

test("toDoubleQuotes keeps single quotes inside double-quoted speech", () => {
  const story = `"He said 'run,' so I ran," said Ann.`;
  assert.equal(toDoubleQuotes(story), story);
});
