import type { Metadata } from "next";
import Image from "next/image";
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

type PageProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = getDictionary(locale);

  return {
    title: dictionary.about.metadata.title,
    description: dictionary.about.metadata.description
  };
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  const dictionary = getDictionary(locale);

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <h1 className="text-4xl font-bold text-slate-950">{dictionary.about.title}</h1>
        <p className="mt-5 text-2xl font-semibold text-slate-900">{dictionary.about.name}</p>
        <p className="mt-2 text-lg leading-8 text-slate-700">{dictionary.about.education}</p>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <ul className="space-y-3 text-slate-700">
          {dictionary.about.items.map((item) => (
            <li className="flex gap-2" key={item}>
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-800" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-5 md:grid-cols-[0.8fr_1fr] md:items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">{dictionary.about.credentialsTitle}</h2>
          <p className="mt-3 text-lg font-semibold text-slate-800">{dictionary.about.credential}</p>
          <a
            className="mt-5 inline-flex rounded-md bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
            href="/images/bodek-3-license.jpg"
            target="_blank"
            rel="noreferrer"
          >
            {dictionary.about.openLicense}
          </a>
        </div>
        <a
          className="block overflow-hidden rounded-lg border border-slate-200 bg-white p-2 shadow-sm"
          href="/images/bodek-3-license.jpg"
          target="_blank"
          rel="noreferrer"
        >
          <Image
            alt={dictionary.about.licenseAlt}
            className="h-auto w-full rounded-md"
            height={850}
            priority
            sizes="(min-width: 768px) 55vw, 100vw"
            src="/images/bodek-3-license.jpg"
            width={1200}
          />
        </a>
      </section>
    </div>
  );
}
