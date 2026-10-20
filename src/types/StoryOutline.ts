import { z } from "zod";

const BranchingScene = z.object({
  summary: z.string().trim().min(1),
  question: z.string().trim().min(1),
  choiceA: z.string().trim().min(1),
  choiceB: z.string().trim().min(1),
});

const Ending = z.object({
  title: z.string().trim().min(1),
  summary: z.string().trim().min(1),
});

export const StoryOutline = z.object({
  title: z.string().trim().min(1),
  premise: z.string().trim().min(1),
  characters: z.array(z.string().trim().min(1)).min(1),
  opening: BranchingScene,
  branchA: BranchingScene,
  branchB: BranchingScene,
  endingAA: Ending,
  endingAB: Ending,
  endingBA: Ending,
  endingBB: Ending,
});
export type StoryOutline = z.infer<typeof StoryOutline>;
