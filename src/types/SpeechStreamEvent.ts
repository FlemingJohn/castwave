import { z } from "zod";
import { FlushDoneEvent } from "./FlushDoneEvent";
import { SpeechAudioEvent } from "./SpeechAudioEvent";
import { SpeechBeginEvent } from "./SpeechBeginEvent";
import { SpeechEndedEvent } from "./SpeechEndedEvent";
import { SpeechErrorEvent } from "./SpeechErrorEvent";
import { WordBoundariesEvent } from "./WordBoundariesEvent";

export const SpeechStreamEvent = z.discriminatedUnion("type", [
  SpeechBeginEvent,
  SpeechAudioEvent,
  FlushDoneEvent,
  WordBoundariesEvent,
  SpeechEndedEvent,
  SpeechErrorEvent,
]);
export type SpeechStreamEvent = z.infer<typeof SpeechStreamEvent>;
