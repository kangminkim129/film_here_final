import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FilmHere - 미디어 속 그 장소",
  description: "미디어 속 그 장소, 당신만의 명장면이 되는 곳",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
