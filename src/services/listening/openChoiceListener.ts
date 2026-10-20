import { ListeningEvent } from "@/types/ListeningEvent";
import type { ListeningTurnEvent } from "@/types/ListeningTurnEvent";

const LISTENING_URL = "wss://streaming.assemblyai.com/v3/ws";
const LISTENING_SAMPLE_RATE = 16000;
const SAMPLES_PER_CHUNK = 1600;
const SPEECH_MODEL = "universal-3-5-pro";
const CAPTURE_PROCESSOR = `
registerProcessor("castwave-capture", class extends AudioWorkletProcessor {
  process(inputs) {
    const channel = inputs[0] && inputs[0][0];
    if (channel) this.port.postMessage(channel.slice(0));
    return true;
  }
});`;

export async function openChoiceListener(
  token: string,
  keyterms: string[],
  onTurn: (turn: ListeningTurnEvent) => void,
  onFailure: (message: string) => void,
) {
  const microphone = await navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
  });
  const audio = new AudioContext({ sampleRate: LISTENING_SAMPLE_RATE });
  const socket = new WebSocket(makeUrl(token, keyterms));
  socket.addEventListener("message", (message) => {
    const event = ListeningEvent.safeParse(JSON.parse(String(message.data)));
    if (event.success && event.data.type === "Turn") {
      onTurn(event.data);
    } else if (event.success && event.data.type === "Error") {
      onFailure(event.data.error);
    }
  });
  await streamMicrophone(audio, microphone, socket);
  return () => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "Terminate" }));
    }
    microphone.getTracks().forEach((track) => track.stop());
    void audio.close();
  };
}

function makeUrl(token: string, keyterms: string[]) {
  const url = new URL(LISTENING_URL);
  url.searchParams.set("sample_rate", String(LISTENING_SAMPLE_RATE));
  url.searchParams.set("encoding", "pcm_s16le");
  url.searchParams.set("speech_model", SPEECH_MODEL);
  url.searchParams.set("format_turns", "true");
  url.searchParams.set("keyterms_prompt", JSON.stringify(keyterms));
  url.searchParams.set("token", token);
  return url;
}

async function streamMicrophone(audio: AudioContext, microphone: MediaStream, socket: WebSocket) {
  const moduleUrl = URL.createObjectURL(new Blob([CAPTURE_PROCESSOR], { type: "text/javascript" }));
  await audio.audioWorklet.addModule(moduleUrl);
  URL.revokeObjectURL(moduleUrl);
  const capture = new AudioWorkletNode(audio, "castwave-capture");
  let pending: number[] = [];
  capture.port.onmessage = (message: MessageEvent<Float32Array>) => {
    pending = pending.concat(Array.from(message.data));
    if (pending.length < SAMPLES_PER_CHUNK) {
      return;
    }
    const chunk = Int16Array.from(pending, (sample) => Math.max(-1, Math.min(1, sample)) * 32767);
    pending = [];
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(chunk.buffer);
    }
  };
  audio.createMediaStreamSource(microphone).connect(capture);
}
