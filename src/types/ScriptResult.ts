import type { Script } from "./Script";

export type ScriptResult = { status: "written"; script: Script } | { status: "failed"; message: string };
