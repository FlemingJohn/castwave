import "server-only";
import type { ScenePlan } from "@/types/ScenePlan";
import type { StoryOutline } from "@/types/StoryOutline";

export function planScenes(outline: StoryOutline): ScenePlan[] {
  const { opening, branchA, branchB } = outline;
  const pathToA = [opening.summary, `You chose: ${opening.choiceA}`];
  const pathToB = [opening.summary, `You chose: ${opening.choiceB}`];
  return [
    {
      id: "opening",
      title: outline.title,
      summary: opening.summary,
      storySoFar: [],
      question: opening.question,
      choices: [
        { label: opening.choiceA, nextSceneId: "a" },
        { label: opening.choiceB, nextSceneId: "b" },
      ],
    },
    {
      id: "a",
      title: opening.choiceA,
      summary: branchA.summary,
      storySoFar: pathToA,
      question: branchA.question,
      choices: [
        { label: branchA.choiceA, nextSceneId: "aa" },
        { label: branchA.choiceB, nextSceneId: "ab" },
      ],
    },
    {
      id: "b",
      title: opening.choiceB,
      summary: branchB.summary,
      storySoFar: pathToB,
      question: branchB.question,
      choices: [
        { label: branchB.choiceA, nextSceneId: "ba" },
        { label: branchB.choiceB, nextSceneId: "bb" },
      ],
    },
    planEnding("aa", outline.endingAA, [...pathToA, branchA.summary, `You chose: ${branchA.choiceA}`]),
    planEnding("ab", outline.endingAB, [...pathToA, branchA.summary, `You chose: ${branchA.choiceB}`]),
    planEnding("ba", outline.endingBA, [...pathToB, branchB.summary, `You chose: ${branchB.choiceA}`]),
    planEnding("bb", outline.endingBB, [...pathToB, branchB.summary, `You chose: ${branchB.choiceB}`]),
  ];
}

function planEnding(id: string, ending: { title: string; summary: string }, storySoFar: string[]): ScenePlan {
  return { id, title: ending.title, summary: ending.summary, storySoFar, choices: [], ending: ending.title };
}
