import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Synapse AI",
  description: "Feel what it's like to be an AI",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="h-full" suppressHydrationWarning>{children}</body>
    </html>
  );
}
