import type { Metadata } from "next";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "MyLink.com (2001) | Official Nintendo Style Hardware Hub",
  description: "Nintendo.com circa 2001 console hardware web interface for MyLink",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={cn("h-full", "font-sans", inter.variable)}>
      <body className="min-h-full flex flex-col bg-[#7a8aba] text-[#21242e] font-sans antialiased selection:bg-[#f68d1f] selection:text-white">
        <div className="w-full max-w-[830px] mx-auto min-h-screen flex flex-col bg-[#7a8aba] border-x-2 border-[#3d4f97] shadow-2xl">
          <Header />
          <main className="flex-1 bg-[#7a8aba]">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
