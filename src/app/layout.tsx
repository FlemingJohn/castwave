import type { Metadata } from "next";
import { Gabarito, Martian_Mono, Onest } from "next/font/google";
import type { ReactNode } from "react";
import { AppHeader } from "@/components/shell/AppHeader/AppHeader";
import "@/styles/theme.css";

const displayFont = Gabarito({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-gabarito" });
const bodyFont = Onest({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-onest" });
const monoFont = Martian_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-martian-mono" });

export const metadata: Metadata = {
  title: "Castwave",
  description: "Paste anything. Hear it performed.",
};

export default function RootLayout(props: { children: ReactNode }) {
  const fontVariables = [displayFont.variable, bodyFont.variable, monoFont.variable].join(" ");
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <AppHeader />
        {props.children}
      </body>
    </html>
  );
}
