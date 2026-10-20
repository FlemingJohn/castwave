import { SpeechStreamEvent } from "@/types/SpeechStreamEvent";
import type { VoiceName } from "@/types/VoiceName";
import { LANGUAGE_BY_VOICE } from "./languageByVoice";
import { SPEECH_SAMPLE_RATE } from "./speechSampleRate";

const SPEECH_URL = "wss://streaming-tts.assemblyai.com/v1/ws/";

export function openSpeechStream(
  token: string,
  voice: VoiceName,
  handleEvent: (event: SpeechStreamEvent, socket: WebSocket) => void,
) {
  const url = new URL(SPEECH_URL);
  url.searchParams.set("voice", voice);
  url.searchParams.set("language", LANGUAGE_BY_VOICE[voice]);
  url.searchParams.set("sample_rate", String(SPEECH_SAMPLE_RATE));
  url.searchParams.set("token", token);
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
