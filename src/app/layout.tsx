import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/buttons.css";
import NavbarContainer from "../components/NavbarContainer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FNFantasy",
  description: "Your ultimate fantasy football experience",
  icons: {
    icon: [
      {
        url: '/logo2.png',
        href: '/logo2.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
    shortcut: '/logo2.png',
    apple: '/logo2.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NavbarContainer />
        <main className="min-h-screen" style={{ background: '#ffffff' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
