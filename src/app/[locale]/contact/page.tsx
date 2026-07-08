import { PageShell } from "@/components/page-shell";
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

export default async function ContactPage({
  params
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dictionary = getDictionary(locale);

  return (
    <PageShell
      eyebrow={dictionary.contact.eyebrow}
      title={dictionary.contact.title}
      description={dictionary.contact.description}
    />
  );
}
