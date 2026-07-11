import type { Metadata } from "next";
import { FaqAccordion } from "@/components/faq-accordion";
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

type PageProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = getDictionary(locale);

  return {
    title: dictionary.faq.metadata.title,
    description: dictionary.faq.metadata.description,
    alternates: {
      canonical: `/${locale}/faq`,
      languages: {
        he: "/he/faq",
        en: "/en/faq"
      }
    }
  };
}

export default async function FaqPage({ params }: PageProps) {
  const { locale } = await params;
  const dictionary = getDictionary(locale);

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <h1 className="text-4xl font-bold text-slate-950">{dictionary.faq.title}</h1>
      </header>

      <FaqAccordion items={dictionary.faq.items} />
    </div>
  );
}
