import type { Metadata } from "next";
import { Fustat, Open_Sans, Roboto_Mono, Creepster } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";

const fustat = Fustat({
  subsets: ["latin"],
  variable: "--font-fustat",
  display: "swap",
  weight: ["300", "400", "600", "700", "800"],
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
  weight: ["400", "600", "700", "800"],
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const creepster = Creepster({
  subsets: ["latin"],
  variable: "--font-creepster",
  display: "swap",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "kreepycode — Practice Code. Daily.",
  description: "High-performance coding platform with structured daily pacing for DSA, SQL, and Backend engineering.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/kreepycode-mark.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
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
      className={`h-full antialiased ${fustat.variable} ${openSans.variable} ${robotoMono.variable} ${creepster.variable}`}
    >
      <body className="min-h-full flex flex-col bg-black text-white font-sans selection:bg-[#00FF66] selection:text-black">
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
