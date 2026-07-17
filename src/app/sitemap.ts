import type { MetadataRoute } from "next";

const canonicalOrigin = "https://www.yoffepower.com";

const publicPaths = [
  "/",
  "/he",
  "/en",
  "/he/services",
  "/en/services",
  "/he/faq",
  "/en/faq",
  "/he/about",
  "/en/about",
  "/he/contact",
  "/en/contact",
  "/he/cable-calculator"
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPaths.map((path) => ({
    url: `${canonicalOrigin}${path}`,
    changeFrequency: "monthly",
    priority: path === "/" || path === "/he" ? 1 : 0.7
  }));
}
