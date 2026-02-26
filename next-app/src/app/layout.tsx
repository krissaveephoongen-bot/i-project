import type { Metadata } from "next";
import "../globals.css";
import { AuthProvider } from "@/processes/auth/ui/AuthProvider";
import { ProtectedLayout } from "@/shared/ui/layouts/ProtectedLayout";
import { Providers } from "@/shared/ui/providers/Providers";
import { I18nProvider } from "@/processes/auth/ui/I18nProvider";

export const metadata: Metadata = {
  title: "i-project - Enterprise Project Governance Platform",
  description: "i-project - Enterprise Project Governance Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background" suppressHydrationWarning>
        <I18nProvider>
          <Providers>
            <AuthProvider>
              <ProtectedLayout>{children}</ProtectedLayout>
            </AuthProvider>
          </Providers>
        </I18nProvider>
      </body>
    </html>
  );
}
