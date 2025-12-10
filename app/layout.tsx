import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Kai - English Learning",
  description: "Learn English with Kai at Kariyer Koleji! Fun games, stories, and vocabulary for kids.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} antialiased`}>
        <AuthGuard>
          <Navbar />
          <main className="pt-16 min-h-screen">
            {children}
          </main>
        </AuthGuard>
      </body>
    </html>
  );
}
