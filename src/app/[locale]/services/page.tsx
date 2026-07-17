import type { Metadata } from "next";
import Link from "next/link";
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
    path: `/${locale}/services`,
    title: dictionary.services.metadata.title,
    description: dictionary.services.metadata.description
  });
}

export default async function ServicesPage({ params }: PageProps) {
  const { locale } = await params;
  const dictionary = getDictionary(locale);

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <h1 className="text-4xl font-bold text-slate-950">{dictionary.services.title}</h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">{dictionary.services.intro}</p>
        {locale === "he" ? (
          <Link
            className="mt-5 inline-flex rounded-md bg-blue-900 px-4 py-3 text-base font-semibold text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
            href="/he/cable-calculator"
          >
            למחשבון זרם מותר לכבלים
          </Link>
        ) : null}
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        {dictionary.services.sections.map((section) => (
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={section.title}>
            <h2 className="text-2xl font-bold text-slate-950">{section.title}</h2>
            <ul className="mt-4 space-y-2 text-slate-700">
              {section.items.map((item) => (
                <li className="flex gap-2" key={item}>
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-800" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
