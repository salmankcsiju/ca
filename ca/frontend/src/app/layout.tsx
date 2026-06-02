import type { Metadata } from "next";
import "./globals.css";
import AppLayout from "@/components/layout/AppLayout";

export const metadata: Metadata = {
  title: "Casa Amora | Bespoke Elegance",
  description: "Bespoke elegance for Women & Kids. Crafted to your exact measurements and color preferences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
