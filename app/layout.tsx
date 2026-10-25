import "./globals.css";
import { Header } from "./_components/Header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TABERU",
  description: "買い物リスト・献立・レシピ・予算をひとつにまとめた食卓管理アプリ",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <Header />
        <main className="bg-amber-50 min-h-screen">{children}</main>
      </body>

    </html>
  );
}
