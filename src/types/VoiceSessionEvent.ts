import { z } from "zod";
import { ReplyAudioEvent } from "./ReplyAudioEvent";
import { ReplyDoneEvent } from "./ReplyDoneEvent";
import { SessionEndedEvent } from "./SessionEndedEvent";
import { SessionErrorEvent } from "./SessionErrorEvent";
import { SessionReadyEvent } from "./SessionReadyEvent";
import { WordSpokenEvent } from "./WordSpokenEvent";

export const VoiceSessionEvent = z.discriminatedUnion("type", [
  SessionReadyEvent,
  ReplyAudioEvent,
  WordSpokenEvent,
  ReplyDoneEvent,
  SessionEndedEvent,
  SessionErrorEvent,
]);
export type VoiceSessionEvent = z.infer<typeof VoiceSessionEvent>;
