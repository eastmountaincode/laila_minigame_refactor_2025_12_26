import type { Metadata } from "next";
import "./globals.css";
import { DevModeProvider } from "@/components/DevModeProvider";

export const metadata: Metadata = {
  title: "Something Dreadful's Gonna Happen",
  description: "Refactor of the original Webflow site.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <DevModeProvider />
        {children}
      </body>
    </html>
  );
}
