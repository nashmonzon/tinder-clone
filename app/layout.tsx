import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import ThemeProvider from "@/components/ThemeProvider";
import { MatchProvider } from "@/contexts/MatchContext";

export const metadata: Metadata = {
  title: "Tinder Clone - React Developer Test",
  description: "A Tinder-like application built with Next.js and MUI",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ErrorBoundary>
          <ThemeProvider>
            <MatchProvider>{children}</MatchProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
