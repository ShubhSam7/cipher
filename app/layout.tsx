import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { MotionProvider } from "@/components/motion/MotionProvider";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Cipher", template: "%s · Cipher" },
  description: "Unfiltered campus conversations for IIIT Nagpur students.",
  openGraph: {
    title: "Cipher",
    description: "Unfiltered campus conversations for IIIT Nagpur students.",
    siteName: "Cipher",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#f6f2e8" }, { media: "(prefers-color-scheme: dark)", color: "#0f1513" }],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} font-sans antialiased`}>
        <ThemeProvider><MotionProvider>{children}<Toaster /></MotionProvider></ThemeProvider>
      </body>
    </html>
  );
}
