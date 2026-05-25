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
  title: "Elev8U — Find Trusted Local Professionals in South Africa",
  description:
    "AI-powered marketplace connecting skilled South Africans with clients. Find vetted mechanics, designers, developers and more. Powered by Evolute AI.",
  keywords:
    "freelancer South Africa, AI matching, mechanic Johannesburg, designer Cape Town, web developer South Africa, Elev8U",
  metadataBase: new URL("https://elev8u.co.za"),
  openGraph: {
    title: "Elev8U — AI-Powered Freelancer Marketplace",
    description:
      "Find trusted local professionals in South Africa. Powered by Evolute AI.",
    url: "https://elev8u.co.za",
    siteName: "Elev8U",
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elev8U — Find Trusted Local Professionals",
    description:
      "AI-powered marketplace for South Africa. Powered by Evolute AI.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
