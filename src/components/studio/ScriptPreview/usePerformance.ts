import { useEffect, useRef, useState } from "react";
import { SPEECH_SAMPLE_RATE } from "@/services/speech/speechSampleRate";
import type { VoicingJob } from "@/services/voicing/VoicingJob";
import type { AmbienceName } from "@/types/AmbienceName";
import type { PerformanceStatus } from "@/types/PerformanceStatus";
import type { PerformanceLine } from "./PerformanceLine";
import type { PerformanceSnapshot } from "./PerformanceSnapshot";
import { ScriptPerformance } from "./ScriptPerformance";

const EMPTY_SNAPSHOT: PerformanceSnapshot = {
  statuses: [],
  playingPosition: -1,
  spokenWordCount: 0,
  hasFinished: false,
};

export function usePerformance(job: VoicingJob, ambience: AmbienceName | undefined) {
  const [status, setStatus] = useState<PerformanceStatus>("idle");
  const [snapshot, setSnapshot] = useState<PerformanceSnapshot>(EMPTY_SNAPSHOT);
  const performanceRef = useRef<ScriptPerformance | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

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
        performanceRef.current?.fadeOutAmbience();
        setStatus("finished");
        return;
      }
      frame = requestAnimationFrame(readSnapshot);
    };
    frame = requestAnimationFrame(readSnapshot);
    return () => cancelAnimationFrame(frame);
  }, [status]);

  function play(lines: PerformanceLine[], firstPosition: number) {
    endPerformance(performanceRef, audioRef);
    const audio = new AudioContext({ sampleRate: SPEECH_SAMPLE_RATE });
    audioRef.current = audio;
    performanceRef.current = new ScriptPerformance({
      audio,
      lines,
      firstPosition,
      job,
      ambience,
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
    endPerformance(performanceRef, audioRef);
    setSnapshot(EMPTY_SNAPSHOT);
    setStatus("idle");
  }

  function readVoiceLevel() {
    return performanceRef.current?.readVoiceLevel() ?? 0;
  }

  return { status, snapshot, play, pause, resume, stop, readVoiceLevel };
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
