import { z } from "zod";

export const WordBoundariesEvent = z.object({
  type: z.literal("WordBoundaries"),
  flush_id: z.number(),
  words: z.array(
    z.object({
      word: z.string(),
      start: z.number(),
      end: z.number(),
    }),
  ),
});
export type WordBoundariesEvent = z.infer<typeof WordBoundariesEvent>;
