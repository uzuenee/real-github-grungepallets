import type { Metadata } from "next";
import { Inter, Bebas_Neue, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: {
    default: "Grunge Pallets & Recycling Services | Metro Atlanta Pallet Solutions",
    template: "%s | Grunge Pallets",
  },
  description: "Quality pallet supply, recycling, and logistics services for Metro Atlanta businesses. Grade A & B pallets with same-week delivery. Get your free quote today.",
  keywords: ["pallets", "pallet supply", "pallet recycling", "Atlanta pallets", "Metro Atlanta", "West Georgia", "logistics", "B2B", "wood pallets", "heat treated pallets"],
  authors: [{ name: "Grunge Pallets & Recycling Services" }],
  creator: "Grunge Pallets",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Grunge Pallets & Recycling Services",
    title: "Grunge Pallets & Recycling Services | Metro Atlanta Pallet Solutions",
    description: "Quality pallet supply, recycling, and logistics services for Metro Atlanta businesses. Same-week delivery available.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grunge Pallets & Recycling Services",
    description: "Quality pallet supply, recycling, and logistics for Metro Atlanta.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${bebasNeue.variable} ${outfit.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
