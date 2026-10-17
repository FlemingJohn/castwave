import { useEffect, useRef, useState } from "react";
import { getVoiceTokensAction } from "@/server/actions/voices/getVoiceTokensAction";
import type { VoiceName } from "@/types/VoiceName";
import { VoiceSessionEvent } from "@/types/VoiceSessionEvent";
import type { SpokenLineStatus } from "./SpokenLineStatus";
import type { SpokenLineStep } from "./SpokenLineStep";

const SESSION_URL = "wss://agents.assemblyai.com/v1/ws";
const SAMPLE_RATE = 24000;

export function useSpokenLine() {
  const [status, setStatus] = useState<SpokenLineStatus>("idle");
  const [steps, setSteps] = useState<SpokenLineStep[]>([]);
  const [words, setWords] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const socketRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      socketRef.current?.close();
      void audioRef.current?.close();
    };
  }, []);

  async function speak(text: string, voice: VoiceName) {
    socketRef.current?.close();
    const audio = audioRef.current ?? new AudioContext({ sampleRate: SAMPLE_RATE });
    audioRef.current = audio;
    const startedAt = performance.now();
    const addStep = (label: string) => {
      const milliseconds = Math.round(performance.now() - startedAt);
      setSteps((current) => [...current, { label, milliseconds }]);
    };
    setStatus("connecting");
    setSteps([]);
    setWords([]);
    setErrorMessage("");
    const token = await getToken();
    if (!token) {
      setErrorMessage("Castwave couldn't get a voice token. Check ASSEMBLYAI_API_KEY in .env.local and restart the app.");
      setStatus("failed");
      return;
    }
    addStep("Token");
    const handleEvent = makeEventHandler(audio, addStep, { setStatus, setWords, setErrorMessage });
    socketRef.current = openSession(token, text, voice, handleEvent);
  }

  return { speak, status, steps, words, errorMessage };
}

async function getToken() {
  try {
    const [token] = await getVoiceTokensAction(1);
    return token;
  } catch {
    return undefined;
  }
}

type Setters = {
  setStatus: (status: SpokenLineStatus) => void;
  setWords: (update: (current: string[]) => string[]) => void;
  setErrorMessage: (message: string) => void;
};

function makeEventHandler(audio: AudioContext, addStep: (label: string) => void, setters: Setters) {
  let nextStartTime = 0;
  let hasAudio = false;
  return (event: VoiceSessionEvent, socket: WebSocket) => {
    switch (event.type) {
      case "session.ready":
        addStep("Session ready");
        return;
      case "reply.audio":
        if (!hasAudio) {
          hasAudio = true;
          addStep("First audio");
          setters.setStatus("speaking");
        }
        nextStartTime = playChunk(audio, event.data, nextStartTime);
        return;
      case "transcript.agent.delta":
        setters.setWords((current) => [...current, event.delta]);
        return;
      case "reply.done":
        addStep("All audio received");
        socket.send(JSON.stringify({ type: "session.end" }));
        return;
      case "session.ended":
        setters.setStatus("done");
        socket.close();
        return;
      case "session.error":
        setters.setErrorMessage(event.message);
        setters.setStatus("failed");
        socket.close();
    }
  };
}

function openSession(
  token: string,
  text: string,
  voice: VoiceName,
  handleEvent: (event: VoiceSessionEvent, socket: WebSocket) => void,
) {
  const url = new URL(SESSION_URL);
  url.searchParams.set("token", token);
  const socket = new WebSocket(url);
  socket.addEventListener("open", () => {
    const session = { greeting: text, output: { voice, format: { encoding: "audio/pcm" } } };
    socket.send(JSON.stringify({ type: "session.update", session }));
  });
  socket.addEventListener("message", (message) => {
    const incoming: unknown = JSON.parse(String(message.data));
    const event = VoiceSessionEvent.safeParse(incoming);
    if (event.success) {
      handleEvent(event.data, socket);
    }
  });
  return socket;
}

function playChunk(audio: AudioContext, base64: string, nextStartTime: number) {
  const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
  const samples = new Int16Array(bytes.buffer);
  const buffer = audio.createBuffer(1, samples.length, SAMPLE_RATE);
  const channel = buffer.getChannelData(0);
  samples.forEach((sample, index) => {
    channel[index] = sample / 32768;
  });
  const source = audio.createBufferSource();
  source.buffer = buffer;
  source.connect(audio.destination);
  const startTime = Math.max(audio.currentTime + 0.05, nextStartTime);
  source.start(startTime);
  return startTime + buffer.duration;
}
