import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Satta Matka Admin",
  description: "Admin panel for Satta Matka platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Strip browser-extension attributes (Google Translate / Grammarly)
            that get injected onto <html>/<body> and trigger a hydration warning. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.removeAttribute('data-new-gr-c-s-check-loaded');document.documentElement.removeAttribute('data-gr-ext-installed');document.body&&document.body.removeAttribute('data-new-gr-c-s-check-loaded');document.body&&document.body.removeAttribute('data-gr-ext-installed');",
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
