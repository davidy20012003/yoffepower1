import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yoffe Power",
  description: "Professional website foundation"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
