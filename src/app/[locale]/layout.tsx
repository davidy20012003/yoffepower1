import { notFound } from "next/navigation";
import { Navigation } from "@/components/navigation";
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

  return (
    <html lang={locale} dir={dir}>
      <body>
        <div className="min-h-screen">
          <Navigation locale={locale} />
          <main className="mx-auto flex w-full max-w-6xl px-6 py-12 sm:px-8 lg:px-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
