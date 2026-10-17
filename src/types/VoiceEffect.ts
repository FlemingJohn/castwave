import { z } from "zod";

export const VoiceEffect = z.enum(["none", "ghost", "giant", "child", "phone", "robot", "whisper"]);
export type VoiceEffect = z.infer<typeof VoiceEffect>;
