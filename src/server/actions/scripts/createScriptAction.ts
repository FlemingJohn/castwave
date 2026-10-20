"use server";

import { LlmGatewayError } from "@/server/errors/LlmGatewayError";
import { PageNotReadableError } from "@/server/errors/PageNotReadableError";
import { createScript } from "@/server/services/scripts/createScript";
import { ScriptFormat } from "@/types/ScriptFormat";
import type { ScriptResult } from "@/types/ScriptResult";
import { ScriptSource } from "@/types/ScriptSource";

export async function createScriptAction(formData: FormData): Promise<ScriptResult> {
  const source = ScriptSource.safeParse({
    kind: formData.get("source"),
    text: formData.get("text"),
    url: formData.get("url"),
    idea: formData.get("idea"),
    minutes: Number(formData.get("minutes")),
  });
  const format = ScriptFormat.safeParse(formData.get("format"));
  if (!source.success || !format.success) {
    return { status: "failed", message: "Fill in the story, link or idea before creating a script." };
  }
  try {
    const script = await createScript(source.data, format.data);
    return { status: "written", script };
  } catch (error) {
    if (error instanceof LlmGatewayError || error instanceof PageNotReadableError) {
      return { status: "failed", message: error.message };
    }
    throw error;
  }
}
