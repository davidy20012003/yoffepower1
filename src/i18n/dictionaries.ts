import type { Locale } from "./config";

export const contact = {
  phoneDisplay: "+972 54 597 8440",
  phoneHebrewDisplay: "054-597-8440",
  phoneHref: "tel:+972545978440",
  whatsAppDisplay: "+972 54 597 8440",
  whatsAppHref: "https://wa.me/972545978440",
  emailDisplay: "david.yoffe1@gmail.com",
  emailHref: "mailto:david.yoffe1@gmail.com"
} as const;

const dictionaries = {
  he: {
    siteName: "David Yoffe Consulting & Testing",
    languageName: "עברית",
    alternateLanguageName: "English",
    metadata: {
      title: "David Yoffe Consulting & Testing | ייעוץ ובדיקות חשמל",
      description:
        "ייעוץ חשמל ובדיקות חשמל בלתי תלויות למערכות חשמל אמינות, יעילות ותואמות תקנים."
    },
    navigation: {
      home: "ראשי",
      services: "שירותים",
      about: "אודות",
      contact: "צור קשר",
      menu: "תפריט"
    },
    contactActions: {
      whatsApp: "WhatsApp",
      call: "התקשר",
      email: 'דוא"ל'
    },
    home: {
      title: "ייעוץ חשמל למערכות חשמל אמינות ויעילות",
      intro: "מייצג את האינטרסים של המזמין בלבד",
      imageAlt: "ציוד חשמל תעשייתי באתר",
      testing: {
        title: "בדיקות חשמל",
        items: [
          "בודק סוג 3 משנת 1995",
          "מתקני מתח גבוה",
          "מתקנים רפואיים",
          "שנאים",
          "גנרטורים ומערכות UPS",
          "מפעלים",
          "אתרי בנייה חדשים וקיימים",
          "בדיקות קבלה"
        ]
      },
      consulting: {
        title: "ייעוץ חשמל",
        items: [
          "בדיקה בלתי תלויה של תכנון חשמל",
          "עמידה בדרישות חוק החשמל והתקנים",
          "חלופות תכנון וחיסכון בעלויות",
          "בדיקת הגנות וסלקטיביות",
          "ליווי בדיקות קבלה",
          "ניתוח אמינות"
        ]
      },
      learnMore: "מידע נוסף",
      approachTitle: "הגישה שלי",
      approach:
        "מטרתי אינה רק להצביע על בעיות, אלא לסייע למזמין למצוא פתרונות מעשיים, חסכוניים ובהתאם לחוק ולתקנים.",
      experienceTitle: "ניסיון מקצועי",
      experience: [
        "M.Sc. בהנדסת חשמל",
        "בודק סוג 3 משנת 1995",
        "13 שנים – אינטל",
        "9 שנים – מנהל הנדסה\nRoyal Haskoning, Fäth Group",
        '9 שנים – ב"ח הדסה'
      ]
    },
    services: {
      metadata: {
        title: "שירותים | David Yoffe Consulting & Testing",
        description: "בדיקות חשמל וייעוץ חשמל למתקנים, תכנון, קבלה ואמינות."
      },
      title: "שירותים",
      intro: "שני תחומי פעילות מרכזיים: בדיקות חשמל מורשות וייעוץ חשמל בלתי תלוי.",
      sections: [
        {
          title: "בדיקות חשמל",
          items: [
            "בדיקות מורשות על ידי בודק סוג 3",
            "מתקני מתח גבוה",
            "מתקנים רפואיים",
            "שנאים",
            "גנרטורים ומערכות UPS",
            "מפעלים",
            "אתרי בנייה חדשים וקיימים",
            "בדיקות קבלה"
          ]
        },
        {
          title: "ייעוץ חשמל",
          items: [
            "בדיקה בלתי תלויה של תכנון חשמל",
            "בחינת יעילות התכנון וחלופות תכנון",
            "חיסכון בעלויות באמצעות Value Engineering",
            "בדיקת התאמה לחוק החשמל ולתקנים",
            "בדיקת אפשרות ביצוע והתאמה לתנאי האתר",
            "בדיקת הגנות וסלקטיביות, כולל מדידות לפי הצורך",
            "הכנת נהלי קבלה וליווי בדיקות",
            "ניתוח אמינות, כולל חישובים לפי IEEE Std 493"
          ]
        }
      ]
    },
    about: {
      metadata: {
        title: "אודות | David Yoffe Consulting & Testing",
        description: "ניסיון מקצועי, השכלה והסמכת בודק סוג 3 משנת 1995."
      },
      title: "אודות",
      name: "David Yoffe",
      education: "M.Sc. בהנדסת חשמל, Polytechnic University, St. Petersburg, 1987",
      items: [
        "בודק סוג 3 משנת 1995",
        "13 שנות הנדסת חשמל ב-Intel",
        "9 שנים כמנהל תכנון ב-Royal Haskoning וב-Fäth Group",
        "9 שנות הנדסת חשמל ב-Hadassah Medical Center"
      ],
      credentialsTitle: "הסמכה",
      credential: "בודק סוג 3 משנת 1995",
      licenseAlt: "תעודת בודק סוג 3",
      openLicense: "פתח תעודה"
    },
    contact: {
      metadata: {
        title: "צור קשר | David Yoffe Consulting & Testing",
        description: "יצירת קשר ב-WhatsApp, טלפון, דוא״ל או טופס קצר."
      },
      title: "צור קשר",
      intro: "אפשר להשאיר פרטים או לפנות ישירות באחד הערוצים.",
      channels: {
        whatsApp: "WhatsApp להודעות טקסט",
        phone: "טלפון",
        email: 'דוא"ל'
      },
      form: {
        name: "שם",
        company: "חברה",
        phone: "טלפון",
        email: 'דוא"ל',
        message: "הודעה",
        submit: "שליחה"
      }
    },
    footer: {
      copyright: "כל הזכויות שמורות"
    }
  },
  en: {
    siteName: "David Yoffe Consulting & Testing",
    languageName: "English",
    alternateLanguageName: "עברית",
    metadata: {
      title: "David Yoffe Consulting & Testing | Electrical Consulting & Testing",
      description:
        "Independent electrical consulting and testing for reliable, efficient and compliant power systems."
    },
    navigation: {
      home: "Home",
      services: "Services",
      about: "About",
      contact: "Contact",
      menu: "Menu"
    },
    contactActions: {
      whatsApp: "WhatsApp",
      call: "Call",
      email: "Email"
    },
    home: {
      title:
        "Independent electrical engineering consulting for reliable and efficient power systems.",
      intro: "Independent advice focused exclusively on the client’s interests.",
      imageAlt: "Industrial electrical equipment on site",
      testing: {
        title: "Electrical Testing",
        items: [
          "Bodek 3 electrical inspector since 1995",
          "Medium-voltage installations",
          "Medical facilities",
          "Transformers",
          "Generators and UPS systems",
          "Industrial facilities",
          "Greenfield and brownfield construction sites",
          "Acceptance testing"
        ]
      },
      consulting: {
        title: "Electrical Consulting",
        items: [
          "Independent electrical design review",
          "Electrical code and standards compliance",
          "Value engineering and design optimization",
          "Protection coordination and selectivity",
          "Acceptance procedures and test witnessing",
          "Reliability analysis"
        ]
      },
      learnMore: "Learn more",
      approachTitle: "My Approach",
      approach:
        "Many consultants identify problems. I help clients find practical, compliant and cost-effective engineering solutions.",
      experienceTitle: "Professional Experience",
      experience: [
        "M.Sc. Electrical Engineering",
        "Bodek 3 since 1995",
        "13 years – Intel",
        "9 years – Design Manager\nRoyal Haskoning, Fäth Group",
        "9 years – Hadassah Medical Center"
      ]
    },
    services: {
      metadata: {
        title: "Services | David Yoffe Consulting & Testing",
        description:
          "Electrical testing and independent electrical consulting for installations, design review, acceptance and reliability."
      },
      title: "Services",
      intro:
        "Two focused service areas: authorized electrical testing and independent electrical consulting.",
      sections: [
        {
          title: "Electrical Testing",
          items: [
            "Authorized testing by a Bodek 3 electrical inspector",
            "Medium-voltage installations",
            "Medical facilities",
            "Transformers",
            "Generators and UPS systems",
            "Industrial facilities",
            "Greenfield and brownfield construction sites",
            "Acceptance testing"
          ]
        },
        {
          title: "Electrical Consulting",
          items: [
            "Independent electrical design review",
            "Review of design efficiency and alternatives",
            "Cost reduction through value engineering",
            "Electrical code and standards compliance review",
            "Constructability and site-condition review",
            "Protection coordination and selectivity, including measurements when needed",
            "Acceptance procedure preparation and test witnessing",
            "Reliability analysis, including calculations according to IEEE Std 493"
          ]
        }
      ]
    },
    about: {
      metadata: {
        title: "About | David Yoffe Consulting & Testing",
        description:
          "Professional experience, education and Bodek 3 electrical inspector credentials since 1995."
      },
      title: "About",
      name: "David Yoffe",
      education: "M.Sc. Electrical Engineering, Polytechnic University, St. Petersburg, 1987",
      items: [
        "Bodek 3 electrical inspector since 1995",
        "13 years of electrical engineering at Intel",
        "9 years as Design Manager at Royal Haskoning and Fäth Group",
        "9 years of electrical engineering at Hadassah Medical Center"
      ],
      credentialsTitle: "Credentials",
      credential: "Bodek 3 electrical inspector since 1995",
      licenseAlt: "Bodek 3 electrical inspector license",
      openLicense: "Open license"
    },
    contact: {
      metadata: {
        title: "Contact | David Yoffe Consulting & Testing",
        description: "Contact by WhatsApp, phone, email or a short form."
      },
      title: "Contact",
      intro: "Send a short message or use one of the direct contact options.",
      channels: {
        whatsApp: "WhatsApp for text messages",
        phone: "Phone",
        email: "Email"
      },
      form: {
        name: "Name",
        company: "Company",
        phone: "Phone",
        email: "Email",
        message: "Message",
        submit: "Send"
      }
    },
    footer: {
      copyright: "All rights reserved"
    }
  }
} as const;

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
