import type { Script } from "@/types/Script";

export type StudioTopBarProps = {
  script: Script;
  isCastOpen: boolean;
  isBeside: boolean;
  onToggleCast: () => void;
  onToggleBeside: () => void;
  onPickShowcase: (slug: string) => void;
};
