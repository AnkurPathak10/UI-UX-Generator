import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider } from '@clerk/nextjs'
import Provider from "./provider";

const appFont = DM_Sans({
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: "UI/UX Generator",
  description: "Generate Premium",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={appFont.className}
        >
          <TooltipProvider>
            <Provider>     //User opens the website So Provider mounts immediately in the browser (because "use client")
              {children}
            </Provider>
          </TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
