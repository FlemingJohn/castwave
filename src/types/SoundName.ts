import { z } from "zod";

export const SoundName = z.enum([
  "door_knock",
  "door_creak",
  "door_close",
  "door_slam",
  "footsteps",
  "glass_break",
  "heartbeat",
  "clock_ticking",
  "scream",
  "thunder",
]);
export type SoundName = z.infer<typeof SoundName>;
