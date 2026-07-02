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
          /* ── Google Translate widget (new DOM: .goog-te-gadget-simple > img + span > a) ── */
          #google_translate_element {
            display: flex !important;
            align-items: center !important;
            overflow: hidden !important;
          }
          #google_translate_element .goog-te-gadget-simple {
            background: transparent !important;
            border: 1px solid rgba(255,255,255,0.35) !important;
            border-radius: 20px !important;
            padding: 4px 10px !important;
            font-size: 12px !important;
            line-height: 1 !important;
            display: inline-flex !important;
            align-items: center !important;
            white-space: nowrap !important;
            cursor: pointer !important;
            gap: 0 !important;
          }
          /* Hide Google's flag/logo image */
          #google_translate_element .goog-te-gadget-simple img,
          #google_translate_element .goog-te-gadget-icon {
            display: none !important;
          }
          /* Span wrapper + anchor */
          #google_translate_element .goog-te-gadget-simple > span {
            display: inline-flex !important;
            align-items: center !important;
          }
          #google_translate_element .goog-te-gadget-simple > span::before {
            content: "🌐";
            margin-right: 5px;
            font-size: 13px;
            line-height: 1;
          }
          #google_translate_element .goog-te-gadget-simple a,
          #google_translate_element .goog-te-gadget-simple span {
            color: white !important;
            text-decoration: none !important;
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
        <Script id="gt-init" strategy="beforeInteractive">{`
          window.googleTranslateElementInit = function() {
            new google.translate.TranslateElement({
              pageLanguage: 'en',
              includedLanguages: 'ru,uk,de,fr,zh-CN,ar,es,it,ja,ko,tr,pl',
              layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false
            }, 'google_translate_element');
          };
        `}</Script>
        <Script
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
