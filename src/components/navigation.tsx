import Link from "next/link";
import { defaultLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

const pages = [
  { href: "", key: "home" },
  { href: "about", key: "about" },
  { href: "services", key: "services" },
  { href: "contact", key: "contact" }
] as const;

export function Navigation({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const alternateLocale: Locale = locale === "he" ? "en" : defaultLocale;

  return (
    <header className="border-b border-[var(--border)] bg-white">
      <nav className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <Link className="text-lg font-semibold tracking-normal" href={`/${locale}`}>
          {dictionary.siteName}
        </Link>
        <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
          {pages.map((page) => (
            <Link
              className="rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950"
              href={`/${locale}${page.href ? `/${page.href}` : ""}`}
              key={page.key}
            >
              {dictionary.navigation[page.key]}
            </Link>
          ))}
          <Link
            className="rounded-md border border-[var(--border)] px-3 py-2 font-medium text-slate-900 transition hover:bg-slate-100"
            href={`/${alternateLocale}`}
            hrefLang={alternateLocale}
          >
            {dictionary.languageSwitch}
          </Link>
        </div>
      </nav>
    </header>
  );
}
