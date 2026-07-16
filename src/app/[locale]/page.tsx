import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { contact, getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

type PageProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = getDictionary(locale);

  return {
    title: dictionary.metadata.title,
    description: dictionary.metadata.description,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        he: "/he",
        en: "/en"
      }
    }
  };
}

function ContactButtons({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <a className="primary-contact-button" href={contact.whatsAppHref}>
        {dictionary.contactActions.whatsApp}
      </a>
      <a className="primary-contact-button" href={contact.phoneHref}>
        {dictionary.contactActions.call}
      </a>
      <a className="primary-contact-button" href={contact.emailHref}>
        {dictionary.contactActions.email}
      </a>
    </div>
  );
}

function ServicePreview({
  title,
  items,
  href,
  button
}: {
  title: string;
  items: readonly string[];
  href: string;
  button: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
      <ul className="mt-4 space-y-2 text-slate-700">
        {items.map((item) => (
          <li className="flex gap-2" key={item}>
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-800" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <Link className="mt-5 inline-flex rounded-md bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800" href={href}>
        {button}
      </Link>
    </section>
  );
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  const dictionary = getDictionary(locale);
  const servicesHref = `/${locale}/services`;

  return (
    <div className="space-y-12">
      <section className="grid gap-8 md:grid-cols-[1fr_0.9fr] md:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-900">
            {dictionary.siteName}
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
            {dictionary.home.title}
          </h1>
          <p className="mt-4 text-xl font-medium text-slate-700">{dictionary.home.intro}</p>
          <div className="mt-7">
            <ContactButtons locale={locale} />
          </div>
          {locale === "he" ? (
            <Link
              className="mt-3 inline-flex w-full justify-center rounded-md border border-blue-900 px-4 py-3 text-base font-semibold text-blue-950 hover:bg-blue-50 sm:w-auto"
              href="/he/cable-calculator"
            >
              פתח את המחשבון
            </Link>
          ) : null}
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm">
          <Image
            alt={dictionary.home.imageAlt}
            className="object-contain"
            fill
            priority
            sizes="(min-width: 768px) 45vw, 100vw"
            src="/images/equipment-overview.jpg"
          />
        </div>
      </section>

      {locale === "he" ? (
        <section className="rounded-lg border border-blue-200 bg-blue-50 p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">עזרה בבחירת כבלים</h2>
              <p className="mt-2 text-base leading-7 text-slate-700">
                חישוב מהיר בשטח לפי שיטת התקנה, קיבוץ ובדיקת התאמת מפסק.
              </p>
            </div>
            <Link
              className="inline-flex w-full justify-center rounded-md bg-blue-900 px-4 py-3 text-base font-semibold text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 sm:w-auto"
              href="/he/cable-calculator"
            >
              פתח את המחשבון
            </Link>
          </div>
        </section>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <ServicePreview
          button={dictionary.home.learnMore}
          href={servicesHref}
          items={dictionary.home.testing.items}
          title={dictionary.home.testing.title}
        />
        <ServicePreview
          button={dictionary.home.learnMore}
          href={servicesHref}
          items={dictionary.home.consulting.items}
          title={dictionary.home.consulting.title}
        />
      </div>

      <section className="rounded-lg bg-blue-950 p-6 text-white sm:p-8">
        <h2 className="text-2xl font-bold">{dictionary.home.approachTitle}</h2>
        <p className="mt-4 max-w-4xl text-xl leading-8 text-blue-50">{dictionary.home.approach}</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-950">{dictionary.home.experienceTitle}</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {dictionary.home.experience.map((item) => (
            <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={item}>
              <p className="whitespace-pre-line text-base font-semibold leading-7 text-slate-800">
                {item}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
