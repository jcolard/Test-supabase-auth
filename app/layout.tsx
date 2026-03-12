import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notes de Frais",
  description: "Gérez vos notes de frais simplement",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
