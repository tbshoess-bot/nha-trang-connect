import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { LanguageProvider } from "@/lib/LanguageContext";

export const metadata: Metadata = {
  title: "Sri Lanka Connect",
  description: "Community app for tourists and expats in Sri Lanka",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <Header />
          <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}
