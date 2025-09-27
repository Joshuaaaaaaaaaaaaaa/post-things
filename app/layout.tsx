import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientToaster from "@/components/ClientToaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "포스트잇 메모",
  description: "포스트잇 메모 앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {children}
        <ClientToaster />
      </body>
    </html>
  );
}