import type { Metadata } from "next";
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
  title: {
    default: "Rate Limiter Visualizer",
    template: "%s | Rate Limiter Visualizer",
  },
  description:
    "Interactive visualization of rate limiting algorithms: token bucket, leaky bucket, fixed & sliding window. See real-time token flow, bursting behavior and request handling.",
  keywords: [
    "rate limiter",
    "token bucket",
    "leaky bucket",
    "rate limiting visualization",
    "API rate limiting",
    "token bucket demo",
    "system design visualizer",
  ].join(", "),
  robots: "index, follow",
  referrer: "origin-when-cross-origin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}