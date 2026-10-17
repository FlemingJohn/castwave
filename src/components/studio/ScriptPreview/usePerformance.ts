import { useEffect, useRef, useState } from "react";
import { getVoiceTokensAction } from "@/server/actions/voices/getVoiceTokensAction";
import { SPEECH_SAMPLE_RATE } from "@/services/speech/speechSampleRate";
import type { PerformanceLine } from "./PerformanceLine";
import type { PerformanceSnapshot } from "./PerformanceSnapshot";
import type { PerformanceStatus } from "@/types/PerformanceStatus";
import { ScriptPerformance } from "./ScriptPerformance";

const TOKENS_PER_REQUEST = 8;
const EMPTY_SNAPSHOT: PerformanceSnapshot = { statuses: [], playingPosition: -1, spokenWordCount: 0, hasFinished: false };

export function usePerformance(lines: PerformanceLine[]) {
  const [status, setStatus] = useState<PerformanceStatus>("idle");
  const [snapshot, setSnapshot] = useState<PerformanceSnapshot>(EMPTY_SNAPSHOT);
  const [errorMessage, setErrorMessage] = useState("");
  const performanceRef = useRef<ScriptPerformance | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const runRef = useRef(0);

  useEffect(() => {
    return () => endPerformance(performanceRef, audioRef);
  }, []);

  useEffect(() => {
    if (status !== "playing") {
      return;
    }
    let frame = 0;
    const readSnapshot = () => {
      const latest = performanceRef.current?.getSnapshot();
      if (latest) {
        setSnapshot((current) => (JSON.stringify(current) === JSON.stringify(latest) ? current : latest));
      }
      if (latest?.hasFinished) {
        setStatus("finished");
        return;
      }
      frame = requestAnimationFrame(readSnapshot);
    };
    frame = requestAnimationFrame(readSnapshot);
    return () => cancelAnimationFrame(frame);
  }, [status]);

  async function play(firstPosition: number) {
    endPerformance(performanceRef, audioRef);
    runRef.current += 1;
    const run = runRef.current;
    setStatus("starting");
    setErrorMessage("");
    const audio = new AudioContext({ sampleRate: SPEECH_SAMPLE_RATE });
    audioRef.current = audio;
    const voices = [...new Set(lines.slice(firstPosition).map((line) => line.voice))];
    const tokens = await getTokens(voices.length);
    if (run !== runRef.current) {
      return;
    }
    if (!tokens) {
      setErrorMessage("Castwave couldn't get voice tokens. Check ASSEMBLYAI_API_KEY in .env.local and restart the app.");
      setStatus("failed");
      return;
    }
    const tokenByVoice = new Map(voices.map((voice, position) => [voice, tokens[position] ?? ""]));
    performanceRef.current = new ScriptPerformance(audio, lines, tokenByVoice, firstPosition, (message) => {
      setErrorMessage(message);
      setStatus("failed");
    });
    setStatus("playing");
  }

  async function pause() {
    await audioRef.current?.suspend();
    setStatus("paused");
  }

  async function resume() {
    await audioRef.current?.resume();
    setStatus("playing");
  }

  function stop() {
    runRef.current += 1;
    endPerformance(performanceRef, audioRef);
    setSnapshot(EMPTY_SNAPSHOT);
    setStatus("idle");
  }

  return { status, snapshot, errorMessage, play, pause, resume, stop };
}

function endPerformance(
  performanceRef: { current: ScriptPerformance | null },
  audioRef: { current: AudioContext | null },
) {
  performanceRef.current?.stop();
  performanceRef.current = null;
  void audioRef.current?.close();
  audioRef.current = null;
}

async function getTokens(count: number) {
  const requests: Promise<string[]>[] = [];
  for (let start = 0; start < count; start += TOKENS_PER_REQUEST) {
    requests.push(getVoiceTokensAction(Math.min(TOKENS_PER_REQUEST, count - start)));
  }
  try {
    const batches = await Promise.all(requests);
    return batches.flat();
  } catch {
    return undefined;
  }
}
