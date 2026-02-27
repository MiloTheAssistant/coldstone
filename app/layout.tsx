import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coldstone Soap Co. | Pure. American. Uncompromising.",
  description: "Minimal ingredient cold process soap. Veteran owned. Small batch crafted.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
