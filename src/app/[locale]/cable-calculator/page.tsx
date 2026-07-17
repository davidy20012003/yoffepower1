import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CableCalculator } from "@/components/cable-calculator";
import { pageMetadata } from "@/app/seo";
import type { Locale } from "@/i18n/config";

type PageProps = {
  params: Promise<{ locale: Locale }>;
};

const calculatorTitle = "מחשבון בחירת כבלים לפי חוק החשמל | David Yoffe Consulting & Testing";
const calculatorDescription =
  "מחשבון כבלים מקצועי בעברית לבחירת חתך כבל, חישוב זרם מותר ובדיקת מפסק לפי שיטות התקנה ודרישות תקנות החשמל בישראל.";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;

  if (locale !== "he") {
    return {};
  }

  return pageMetadata({
    locale,
    path: "/he/cable-calculator",
    title: calculatorTitle,
    description: calculatorDescription,
    alternates: {
      canonical: "https://www.yoffepower.com/he/cable-calculator",
      languages: {
        he: "https://www.yoffepower.com/he/cable-calculator"
      }
    }
  });
}

export default async function CableCalculatorPage({ params }: PageProps) {
  const { locale } = await params;

  if (locale !== "he") {
    notFound();
  }

  return (
    <div className="space-y-8">
      <header className="max-w-4xl">
        <h1 className="mt-3 text-4xl font-bold leading-tight text-slate-950">מחשבון זרם מותר לכבלים</h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          בחירת כבל או מוליכים לפי שיטת התקנה, מקדמי תיקון, קיבוץ ובדיקת מפסק אוטומטי.
        </p>
      </header>

      <CableCalculator />
    </div>
  );
}
