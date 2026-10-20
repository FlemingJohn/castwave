import type { ReactNode } from "react";
import type { IconName } from "@/components/ui/Icon/IconName";

export type PreparingStepProps = {
  icon: IconName;
  title: string;
  detail: string;
  state: "waiting" | "active" | "done";
  children?: ReactNode;
};
