import type { Metadata } from "next";
import { Hanken_Grotesk, IBM_Plex_Mono, Outfit } from "next/font/google";
import type { ReactNode } from "react";
import { GrainGlow } from "@/components/background/GrainGlow/GrainGlow";
import { AppHeader } from "@/components/shell/AppHeader/AppHeader";
import "@/styles/theme.css";

const displayFont = Outfit({ subsets: ["latin"], weight: ["200", "300", "400", "500"], variable: "--font-outfit" });
const bodyFont = Hanken_Grotesk({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-hanken-grotesk" });
const monoFont = IBM_Plex_Mono({ subsets: ["latin"], weight: ["300", "400"], variable: "--font-ibm-plex-mono" });

export const metadata: Metadata = {
  title: "Castwave",
  description: "Paste anything. Hear it performed.",
};

export default function RootLayout(props: { children: ReactNode }) {
  const fontVariables = [displayFont.variable, bodyFont.variable, monoFont.variable].join(" ");
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <GrainGlow />
        <AppHeader />
        {props.children}
      </body>
    </html>
  );
}
