import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./components/providers";
import I18nProvider from "./components/I18nProvider";
import WalkthroughProvider from "./components/walkthrough/WalkthroughProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "i-project - ระบบจัดการโครงการ",
  description: "i-project - ระบบจัดการโครงการ",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning className="scroll-smooth">
      <body className="bg-background font-sans text-foreground antialiased" suppressHydrationWarning>
        <Providers>
          <I18nProvider>
            <WalkthroughProvider>
              {children}
            </WalkthroughProvider>
          </I18nProvider>
        </Providers>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
