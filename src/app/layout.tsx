import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import PWARegister from "@/components/PWARegister";

export const metadata: Metadata = {
  title: "FilmHere — 영화·드라마 촬영지 지도",
  description: "미디어 속 그 장소, 당신만의 명장면이 되는 곳. K-콘텐츠 촬영지를 지도에서 찾고 길찾기로 직접 방문하세요.",
  manifest: "/manifest.webmanifest",
  applicationName: "FilmHere",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "FilmHere" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  openGraph: {
    title: "FilmHere — 영화·드라마 촬영지 지도",
    description: "미디어 속 그 장소, 당신만의 명장면이 되는 곳.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#121212",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <I18nProvider>{children}</I18nProvider>
        <PWARegister />
      </body>
    </html>
  );
}
