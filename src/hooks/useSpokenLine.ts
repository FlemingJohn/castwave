import { useEffect, useRef, useState } from "react";
import { getVoiceTokensAction } from "@/server/actions/voices/getVoiceTokensAction";
import { openSpeechStream } from "@/services/speech/openSpeechStream";
import { SPEECH_SAMPLE_RATE } from "@/services/speech/speechSampleRate";
import { toAudioBuffer } from "@/services/speech/toAudioBuffer";
import type { SpeechStreamEvent } from "@/types/SpeechStreamEvent";
import type { SpokenLineStatus } from "@/types/SpokenLineStatus";
import type { SpokenLineStep } from "@/types/SpokenLineStep";
import type { VoiceName } from "@/types/VoiceName";

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
    const audio = audioRef.current ?? new AudioContext({ sampleRate: SPEECH_SAMPLE_RATE });
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
    const handleEvent = makeEventHandler(text, audio, addStep, { setStatus, setWords, setErrorMessage });
    socketRef.current = openSpeechStream(token, voice, handleEvent);
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
  setWords: (words: string[]) => void;
  setErrorMessage: (message: string) => void;
};

function makeEventHandler(text: string, audio: AudioContext, addStep: (label: string) => void, setters: Setters) {
  let nextStartTime = 0;
  let hasAudio = false;
  return (event: SpeechStreamEvent, socket: WebSocket) => {
    switch (event.type) {
      case "Begin":
        addStep("Connected");
        socket.send(JSON.stringify({ type: "Generate", text }));
        socket.send(JSON.stringify({ type: "Flush" }));
        return;
      case "Audio":
        if (!hasAudio) {
          hasAudio = true;
          addStep("First audio");
          setters.setStatus("speaking");
        }
        nextStartTime = playBuffer(audio, toAudioBuffer(audio, event.audio), nextStartTime);
        return;
      case "WordBoundaries":
        setters.setWords(event.words.map((spoken) => spoken.word));
        return;
      case "FlushDone":
        addStep("Line finished");
        socket.send(JSON.stringify({ type: "Terminate" }));
        return;
      case "Termination":
        setters.setStatus("done");
        socket.close();
        return;
      case "Error":
        setters.setErrorMessage(event.error);
        setters.setStatus("failed");
        socket.close();
    }
  };
}

function playBuffer(audio: AudioContext, buffer: AudioBuffer, nextStartTime: number) {
  const source = audio.createBufferSource();
  source.buffer = buffer;
  source.connect(audio.destination);
  const startTime = Math.max(audio.currentTime + 0.05, nextStartTime);
  source.start(startTime);
  return startTime + buffer.duration;
}
