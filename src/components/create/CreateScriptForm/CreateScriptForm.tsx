"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";
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
import { createScriptAction } from "@/server/actions/scripts/createScriptAction";
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
      router.push("/studio");
    });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
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
  );
}
