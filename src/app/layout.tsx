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
  title: "GrokCII",
  description: "Generate unique fantasy characters with ASCII art",
  icons: {
    icon: [
      {
        url: '/green-g-logo.svg',
        href: '/green-g-logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
    shortcut: '/green-g-logo.svg',
    apple: '/green-g-logo.svg',
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
        <main className="min-h-screen" style={{ background: '#030617' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
