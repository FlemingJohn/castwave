import { z } from "zod";

export const Choice = z.object({
  label: z.string().min(1),
  nextSceneId: z.string().min(1),
});
export type Choice = z.infer<typeof Choice>;
