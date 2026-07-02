import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import PushNotifications from "@/components/PushNotifications";
import InstallBanner from "@/components/InstallBanner";
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
  icons: {
    icon: [{ url: "/icon-192.png", type: "image/png" }],
    shortcut: "/icon-192.png",
    apple: "/icon-192.png",
  },
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
        <style>{`
          /* ── Google Translate widget ── */
          #google_translate_element {
            display: flex !important;
            align-items: center !important;
            overflow: hidden !important;
          }
          #google_translate_element .goog-te-gadget-simple {
            background: transparent !important;
            border: 1px solid rgba(255,255,255,0.35) !important;
            border-radius: 20px !important;
            padding: 4px 10px 4px 8px !important;
            font-size: 12px !important;
            line-height: 1 !important;
            display: inline-flex !important;
            align-items: center !important;
            white-space: nowrap !important;
            cursor: pointer !important;
          }
          #google_translate_element .goog-te-gadget-simple img {
            display: none !important;
          }
          #google_translate_element .goog-te-gadget-simple a {
            color: white !important;
            text-decoration: none !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 3px !important;
          }
          #google_translate_element .goog-te-gadget-simple .goog-te-menu-value {
            display: inline-flex !important;
            align-items: center !important;
            gap: 2px !important;
          }
          #google_translate_element .goog-te-gadget-simple .goog-te-menu-value span {
            color: white !important;
          }
          /* Hide the | pipe separator */
          #google_translate_element .goog-te-gadget-simple .goog-te-menu-value > span:nth-child(2) {
            display: none !important;
          }
          /* Add globe icon before language text */
          #google_translate_element .goog-te-gadget-simple .goog-te-menu-value > span:first-child::before {
            content: "🌐 ";
          }
          /* Style the ▼ arrow */
          #google_translate_element .goog-te-gadget-simple .goog-te-menu-value > span:last-child {
            font-size: 9px !important;
            opacity: 0.6 !important;
            margin-left: 2px !important;
          }
          .goog-te-banner-frame { display: none !important; }
          body { top: 0 !important; }
        `}</style>
      </head>
      <body>
        <LanguageProvider>
          <Header />
          <main className="max-w-2xl mx-auto px-4 py-5">{children}</main>
          <PushNotifications />
          <InstallBanner />
        </LanguageProvider>
        <Script id="gt-init" strategy="afterInteractive">{`
          function googleTranslateElementInit() {
            new google.translate.TranslateElement({
              pageLanguage: 'en',
              includedLanguages: 'ru,uk,de,fr,zh-CN,ar,es,it,ja,ko,tr,pl',
              layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false
            }, 'google_translate_element');
          }
        `}</Script>
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
