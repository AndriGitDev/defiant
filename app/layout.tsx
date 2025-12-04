import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DEFIANT | Real-Time Global Vulnerability Tracker",
  description: "Real-time CVE vulnerability tracking from NVD and EUVD. Interactive visualization of critical security vulnerabilities and exploits.",
  keywords: ["CVE", "security", "vulnerabilities", "cybersecurity", "NVD", "EUVD", "exploit tracking"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased scanline">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
