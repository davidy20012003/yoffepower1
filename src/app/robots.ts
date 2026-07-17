import type { MetadataRoute } from "next";

const canonicalOrigin = "https://www.yoffepower.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/"
    },
    sitemap: `${canonicalOrigin}/sitemap.xml`,
    host: canonicalOrigin
  };
}
