import "./globals.css";
import { Header } from "./_components/Header";



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