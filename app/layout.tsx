import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import PushNotifications from "@/components/PushNotifications";
import { LanguageProvider } from "@/lib/LanguageContext";

export const metadata: Metadata = {
  title: "Sri Lanka Connect — Community for Travelers & Expats",
  description: "Find events, ask questions, meet fellow travelers and expats in Sri Lanka. The local community app for tourists, backpackers and expats.",
  keywords: "Sri Lanka, travelers, expats, community, events, Hikkaduwa, Galle, Colombo, backpackers",
  openGraph: {
    title: "Sri Lanka Connect",
    description: "Community app for travelers & expats in Sri Lanka",
    type: "website",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SL Connect",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#8D153A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        <LanguageProvider>
          <Header />
          <main className="max-w-2xl mx-auto px-4 py-5">{children}</main>
          <PushNotifications />
        </LanguageProvider>
      </body>
    </html>
  );
}
