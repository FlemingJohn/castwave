import type { ReactNode } from "react";

export type ButtonProps = {
  children: ReactNode;
  look: "primary" | "plain";
  type?: "button" | "submit";
  onClick?: () => void;
};
