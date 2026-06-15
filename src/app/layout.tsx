import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { DevModeProvider } from "@/components/DevModeProvider";

export const metadata: Metadata = {
  title: "Something Dreadful Is Going to Happen",
  description: "Something Dreadful Is Going to Happen",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <DevModeProvider>{children}</DevModeProvider>
        <Analytics />
      </body>
    </html>
  );
}
