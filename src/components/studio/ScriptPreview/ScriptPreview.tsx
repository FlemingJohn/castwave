"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { WaitingForScript } from "@/components/illustrations/WaitingForScript/WaitingForScript";
import { PreparingScreen } from "@/components/preparing/PreparingScreen/PreparingScreen";
import { ScriptPlayer } from "@/components/studio/ScriptPlayer/ScriptPlayer";
import { useStoredScript } from "@/hooks/useStoredScript";
import { useVoicing } from "@/hooks/useVoicing";
import { getPictureJob } from "@/services/pictures/getPictureJob";
import { loadShowcaseStory } from "@/services/showcase/loadShowcaseStory";
import type { PictureJob } from "@/services/pictures/PictureJob";
import { getVoicingJob } from "@/services/voicing/getVoicingJob";
import type { VoicingJob } from "@/services/voicing/VoicingJob";
import styles from "./ScriptPreview.module.css";

export function ScriptPreview() {
  const { script, hasLoaded, saveScript } = useStoredScript();
  const scriptId = script?.id;
  const [job, setJob] = useState<VoicingJob | null>(null);
  const [pictureJob, setPictureJob] = useState<PictureJob | null>(null);
  const progress = useVoicing(job);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (script) {
      setJob(getVoicingJob(script));
      setPictureJob(getPictureJob(script));
    }
  }, [scriptId]);

  async function openShowcase(slug: string) {
    const story = await loadShowcaseStory(slug).catch(() => null);
    if (story) {
      getVoicingJob(story.script).requestAutoplay();
      saveScript(story.script);
    }
  }

  if (!isOpen && (progress?.status === "ready" || job?.hasAutoplayRequest())) {
    setIsOpen(true);
  }
  if (!hasLoaded || (script && (!job || !pictureJob))) {
    return null;
  }
  if (!script || !job || !pictureJob) {
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
        pictureJob={pictureJob}
        openLabel="Open the script"
        onOpen={() => setIsOpen(true)}
        onPlayNow={playNow}
      />
    );
  }
  return (
    <ScriptPlayer
      key={script.id}
      script={script}
      job={job}
      pictureJob={pictureJob}
      onScriptChange={saveScript}
      onPickShowcase={(slug) => void openShowcase(slug)}
    />
  );
}
