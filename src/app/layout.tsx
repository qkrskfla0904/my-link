import type { Metadata } from "next";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "마이링크 (MyLink) | 나만의 맞춤형 링크 모음",
  description: "구글 소셜 로그인 기반 개인화 링크 허브 및 닌텐도 레트로 스타일 프로필",
  other: {
    google: "notranslate",
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
      translate="no"
      className={cn("h-full", "font-sans", "notranslate", inter.variable)}
    >
      <body className="min-h-full flex flex-col bg-[#7a8aba] text-[#21242e] font-sans antialiased selection:bg-[#f68d1f] selection:text-white">
        <AuthProvider>
          <div className="w-full max-w-[830px] mx-auto min-h-screen flex flex-col bg-[#7a8aba] border-x-2 border-[#3d4f97] shadow-2xl">
            <Header />
            <main className="flex-1 bg-[#7a8aba]">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
