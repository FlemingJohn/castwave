import { z } from "zod";
import { SoundCue } from "./SoundCue";
import { SpeechCue } from "./SpeechCue";

export const Cue = z.discriminatedUnion("kind", [SpeechCue, SoundCue]);
export type Cue = z.infer<typeof Cue>;
