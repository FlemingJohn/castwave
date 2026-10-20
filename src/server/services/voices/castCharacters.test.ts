import assert from "node:assert/strict";
import { test } from "node:test";
import { castCharacters } from "./castCharacters.ts";

const FEMALE_VOICES = ["vera", "iris", "eve", "mary", "anna", "jane"];
const MALE_VOICES = ["charles", "michael", "jean", "reid", "paul", "george"];

test("castCharacters gives women female voices and men male voices", () => {
  const cast = castCharacters(
    ["Narrator", "Martha", "Arthur"],
    [
      { name: "Martha", gender: "female", age: "adult" },
      { name: "Arthur", gender: "male", age: "adult" },
    ],
  );
  assert.equal(cast[0]?.voice, "george");
  assert.ok(FEMALE_VOICES.includes(cast[1]?.voice ?? ""));
  assert.ok(MALE_VOICES.includes(cast[2]?.voice ?? ""));
});

test("castCharacters gives older characters deeper voices", () => {
  const cast = castCharacters(["Grandpa"], [{ name: "Grandpa", gender: "male", age: "old" }]);
  assert.equal(cast[0]?.voice, "charles");
});

test("castCharacters never gives two characters the same voice while voices are left", () => {
  const names = ["Ann", "Beth", "Cara", "Dora"];
  const cast = castCharacters(
    names,
    names.map((name) => ({ name, gender: "female" as const, age: "adult" as const })),
  );
  assert.equal(new Set(cast.map((character) => character.voice)).size, 4);
  cast.forEach((character) => assert.ok(FEMALE_VOICES.includes(character.voice)));
});

test("castCharacters still casts characters with no profile", () => {
  const cast = castCharacters(["Narrator", "Stranger", "Shadow"], []);
  assert.equal(new Set(cast.map((character) => character.voice)).size, 3);
});
