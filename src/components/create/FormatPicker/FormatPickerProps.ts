import type { ScriptFormat } from "@/types/ScriptFormat";

export type FormatPickerProps = {
  format: ScriptFormat;
  onPick: (format: ScriptFormat) => void;
};
