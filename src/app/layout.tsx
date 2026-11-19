import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { PlayerProvider } from "@/features/player/player-provider";
import "@fontsource-variable/inter/wght.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Senandung — Temukan nada, temukan rasa", template: "%s · Senandung" },
  description: "Ruang baru untuk menemukan musik dan suasana. Pratinjau beta Senandung.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>
        <PlayerProvider>
          <AppShell>{children}</AppShell>
        </PlayerProvider>
      </body>
    </html>
  );
}
