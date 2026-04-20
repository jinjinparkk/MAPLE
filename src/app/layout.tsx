import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

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
    default: "메이플 스펙업 가이드 - 예산 기반 스펙업 로드맵",
    template: "%s | 메이플 스펙업 가이드",
  },
  description:
    "메이플스토리 캐릭터의 예산 대비 최적 스펙업 순서를 자동으로 분석합니다. 닉네임과 예산을 입력하면 환산주스탯 대비 가성비 높은 강화 로드맵을 제공합니다.",
  keywords: [
    "메이플스토리",
    "스펙업",
    "로드맵",
    "환산주스탯",
    "스타포스",
    "심볼",
    "가성비",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "메이플 스펙업 가이드",
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
      <body className="min-h-full flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
