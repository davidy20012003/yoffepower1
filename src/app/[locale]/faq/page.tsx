import type { Metadata } from "next";
import Link from "next/link";
import { FaqAccordion } from "@/components/faq-accordion";
import { pageMetadata } from "@/app/seo";
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

type PageProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = getDictionary(locale);

  return pageMetadata({
    locale,
    path: `/${locale}/faq`,
    title: dictionary.faq.metadata.title,
    description: dictionary.faq.metadata.description
  });
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

      {locale === "he" ? (
        <section className="rounded-lg border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950">עזרה בבחירת כבלים</h2>
          <p className="mt-2 text-base leading-7 text-slate-700">
            ניתן להשתמש במחשבון הכבלים לחישוב זרם מותר ובדיקת התאמת מפסק לפי שיטת ההתקנה.
          </p>
          <Link
            className="mt-4 inline-flex rounded-md bg-blue-900 px-4 py-3 text-base font-semibold text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
            href="/he/cable-calculator"
          >
            פתח את המחשבון
          </Link>
        </section>
      ) : null}
    </div>
  );
}
