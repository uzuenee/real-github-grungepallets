import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Grunge Pallets & Recycling Services | Metro Atlanta Pallet Solutions",
  description: "Quality pallet supply, recycling, and logistics services for Metro Atlanta businesses. Grade A & B pallets with same-week delivery. Get your free quote today.",
  keywords: "pallets, pallet supply, pallet recycling, Atlanta pallets, Metro Atlanta, West Georgia, logistics, B2B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
