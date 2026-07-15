import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CableCalculator } from "@/components/cable-calculator";
import type { Locale } from "@/i18n/config";

type PageProps = {
  params: Promise<{ locale: Locale }>;
};

export const metadata: Metadata = {
  title: "מחשבון זרם מותר לכבלים | David Yoffe Consulting & Testing",
  description: "מחשבון בעברית לחישוב זרם מותר לכבלים ובדיקת התאמת מפסק אוטומטי."
};

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
