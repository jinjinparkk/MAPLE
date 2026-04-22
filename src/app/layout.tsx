import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MapleStory Wrapped - 나의 메이플 리포트",
    template: "%s | MapleStory Wrapped",
  },
  description:
    "메이플스토리 캐릭터를 분석하고 Spotify Wrapped 스타일의 비주얼 리포트 카드를 확인해보세요. 스타포스, 잠재능력, 심볼, 유니온, 헥사 종합 등급을 제공합니다.",
  keywords: [
    "메이플스토리",
    "MapleStory Wrapped",
    "캐릭터 분석",
    "스타포스",
    "잠재능력",
    "심볼",
    "유니온",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "MapleStory Wrapped",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-[#ededed]">
        {children}
      </body>
    </html>
  );
}
