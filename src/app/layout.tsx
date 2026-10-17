import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/styles/theme.css";

export const metadata: Metadata = {
  title: "Castwave",
  description: "Paste anything. Hear it performed.",
};

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{props.children}</body>
    </html>
  );
}
