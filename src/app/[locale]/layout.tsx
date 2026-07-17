import { notFound } from "next/navigation";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { organizationJsonLd } from "@/app/seo";
import { contact, getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales } from "@/i18n/config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dir = locale === "he" ? "rtl" : "ltr";
  const dictionary = getDictionary(locale);
  const phoneDisplay =
    locale === "he" ? contact.phoneHebrewDisplay : contact.phoneDisplay;
  const year = new Date().getFullYear();
  const jsonLd = organizationJsonLd();

  return (
    <html lang={locale} dir={dir}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="flex min-h-screen flex-col">
          <Navigation locale={locale} />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 pb-28 sm:px-6 sm:py-12 md:pb-12 lg:px-8">
            {children}
          </main>
          <footer className="border-t border-slate-200 bg-slate-950 text-white">
            <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-8 text-sm sm:px-6 md:grid-cols-[1fr_auto] md:items-center lg:px-8">
              <div>
                <p className="font-semibold">{dictionary.siteName}</p>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-slate-300">
                  <a className="hover:text-white" href={contact.phoneHref}>
                    {phoneDisplay}
                  </a>
                  <a className="hover:text-white" href={contact.whatsAppHref}>
                    {contact.whatsAppDisplay}
                  </a>
                  <a className="hover:text-white" href={contact.emailHref}>
                    {contact.emailDisplay}
                  </a>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-slate-300">
                <Link className="hover:text-white" href="/he" hrefLang="he">
                  עברית
                </Link>
                <span aria-hidden="true">|</span>
                <Link className="hover:text-white" href="/en" hrefLang="en">
                  English
                </Link>
                <span className="basis-full md:basis-auto">
                  © {year} {dictionary.footer.copyright}
                </span>
              </div>
            </div>
          </footer>
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-2 shadow-[0_-4px_16px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
            <div className="mx-auto grid max-w-6xl grid-cols-3 gap-2">
              <a className="mobile-contact-button" href={contact.whatsAppHref}>
                {dictionary.contactActions.whatsApp}
              </a>
              <a className="mobile-contact-button" href={contact.phoneHref}>
                {dictionary.contactActions.call}
              </a>
              <a className="mobile-contact-button" href={contact.emailHref}>
                {dictionary.contactActions.email}
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
