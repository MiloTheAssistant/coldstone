import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://coldstonesoapco.com"),
  title: "Coldstone Soap Co. | Pure. American. Uncompromising.",
  description:
    "Handcrafted cold process soap. Veteran owned. Small batch. Minimal ingredients. Made in the USA.",
  openGraph: {
    title: "Coldstone Soap Co. | Pure. American. Uncompromising.",
    description:
      "Handcrafted cold process soap. Veteran owned. Small batch. Made in the USA.",
    type: "website",
    images: [{ url: "/stone-forge.jpg", width: 1200, height: 630, alt: "Coldstone Soap Co." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Coldstone Soap Co.",
    description: "Handcrafted cold process soap. Veteran owned. Small batch. Made in the USA.",
    images: ["/stone-forge.jpg"],
  },
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
