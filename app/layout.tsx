import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "My Diary",
  description: "A personal diary to keep track record of different things",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900 selection:bg-cyan-200 selection:text-cyan-900">
        
        <Script
          src="https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1"
          strategy="afterInteractive"
        />

        <div className="flex-1 flex flex-col">{children}</div>

        <df-messenger
          intent="WELCOME"
          chat-title="Newthing2026"
          agent-id="8186310b-371f-44d7-9d8f-bf971cd32967"
          language-code="en"
        ></df-messenger>

      </body>
    </html>
  );
}