import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fakebook",
  description: "A social feed with AI-assisted Vietnamese content moderation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
