import { z } from "zod";
import { VoiceEffect } from "./VoiceEffect";
import { VoiceName } from "./VoiceName";

export const Character = z.object({
  name: z.string().min(1),
  voice: VoiceName,
  effect: VoiceEffect,
  volume: z.number().int().min(0).max(100),
});
export type Character = z.infer<typeof Character>;
