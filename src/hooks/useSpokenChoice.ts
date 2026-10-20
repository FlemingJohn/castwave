import { useEffect, useRef, useState } from "react";
import { getVoiceTokensAction } from "@/server/actions/voices/getVoiceTokensAction";
import { openChoiceListener } from "@/services/listening/openChoiceListener";
import { matchSpokenChoice } from "@/services/text/matchSpokenChoice";

type ListeningStatus = "idle" | "starting" | "listening" | "failed";

export function useSpokenChoice(labels: string[], onMatch: (position: number) => void) {
  const [status, setStatus] = useState<ListeningStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => () => stopRef.current?.(), []);

  function stop() {
    stopRef.current?.();
    stopRef.current = null;
    setStatus("idle");
  }

  async function start() {
    setStatus("starting");
    setTranscript("");
    try {
      const [token] = await getVoiceTokensAction(1);
      const keyterms = [...labels, "first", "second"];
      stopRef.current = await openChoiceListener(
        token ?? "",
        keyterms,
        (turn) => {
          setTranscript(turn.transcript);
          const position = turn.end_of_turn ? matchSpokenChoice(turn.transcript, labels) : -1;
          if (position !== -1) {
            stop();
            onMatch(position);
          }
        },
        (message) => fail(message),
      );
      setStatus("listening");
    } catch (error) {
      fail(error instanceof Error ? error.message : "The microphone could not start.");
    }
  }

  function fail(message: string) {
    stopRef.current?.();
    stopRef.current = null;
    setErrorMessage(message);
    setStatus("failed");
  }

  return { status, transcript, errorMessage, start, stop };
}
