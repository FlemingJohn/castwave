"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { FormatPicker } from "@/components/create/FormatPicker/FormatPicker";
import { IdeaPanel } from "@/components/create/IdeaPanel/IdeaPanel";
import { PasteTextPanel } from "@/components/create/PasteTextPanel/PasteTextPanel";
import { SourceTabs } from "@/components/create/SourceTabs/SourceTabs";
import { WebsiteLinkPanel } from "@/components/create/WebsiteLinkPanel/WebsiteLinkPanel";
import { Button } from "@/components/ui/Button/Button";
import { Hint } from "@/components/ui/Hint/Hint";
import { Icon } from "@/components/ui/Icon/Icon";
import type { ScriptFormat } from "@/types/ScriptFormat";
import type { ScriptSource } from "@/types/ScriptSource";
import styles from "./CreateScriptForm.module.css";

export function CreateScriptForm() {
  const router = useRouter();
  const [source, setSource] = useState<ScriptSource["kind"]>("text");
  const [format, setFormat] = useState<ScriptFormat>("audiobook");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/studio");
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
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
      <div className={styles.actions}>
        <Button look="primary" type="submit">
          Create script and play
          <Icon name="arrow" />
        </Button>
        <div className={styles.hint}>
          <Hint>The script is written by LLM Gateway, and every line is voiced by AssemblyAI.</Hint>
        </div>
      </div>
    </form>
  );
}
