import type { Locale } from "./config";

const dictionaries = {
  he: {
    siteName: "שם האתר",
    languageSwitch: "English",
    navigation: {
      home: "בית",
      about: "אודות",
      services: "שירותים",
      contact: "יצירת קשר"
    },
    home: {
      eyebrow: "עמוד בית",
      title: "כותרת זמנית לעמוד הבית",
      description: "טקסט זמני בלבד עבור מבנה האתר."
    },
    about: {
      eyebrow: "אודות",
      title: "כותרת זמנית לעמוד האודות",
      description: "טקסט זמני בלבד עבור מבנה האתר."
    },
    services: {
      eyebrow: "שירותים",
      title: "כותרת זמנית לעמוד השירותים",
      description: "טקסט זמני בלבד עבור מבנה האתר."
    },
    contact: {
      eyebrow: "יצירת קשר",
      title: "כותרת זמנית לעמוד יצירת הקשר",
      description: "טקסט זמני בלבד עבור מבנה האתר."
    }
  },
  en: {
    siteName: "Site Name",
    languageSwitch: "עברית",
    navigation: {
      home: "Home",
      about: "About",
      services: "Services",
      contact: "Contact"
    },
    home: {
      eyebrow: "Home",
      title: "Temporary home page title",
      description: "Placeholder text only for the website structure."
    },
    about: {
      eyebrow: "About",
      title: "Temporary about page title",
      description: "Placeholder text only for the website structure."
    },
    services: {
      eyebrow: "Services",
      title: "Temporary services page title",
      description: "Placeholder text only for the website structure."
    },
    contact: {
      eyebrow: "Contact",
      title: "Temporary contact page title",
      description: "Placeholder text only for the website structure."
    }
  }
} as const;

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
