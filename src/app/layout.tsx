import type { Metadata } from "next";
import { canonicalOrigin, siteName } from "./seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(canonicalOrigin),
  title: {
    default: siteName,
    template: "%s"
  },
  description:
    "Independent electrical consulting and testing for reliable, efficient and compliant power systems.",
  openGraph: {
    siteName,
    type: "website",
    images: [
      {
        url: "/images/equipment-overview.jpg",
        width: 1200,
        height: 900,
        alt: "Industrial electrical equipment"
      }
    ]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
