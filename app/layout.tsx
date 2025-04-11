import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { StoreProvider } from "@/context/store-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyStore Dashboard",
  description: "A comprehensive business management dashboard",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <StoreProvider>
            {children}
            <Toaster />
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import "./globals.css";
