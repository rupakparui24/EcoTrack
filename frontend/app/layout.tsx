import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "EcoTrack",
  description: "Smart Waste Management Operations Dashboard"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

