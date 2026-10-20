import assert from "node:assert/strict";
import { test } from "node:test";
import { addSoundCues } from "./addSoundCues.ts";

test("addSoundCues puts a knock before the narration that mentions it", () => {
  const cues = addSoundCues([
    { speaker: "Narrator", text: "A sharp knock echoed through the hall.", startsParagraph: true },
    { speaker: "Holmes", text: "Come in.", startsParagraph: false },
  ]);
  assert.deepEqual(
    cues.map((cue) => (cue.kind === "sound" ? cue.sound : cue.speaker)),
    ["door_knock", "Narrator", "Holmes"],
  );
  assert.equal(cues[0]?.startsParagraph, true);
  assert.equal(cues[1]?.startsParagraph, false);
});

test("addSoundCues ignores sounds a character only talks about", () => {
  const cues = addSoundCues([{ speaker: "Watson", text: "Did you hear a knock?", startsParagraph: true }]);
  assert.equal(cues.length, 1);
});

test("addSoundCues does not repeat the same sound twice in a row", () => {
  const cues = addSoundCues([
    { speaker: "Narrator", text: "Footsteps on the stairs.", startsParagraph: true },
    { speaker: "Narrator", text: "More footsteps, closer now.", startsParagraph: false },
  ]);
  assert.equal(cues.filter((cue) => cue.kind === "sound").length, 1);
});
