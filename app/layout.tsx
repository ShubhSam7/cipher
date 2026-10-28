import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

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
  themeColor: "#111310",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${manrope.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
