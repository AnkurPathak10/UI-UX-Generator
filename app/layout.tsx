import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider } from '@clerk/nextjs'
import Provider from "./provider";
import { Toaster } from "sonner";

const appFont = DM_Sans({
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: "SketchPilot",
  description: "Generate Premium UI/UX designs for your app",
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
            <Toaster position="top-center" richColors/>
              <Provider>     
                {children}   
              </Provider>
            
          </TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
