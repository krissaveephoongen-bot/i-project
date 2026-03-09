import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import ProtectedLayout from "./components/ProtectedLayout";
import { Providers } from "./components/providers";
import I18nProvider from "./components/I18nProvider";
import DataSyncProvider from "./components/DataSyncProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import WalkthroughProvider from "./components/walkthrough/WalkthroughProvider";

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
    <html lang="th" suppressHydrationWarning>
      <body className="bg-background" suppressHydrationWarning>
        <I18nProvider>
          <Providers>
            <AuthProvider>
              <WalkthroughProvider>
                <ProtectedLayout>{children}</ProtectedLayout>
              </WalkthroughProvider>
            </AuthProvider>
          </Providers>
        </I18nProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
