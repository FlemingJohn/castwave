import { z } from "zod";

export const DraftLine = z.object({
  speaker: z.string().trim().min(1),
  text: z.string().trim().min(1),
  startsParagraph: z.boolean(),
});
export type DraftLine = z.infer<typeof DraftLine>;
