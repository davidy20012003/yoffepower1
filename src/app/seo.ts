import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";

export const canonicalOrigin = "https://www.yoffepower.com";
export const siteName = "David Yoffe Consulting & Testing";

const ogImage = {
  url: `${canonicalOrigin}/images/equipment-overview.jpg`,
  width: 1200,
  height: 900,
  alt: "Industrial electrical equipment"
};

export function absoluteUrl(path: string) {
  return `${canonicalOrigin}${path}`;
}

export function localizedAlternates(path: string) {
  return {
    canonical: absoluteUrl(path),
    languages: {
      he: absoluteUrl(path.replace(/^\/en/, "/he")),
      en: absoluteUrl(path.replace(/^\/he/, "/en"))
    }
  };
}

export function pageMetadata({
  locale,
  path,
  title,
  description,
  alternates
}: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  alternates?: Metadata["alternates"];
}): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: alternates ?? localizedAlternates(path),
    openGraph: {
      title,
      description,
      url,
      siteName,
      locale: locale === "he" ? "he_IL" : "en_US",
      type: "website",
      images: [ogImage]
    }
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${canonicalOrigin}/#organization`,
        name: siteName,
        url: canonicalOrigin,
        email: "david.yoffe1@gmail.com",
        telephone: "+972545978440"
      },
      {
        "@type": "ProfessionalService",
        "@id": `${canonicalOrigin}/#professional-service`,
        name: siteName,
        url: canonicalOrigin,
        email: "david.yoffe1@gmail.com",
        telephone: "+972545978440",
        areaServed: "IL",
        serviceType: [
          "Electrical consulting",
          "Electrical testing",
          "Cable selection calculator"
        ],
        provider: {
          "@id": `${canonicalOrigin}/#organization`
        }
      },
      {
        "@type": "WebSite",
        "@id": `${canonicalOrigin}/#website`,
        name: siteName,
        url: canonicalOrigin,
        publisher: {
          "@id": `${canonicalOrigin}/#organization`
        },
        inLanguage: ["he", "en"]
      }
    ]
  };
}
