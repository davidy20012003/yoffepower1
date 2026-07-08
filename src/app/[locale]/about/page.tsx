import { PageShell } from "@/components/page-shell";
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

export default async function AboutPage({
  params
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dictionary = getDictionary(locale);

  return (
    <PageShell
      eyebrow={dictionary.about.eyebrow}
      title={dictionary.about.title}
      description={dictionary.about.description}
    />
  );
}
