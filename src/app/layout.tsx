import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KHU Sports Golf",
  description: "경희대학교 총장배 골프대회 공식 홈페이지"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
