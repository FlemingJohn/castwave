import { z } from "zod";

export const SessionReadyEvent = z.object({
  type: z.literal("session.ready"),
});
export type SessionReadyEvent = z.infer<typeof SessionReadyEvent>;
