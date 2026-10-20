"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { WaitingForScript } from "@/components/illustrations/WaitingForScript/WaitingForScript";
import { PreparingScreen } from "@/components/preparing/PreparingScreen/PreparingScreen";
import { ScriptPlayer } from "@/components/studio/ScriptPlayer/ScriptPlayer";
import { useStoredScript } from "@/hooks/useStoredScript";
import { useVoicing } from "@/hooks/useVoicing";
import { getVoicingJob } from "@/services/voicing/getVoicingJob";
import type { VoicingJob } from "@/services/voicing/VoicingJob";
import styles from "./ScriptPreview.module.css";

export function ScriptPreview() {
  const { script, hasLoaded, saveScript } = useStoredScript();
  const scriptId = script?.id;
  const [job, setJob] = useState<VoicingJob | null>(null);
  const progress = useVoicing(job);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (script) {
      setJob(getVoicingJob(script));
    }
  }, [scriptId]);

  if (!isOpen && (progress?.status === "ready" || job?.hasAutoplayRequest())) {
    setIsOpen(true);
  }
  if (!hasLoaded || (script && !job)) {
    return null;
  }
  if (!script || !job) {
    return (
      <section className={styles.empty}>
        <WaitingForScript />
        <p>No script yet.</p>
        <Link href="/">Create one from a story, a link or an idea</Link>
      </section>
    );
  }
  if (!isOpen) {
    const playNow = () => {
      job.requestAutoplay();
      setIsOpen(true);
    };
    return (
      <PreparingScreen
        script={script}
        progress={progress}
        openLabel="Open the script"
        onOpen={() => setIsOpen(true)}
        onPlayNow={playNow}
      />
    );
  }
  return <ScriptPlayer script={script} job={job} onScriptChange={saveScript} />;
}
