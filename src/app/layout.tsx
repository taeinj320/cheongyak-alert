import type { Metadata } from "next";
import Link from "next/link";
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
  title: "우리동네 혜택/청약 알리미",
  description: "우리동네 혜택과 청약 공고를 한 곳에서 검색할 수 있는 통합 서비스입니다.",
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
      <body className="min-h-full flex flex-col bg-slate-50">
        <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur">
          <nav className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="text-sm font-bold text-slate-900">
              우리동네 알리미
            </Link>
            <div className="flex items-center gap-2 text-sm">
              <Link href="/" className="rounded-md px-3 py-1.5 hover:bg-slate-100">
                혜택 알리미
              </Link>
              <Link href="/cheongyak" className="rounded-md px-3 py-1.5 hover:bg-slate-100">
                청약 공고
              </Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
