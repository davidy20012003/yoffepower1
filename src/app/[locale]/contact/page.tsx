import type { Metadata } from "next";
import { contact, getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

type PageProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = getDictionary(locale);

  return {
    title: dictionary.contact.metadata.title,
    description: dictionary.contact.metadata.description
  };
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  const dictionary = getDictionary(locale);
  const phoneDisplay =
    locale === "he" ? contact.phoneHebrewDisplay : contact.phoneDisplay;

  const fields = [
    { name: "name", label: dictionary.contact.form.name, type: "text", required: true },
    { name: "company", label: dictionary.contact.form.company, type: "text", required: false },
    { name: "phone", label: dictionary.contact.form.phone, type: "tel", required: false },
    { name: "email", label: dictionary.contact.form.email, type: "email", required: false }
  ];

  return (
    <div className="grid gap-8 md:grid-cols-[0.8fr_1fr]">
      <section>
        <h1 className="text-4xl font-bold text-slate-950">{dictionary.contact.title}</h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">{dictionary.contact.intro}</p>

        <div className="mt-6 space-y-3">
          <a className="contact-channel" href={contact.whatsAppHref}>
            <span>{dictionary.contact.channels.whatsApp}</span>
            <strong>{contact.whatsAppDisplay}</strong>
          </a>
          <a className="contact-channel" href={contact.phoneHref}>
            <span>{dictionary.contact.channels.phone}</span>
            <strong>{phoneDisplay}</strong>
          </a>
          <a className="contact-channel" href={contact.emailHref}>
            <span>{dictionary.contact.channels.email}</span>
            <strong>{contact.emailDisplay}</strong>
          </a>
        </div>
      </section>

      <form action="#" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" method="post">
        <div className="grid gap-4">
          {fields.map((field) => (
            <label className="grid gap-2 text-sm font-semibold text-slate-800" key={field.name}>
              {field.label}
              <input
                className="rounded-md border border-slate-300 bg-white px-3 py-3 text-base font-normal text-slate-950 outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-100"
                name={field.name}
                required={field.required}
                type={field.type}
              />
            </label>
          ))}
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            {dictionary.contact.form.message}
            <textarea
              className="min-h-32 rounded-md border border-slate-300 bg-white px-3 py-3 text-base font-normal text-slate-950 outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-100"
              name="message"
              required
            />
          </label>
          <button className="rounded-md bg-blue-900 px-5 py-3 text-base font-semibold text-white hover:bg-blue-800" type="submit">
            {dictionary.contact.form.submit}
          </button>
        </div>
      </form>
    </div>
  );
}
