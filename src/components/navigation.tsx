import Link from "next/link";
import { defaultLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

const pages = [
  { href: "", key: "home" },
  { href: "services", key: "services" },
  { href: "about", key: "about" },
  { href: "contact", key: "contact" }
] as const;

function localePath(locale: Locale, href: string) {
  return `/${locale}${href ? `/${href}` : ""}`;
}

export function Navigation({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const alternateLocale: Locale = locale === "he" ? "en" : defaultLocale;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8"
      >
        <Link className="max-w-48 text-sm font-bold leading-tight text-slate-950 sm:max-w-none sm:text-base" href={`/${locale}`}>
          {dictionary.siteName}
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {pages.map((page) => (
            <Link
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
              href={localePath(locale, page.href)}
              key={page.key}
            >
              {dictionary.navigation[page.key]}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            href={`/${alternateLocale}`}
            hrefLang={alternateLocale}
          >
            {dictionary.alternateLanguageName}
          </Link>

          <details className="group relative md:hidden">
            <summary
              aria-label={dictionary.navigation.menu}
              className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-md border border-slate-300 text-slate-900 transition hover:bg-slate-100 [&::-webkit-details-marker]:hidden"
            >
              <span className="flex flex-col gap-1.5" aria-hidden="true">
                <span className="h-0.5 w-5 rounded bg-current" />
                <span className="h-0.5 w-5 rounded bg-current" />
                <span className="h-0.5 w-5 rounded bg-current" />
              </span>
            </summary>
            <div className="absolute end-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
              {pages.map((page) => (
                <Link
                  className="block rounded-md px-3 py-3 text-sm font-medium text-slate-800 hover:bg-slate-100"
                  href={localePath(locale, page.href)}
                  key={page.key}
                >
                  {dictionary.navigation[page.key]}
                </Link>
              ))}
            </div>
          </details>
        </div>
      </nav>
    </header>
  );
}
