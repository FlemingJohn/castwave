import assert from "node:assert/strict";
import { test } from "node:test";
import { planScenes } from "./planScenes.ts";

const OUTLINE = {
  title: "The Last Light",
  premise: "You keep a lighthouse.",
  characters: ["Old Tom"],
  opening: { summary: "You arrive.", question: "What do you do?", choiceA: "Answer the radio", choiceB: "Climb to the lamp" },
  branchA: { summary: "A voice speaks.", question: "What now?", choiceA: "Switch off the light", choiceB: "Ask who it is" },
  branchB: { summary: "A boat is near.", question: "What now?", choiceA: "Fix the lamp", choiceB: "Use your torch" },
  endingAA: { title: "The Dark Sea", summary: "It ends badly." },
  endingAB: { title: "The Old Keeper", summary: "A ghost thanks you." },
  endingBA: { title: "Safe Harbour", summary: "The boat is saved." },
  endingBB: { title: "A Friend", summary: "Tom returns." },
};

test("planScenes makes seven scenes whose choices all lead somewhere", () => {
  const plans = planScenes(OUTLINE);
  const ids = new Set(plans.map((plan) => plan.id));
  assert.equal(plans.length, 7);
  for (const plan of plans) {
    for (const choice of plan.choices) {
      assert.ok(ids.has(choice.nextSceneId), `${choice.nextSceneId} should exist`);
    }
  }
});

test("planScenes gives endings no choices and a title", () => {
  const endings = planScenes(OUTLINE).filter((plan) => plan.ending);
  assert.equal(endings.length, 4);
  assert.ok(endings.every((plan) => plan.choices.length === 0 && !plan.question));
});

test("planScenes tells each ending the path that led to it", () => {
  const ending = planScenes(OUTLINE).find((plan) => plan.id === "ab");
  assert.deepEqual(ending?.storySoFar, ["You arrive.", "You chose: Answer the radio", "A voice speaks.", "You chose: Ask who it is"]);
});
