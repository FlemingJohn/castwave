import { z } from "zod";

export const ListeningTurnEvent = z.object({
  type: z.literal("Turn"),
  transcript: z.string(),
  end_of_turn: z.boolean(),
  turn_is_formatted: z.boolean().optional(),
});
export type ListeningTurnEvent = z.infer<typeof ListeningTurnEvent>;
