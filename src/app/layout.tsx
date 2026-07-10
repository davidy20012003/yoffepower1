import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "David Yoffe Consulting & Testing",
    template: "%s"
  },
  description:
    "Independent electrical consulting and testing for reliable, efficient and compliant power systems."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
