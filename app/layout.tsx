import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DEFIANT | Breach Timeline",
  description: "Interactive 3D timeline of security vulnerabilities and breaches. Real-time CVE data visualization.",
  keywords: ["CVE", "security", "vulnerabilities", "cybersecurity", "breach timeline"],
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
      </body>
    </html>
  );
}
