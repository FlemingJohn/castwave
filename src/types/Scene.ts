import { z } from "zod";
import { Choice } from "./Choice";
import { Cue } from "./Cue";

export const Scene = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  cues: Cue.array().min(1),
  question: z.string().optional(),
  choices: Choice.array(),
  ending: z.string().optional(),
});
export type Scene = z.infer<typeof Scene>;
