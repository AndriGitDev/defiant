import type { Metadata } from "next";
import Script from "next/script";
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
      <head>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://swetrixapi.kindra.is/log/noscript?pid=rTi7PMrdRHsb"
            alt=""
            referrerPolicy="no-referrer-when-downgrade"
          />
        </noscript>
      </head>
      <body className="antialiased scanline">
        {children}
        <Script
          src="https://swetrix.org/swetrix.js"
          strategy="afterInteractive"
        />
        <Script id="swetrix-init" strategy="afterInteractive">
          {`
            document.addEventListener('DOMContentLoaded', function() {
              if (window.swetrix) {
                swetrix.init('rTi7PMrdRHsb', {
                  apiURL: 'https://swetrixapi.kindra.is/log',
                });
                swetrix.trackViews();
              }
            });
            // Also try immediately in case DOMContentLoaded already fired
            if (document.readyState !== 'loading' && window.swetrix) {
              swetrix.init('rTi7PMrdRHsb', {
                apiURL: 'https://swetrixapi.kindra.is/log',
              });
              swetrix.trackViews();
            }
          `}
        </Script>
      </body>
    </html>
  );
}
