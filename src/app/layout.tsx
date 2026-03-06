import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RBS Education Portal",
  description: "Resurgence Biomedical Sciences â Training & Education Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bitter:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-navy-50/30">
        {children}
      </body>
    </html>
  );
}
