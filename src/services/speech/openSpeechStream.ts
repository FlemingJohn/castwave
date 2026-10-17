import { SpeechStreamEvent } from "@/types/SpeechStreamEvent";
import type { VoiceName } from "@/types/VoiceName";
import { SPEECH_SAMPLE_RATE } from "./speechSampleRate";

const SPEECH_URL = "wss://streaming-tts.assemblyai.com/v1/ws/";

export function openSpeechStream(
  token: string,
  voice: VoiceName,
  handleEvent: (event: SpeechStreamEvent, socket: WebSocket) => void,
) {
  const url = new URL(SPEECH_URL);
  url.searchParams.set("voice", voice);
  url.searchParams.set("sample_rate", String(SPEECH_SAMPLE_RATE));
  url.searchParams.set("token", token);
  const language = LANGUAGE_BY_VOICE[voice];
  if (language) {
    url.searchParams.set("language", language);
  }
  const socket = new WebSocket(url);
  socket.addEventListener("message", (message) => {
    const incoming: unknown = JSON.parse(String(message.data));
    const event = SpeechStreamEvent.safeParse(incoming);
    if (event.success) {
      handleEvent(event.data, socket);
    }
  });
  return socket;
}

const LANGUAGE_BY_VOICE: Partial<Record<VoiceName, string>> = {
  estelle: "french",
  giovanni: "italian",
  juergen: "german",
  lola: "spanish",
  rafael: "portuguese",
};
