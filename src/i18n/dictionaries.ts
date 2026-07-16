import type { Locale } from "./config";

export const contact = {
  phoneDisplay: "+972 54 597 8440",
  phoneHebrewDisplay: "054-597-8440",
  phoneHref: "tel:+972545978440",
  whatsAppDisplay: "WhatsApp",
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
      faq: "שאלות נפוצות",
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
    faq: {
      metadata: {
        title: "שאלות נפוצות | David Yoffe Consulting & Testing",
        description:
          "שאלות נפוצות על ייעוץ חשמל, בדיקות חשמל, סלקטיביות, אמינות ומערכות UPS."
      },
      title: "שאלות נפוצות",
      items: [
        {
          question: "מדוע תכנון מערכות חשמל לעיתים אינו יעיל?",
          answer: [
            "מתכנני מערכות מיזוג אוויר, מערכות תהליך וגם ספקי ציוד מוסרים בדרך כלל את גודל הציוד ולא את צריכת החשמל בפועל. כתוצאה מכך, תכנון החשמל מתבסס לעיתים על נתונים שמובילים להגדלת שנאים, גנרטורים, כבלים ולוחות מעבר לנדרש. יועץ חשמל בלתי תלוי יכול לבצע Value Engineering ולבדוק האם ניתן להקטין את עלויות ההקמה מבלי לפגוע באמינות או בעמידה בדרישות החוק.",
            "חושב שניתן לחסוך בעלויות הפרויקט או לשפר את התכנון? ניתן לבצע בדיקה בלתי תלויה לפני הביצוע."
          ]
        },
        {
          question: "מה צריך להיות מוכן לבדיקת חשמל?",
          answer: [
            "לפני הזמנת בודק מומלץ להשלים את כל עבודות החשמל, השילוט, הסימון והתיעוד. מתקן שאינו מוכן במלואו עלול לדרוש בדיקה חוזרת, לגרום לעיכובים ולהגדיל את העלויות."
          ]
        },
        {
          question: "מדוע לעיתים אין סלקטיביות במתקנים גדולים?",
          answer: [
            "תיאום סלקטיבי של ההגנות אינו כלול בדרך כלל בתכנון החשמל הסטנדרטי, אלא אם הוגדר במפורש בדרישות הפרויקט. ברוב הפרויקטים מתבצע רק התיאום הנדרש מול חברת החשמל. תיאום סלקטיבי מלא דורש חישובים ייעודיים ולכן מבוצע רק כאשר המזמין מבקש זאת."
          ]
        },
        {
          question: "למה אין תיאום הגנות בפועל?",
          answer: [
            "בפרויקטים גדולים כל קבלן משנה מזמין בודק רק עבור המערכות שבתחום אחריותו. כתוצאה מכך, כל חלק נבדק בנפרד, אך בדרך כלל אין גורם שבודק את תיאום ההגנות של המערכת כולה לאחר השלמת הפרויקט."
          ]
        },
        {
          question: "מהו סקר אמינות ולמה הוא נחוץ?",
          answer: [
            "סקר אמינות הוא תהליך חישובי המשווה בין חלופות תכנון שונות. הסקר מספק נתונים כמותיים המאפשרים לבחור את האופציה האמינה ביותר, עם נימוקים ברורים להחלטה.",
            "ניתן לבצע הערכת אמינות ולהשוות בין חלופות תכנון עוד לפני תחילת הביצוע."
          ]
        },
        {
          question: "על מה חשוב להקפיד בבחירת מערכת UPS?",
          answer: [
            "בעת בחירת מערכת UPS אין להסתמך רק על נתוני היצרן או על זמן הגיבוי של המצברים. חשוב לבדוק גם תוך כמה זמן ניתן להחזיר את המערכת לפעולה במקרה של תקלה. לעיתים זמינות של צוות שירות מהיר משפיעה על אמינות המערכת יותר מהוספת מצברים או ציוד יקר נוסף.",
            "בחירה נכונה של ארכיטקטורת ה-UPS ושל רמת השירות יכולה לחסוך עלויות ולהגדיל משמעותית את זמינות המערכת."
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
      faq: "FAQ",
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
    faq: {
      metadata: {
        title: "FAQ | David Yoffe Consulting & Testing",
        description:
          "Frequently asked questions about electrical consulting, inspections, selectivity, reliability studies, and UPS selection."
      },
      title: "Frequently Asked Questions",
      items: [
        {
          question: "Why are electrical systems sometimes designed inefficiently?",
          answer: [
            "HVAC designers, process-system designers, and equipment suppliers often provide installed equipment ratings rather than realistic electrical consumption. As a result, transformers, generators, cables, and switchboards may be sized larger than necessary. An independent electrical consultant can carry out value engineering and determine whether construction costs can be reduced without compromising reliability or compliance.",
            "An independent design review before construction may identify practical opportunities for cost savings and design improvement."
          ]
        },
        {
          question: "What should be completed before an electrical inspection?",
          answer: [
            "Before arranging an electrical inspection, all electrical work, labels, identification, and required documentation should be completed. An installation that is not fully ready may require repeat inspection, cause delays, and increase costs."
          ]
        },
        {
          question: "Why is selectivity sometimes missing in large installations?",
          answer: [
            "Full protection selectivity is not normally included in the basic electrical design unless it is specifically required by the project. In many projects, only the coordination required by the utility is performed. Complete selectivity requires dedicated calculations and is usually carried out only when specifically requested by the client."
          ]
        },
        {
          question: "Why is overall protection coordination often missing in practice?",
          answer: [
            "On large projects, each subcontractor usually appoints an inspector only for the systems within that subcontractor's scope. Each part may therefore be tested separately, while no single party verifies the coordination of the complete protection system after the entire project is completed."
          ]
        },
        {
          question: "What is a reliability study and why is it needed?",
          answer: [
            "A reliability study is a calculation-based comparison of alternative system configurations. It provides quantitative information that helps the client select the most reliable option and clearly justify the decision.",
            "Reliability can be evaluated and alternative designs compared before construction begins."
          ]
        },
        {
          question: "What should be considered when selecting a UPS system?",
          answer: [
            "UPS selection should not be based only on manufacturer data or battery autonomy. It is also important to consider how quickly the system can be restored after a failure. In some cases, rapid service response has a greater effect on availability than adding more batteries or purchasing more expensive equipment.",
            "The correct UPS architecture and service arrangement can reduce costs and significantly improve system availability."
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
