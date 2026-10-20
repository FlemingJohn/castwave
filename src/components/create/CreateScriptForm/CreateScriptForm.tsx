"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";
import { PreparingScreen } from "@/components/preparing/PreparingScreen/PreparingScreen";
import { FormatPicker } from "@/components/create/FormatPicker/FormatPicker";
import { IdeaPanel } from "@/components/create/IdeaPanel/IdeaPanel";
import { PasteTextPanel } from "@/components/create/PasteTextPanel/PasteTextPanel";
import { SourceTabs } from "@/components/create/SourceTabs/SourceTabs";
import { WebsiteLinkPanel } from "@/components/create/WebsiteLinkPanel/WebsiteLinkPanel";
import { Button } from "@/components/ui/Button/Button";
import { ErrorNote } from "@/components/ui/ErrorNote/ErrorNote";
import { Hint } from "@/components/ui/Hint/Hint";
import { Icon } from "@/components/ui/Icon/Icon";
import { useStoredScript } from "@/hooks/useStoredScript";
import { useVoicing } from "@/hooks/useVoicing";
import { createScriptAction } from "@/server/actions/scripts/createScriptAction";
import { getPictureJob } from "@/services/pictures/getPictureJob";
import type { PictureJob } from "@/services/pictures/PictureJob";
import { getVoicingJob } from "@/services/voicing/getVoicingJob";
import type { VoicingJob } from "@/services/voicing/VoicingJob";
import type { Script } from "@/types/Script";
import type { ScriptFormat } from "@/types/ScriptFormat";
import type { ScriptSource } from "@/types/ScriptSource";
import styles from "./CreateScriptForm.module.css";

export function CreateScriptForm() {
  const router = useRouter();
  const { saveScript } = useStoredScript();
  const [source, setSource] = useState<ScriptSource["kind"]>("text");
  const [format, setFormat] = useState<ScriptFormat>("audiobook");
  const [errorMessage, setErrorMessage] = useState("");
  const [isWriting, startWriting] = useTransition();
  const [script, setScript] = useState<Script | null>(null);
  const [job, setJob] = useState<VoicingJob | null>(null);
  const [pictureJob, setPictureJob] = useState<PictureJob | null>(null);
  const progress = useVoicing(job);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setErrorMessage("");
    startWriting(async () => {
      const result = await createScriptAction(formData);
      if (result.status === "failed") {
        setErrorMessage(result.message);
        return;
      }
      saveScript(result.script);
      setScript(result.script);
      setJob(getVoicingJob(result.script));
      setPictureJob(getPictureJob(result.script));
    });
  }

  function playNow() {
    job?.requestAutoplay();
    router.push("/studio");
  }

  const isPreparing = isWriting || script !== null;

  return (
    <>
      {isPreparing && (
        <PreparingScreen
          script={script}
          progress={progress}
          pictureJob={pictureJob}
          openLabel="Open the Studio"
          onOpen={() => router.push("/studio")}
          onPlayNow={playNow}
        />
      )}
      <form className={styles.form} onSubmit={handleSubmit} hidden={isPreparing}>
        <input type="hidden" name="source" value={source} />
        <div className={styles.sourceCard}>
          <SourceTabs source={source} onPick={setSource} />
          <div hidden={source !== "text"}>
            <PasteTextPanel />
          </div>
          <div hidden={source !== "link"}>
            <WebsiteLinkPanel />
          </div>
          <div hidden={source !== "idea"}>
            <IdeaPanel />
          </div>
        </div>
        <FormatPicker format={format} onPick={setFormat} />
        {errorMessage && <ErrorNote message={errorMessage} />}
        <div className={styles.actions}>
          <Button look="primary" type="submit" isDisabled={isWriting}>
            {isWriting ? "Writing the script…" : "Create script and play"}
            <Icon name="arrow" />
          </Button>
          <div className={styles.hint}>
            <Hint>The script is written by LLM Gateway, and every line is voiced by AssemblyAI.</Hint>
          </div>
        </div>
      </form>
    </>
  );
}
