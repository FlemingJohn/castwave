import { z } from "zod";
import { ListeningTurnEvent } from "./ListeningTurnEvent";
import { SpeechErrorEvent } from "./SpeechErrorEvent";

export const ListeningEvent = z.discriminatedUnion("type", [ListeningTurnEvent, SpeechErrorEvent]);
export type ListeningEvent = z.infer<typeof ListeningEvent>;
