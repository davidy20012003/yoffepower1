import type {
  ConductorMaterial,
  GroupingMode,
  InstallationMethod,
  Insulation,
  Phase,
  ProtectionType,
  SpacingCategory,
  Table4Arrangement
} from "./types";

export const sections = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500, 630] as const;

export const standardBreakers = [
  6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500,
  3200, 4000
] as const;

const table = (suffix: string) => ({ "70": `70.${suffix}`, "90": `90.${suffix}` });

export const installationMethods: InstallationMethod[] = [
  {
    id: "aleph-wall-insulated-conductors",
    marking: "א",
    title: "מוליכים מבודדים או כבלים חד-גידיים בצינור שבקיר, עם בידוד תרמי",
    description: "מוליכים מבודדים או כבלים חד-גידיים בצינור שבקיר, עם בידוד תרמי.",
    environment: "air",
    cableKinds: ["singleCore"],
    imagePath: "/images/א.jpg",
    izTables: table("1"),
    groupingMode: "table4"
  },
  {
    id: "bet-wall-insulated-multicore",
    marking: "ב",
    title: "כבלים רב-גידיים בצינור שבקיר, עם בידוד תרמי",
    description: "כבלים רב-גידיים בצינור שבקיר, עם בידוד תרמי.",
    environment: "air",
    cableKinds: ["multicore"],
    imagePath: "/images/ב.jpg",
    izTables: table("2"),
    groupingMode: "table4"
  },
  {
    id: "gimel-wall-conduit-single",
    marking: "ג",
    title: "מוליכים מבודדים או כבלים חד-גידיים במובל שעל גבי קיר",
    description: "מוליכים מבודדים או כבלים חד-גידיים במובל שעל גבי קיר, כשהמרחק מהקיר אינו עולה על 0.3 קוטר הכבל.",
    environment: "air",
    cableKinds: ["singleCore"],
    imagePath: "/images/ג.jpg",
    izTables: table("3"),
    groupingMode: "table4"
  },
  {
    id: "dalet-wall-conduit-multicore",
    marking: "ד",
    title: "כבלים רב-גידיים במובל שעל גבי קיר",
    description: "כבלים רב-גידיים במובל שעל גבי קיר או במרחק מהקיר שאינו עולה על 0.3 קוטר הכבל.",
    environment: "air",
    cableKinds: ["multicore"],
    imagePath: "/images/ד.jpg",
    izTables: table("4"),
    groupingMode: "table4"
  },
  {
    id: "heh-wall-channel-single",
    marking: "ה",
    title: "מוליכים מבודדים או כבלים חד-גידיים בתוך תעלה על גבי קיר",
    description: "מוליכים מבודדים או כבלים חד-גידיים בתוך תעלה על גבי קיר.",
    environment: "air",
    cableKinds: ["singleCore"],
    imagePath: "/images/ה.jpg",
    izTables: table("3"),
    groupingMode: "table4"
  },
  {
    id: "vav-wall-channel-multicore",
    marking: "ו",
    title: "כבלים רב-גידיים בתוך תעלה על גבי קיר",
    description: "כבלים רב-גידיים בתוך תעלה על גבי קיר.",
    environment: "air",
    cableKinds: ["multicore"],
    imagePath: "/images/ו.jpg",
    izTables: table("4"),
    groupingMode: "table4"
  },
  {
    id: "zayin-suspended-channel-single",
    marking: "ז",
    title: "מוליכים מבודדים או כבלים חד-גידיים בתוך תעלה תלויה",
    description: "מוליכים מבודדים או כבלים חד-גידיים בתוך תעלה תלויה.",
    environment: "air",
    cableKinds: ["singleCore"],
    imagePath: "/images/ז.jpg",
    izTables: table("4"),
    groupingMode: "table4"
  },
  {
    id: "het-suspended-channel-multicore",
    marking: "ח",
    title: "כבלים רב-גידיים בתוך תעלה תלויה",
    description: "כבלים רב-גידיים בתוך תעלה תלויה.",
    environment: "air",
    cableKinds: ["multicore"],
    imagePath: "/images/ח.jpg",
    izTables: table("4"),
    groupingMode: "table4"
  },
  {
    id: "tet-shared-channel-single",
    marking: "ט",
    title: "מוליכים מבודדים או כבלים חד-גידיים בתוך תעלה חשיפה המשמשת גם שירותים אחרים",
    description: "מוליכים מבודדים או כבלים חד-גידיים בתוך תעלה חשיפה המשמשת גם שירותים אחרים.",
    environment: "air",
    cableKinds: ["singleCore"],
    imagePath: "/images/ט.jpg",
    izTables: table("3"),
    groupingMode: "table4"
  },
  {
    id: "yod-shared-channel-multicore",
    marking: "י",
    title: "כבלים רב-גידיים בתעלה חשיפה המשמשת גם שירותים אחרים",
    description: "כבלים רב-גידיים בתעלה חשיפה המשמשת גם שירותים אחרים.",
    environment: "air",
    cableKinds: ["multicore"],
    imagePath: "/images/י.jpg",
    izTables: table("4"),
    groupingMode: "table4"
  },
  {
    id: "yod-aleph-frame",
    marking: "י״א",
    title: "כבלים חד-גידיים או רב-גידיים בתוך משקוף של דלת או חלון",
    description: "כבלים חד-גידיים או רב-גידיים בתוך משקוף של דלת או חלון.",
    environment: "air",
    cableKinds: ["multicore", "singleCore"],
    imagePath: "/images/י''א.jpg",
    izTables: table("1"),
    groupingMode: "table4"
  },
  {
    id: "yod-bet-wall-surface",
    marking: "י״ב",
    title: "כבלים חד-גידיים או רב-גידיים בצמוד לקיר או לתקרה",
    description: "כבלים חד-גידיים או רב-גידיים בצמוד לקיר או לתקרה.",
    environment: "air",
    cableKinds: ["multicore", "singleCore"],
    imagePath: "/images/י''ב.jpg",
    izTables: table("5"),
    groupingMode: "table4"
  },
  {
    id: "yod-gimel-unperforated-tray",
    marking: "י״ג",
    title: "כבלים חד-גידיים או רב-גידיים על גבי מגש לא מחורר",
    description: "כבלים חד-גידיים או רב-גידיים על גבי מגש לא מחורר.",
    environment: "air",
    cableKinds: ["multicore", "singleCore"],
    imagePath: "/images/י''ג.jpg",
    izTables: table("5"),
    groupingMode: "table4"
  },
  {
    id: "yod-dalet-perforated-tray-multicore",
    marking: "י״ד",
    title: "כבלים רב-גידיים על גבי מגש מחורר או מגש רשת",
    description: "כבלים רב-גידיים על גבי מגש מחורר או מגש רשת.",
    environment: "air",
    cableKinds: ["multicore"],
    imagePath: "/images/י''ד.jpg",
    izTables: table("7"),
    groupingMode: "table4"
  },
  {
    id: "tet-vav-perforated-tray-single",
    marking: "ט״ו",
    title: "כבלים חד-גידיים על גבי מגש מחורר או מגש רשת",
    description: "כבלים חד-גידיים על גבי מגש מחורר או מגש רשת.",
    environment: "air",
    cableKinds: ["singleCore"],
    imagePath: "/images/ט''ו.jpg",
    izTables: table("8"),
    groupingMode: "table4"
  },
  {
    id: "tet-zayin-ladder-multicore",
    marking: "ט״ז",
    title: "כבלים רב-גידיים על גבי סולם כבלים",
    description: "כבלים רב-גידיים על גבי סולם כבלים.",
    environment: "air",
    cableKinds: ["multicore"],
    imagePath: "/images/ט''ז.jpg",
    izTables: table("7"),
    groupingMode: "table4"
  },
  {
    id: "yod-zayin-ladder-single",
    marking: "י״ז",
    title: "כבלים חד-גידיים על גבי סולם כבלים",
    description: "כבלים חד-גידיים על גבי סולם כבלים.",
    environment: "air",
    cableKinds: ["singleCore"],
    imagePath: "/images/י''ז.jpg",
    izTables: table("8"),
    groupingMode: "table4"
  },
  {
    id: "yod-het-building-void",
    marking: "י״ח",
    title: "כבלים בחלל בנוי בתוך מבנה",
    description: "כבלים חד-גידיים או רב-גידיים בחלל בנוי בתוך מבנה.",
    environment: "air",
    cableKinds: ["multicore", "singleCore"],
    imagePath: "/images/י''ח.jpg",
    izTables: table("4"),
    groupingMode: "table4",
    requiresVCategory: true,
    vCategories: {
      small: { label: "1.5De ≤ V < 5De", izTables: table("4") },
      large: { label: "5De ≤ V ≤ 50De", izTables: table("3") }
    }
  },
  {
    id: "yod-tet-floor-ceiling-void",
    marking: "י״ט",
    title: "כבלים בתקרה או ברצפה כפולה",
    description: "כבלים בתקרה או ברצפה כפולה.",
    environment: "air",
    cableKinds: ["multicore", "singleCore"],
    imagePath: "/images/י''ט.jpg",
    izTables: table("4"),
    groupingMode: "table4",
    requiresVCategory: true,
    vCategories: {
      small: { label: "1.5De ≤ V < 5De", izTables: table("4") },
      large: { label: "5De ≤ V ≤ 50De", izTables: table("3") }
    }
  },
  {
    id: "kaf-floor-channel-single",
    marking: "כ׳",
    title: "כבל חד-גידי בתעלה משוקעת ברצפה ללא פתחי אוורור",
    description: "כבל חד-גידי בתעלה משוקעת ברצפה; המכסה הוא ללא פתחי אוורור.",
    environment: "air",
    cableKinds: ["singleCore"],
    imagePath: "/images/כ'.jpg",
    izTables: table("3"),
    groupingMode: "table4"
  },
  {
    id: "kaf-aleph-floor-channel-multicore",
    marking: "כ״א",
    title: "כבלים רב-גידיים בתעלה משוקעת ברצפה ללא פתחי אוורור",
    description: "כבלים רב-גידיים בתעלה משוקעת ברצפה; המכסה הוא ללא פתחי אוורור.",
    environment: "air",
    cableKinds: ["multicore"],
    imagePath: "/images/כ''א.jpg",
    izTables: table("4"),
    groupingMode: "table4"
  },
  {
    id: "kaf-bet-wall-recessed-single",
    marking: "כ״ב",
    title: "כבלים חד-גידיים בתעלה משוקעת בתוך קיר ללא פתחי אוורור",
    description: "כבלים חד-גידיים בתעלה משוקעת בתוך קיר; המכסה הוא ללא פתחי אוורור.",
    environment: "air",
    cableKinds: ["singleCore"],
    imagePath: "/images/כ''ב.jpg",
    izTables: table("3"),
    groupingMode: "table4"
  },
  {
    id: "kaf-gimel-wall-recessed-multicore",
    marking: "כ״ג",
    title: "כבלים רב-גידיים בתעלה משוקעת בתוך קיר ללא פתחי אוורור",
    description: "כבלים רב-גידיים בתעלה משוקעת בתוך קיר; המכסה הוא ללא פתחי אוורור.",
    environment: "air",
    cableKinds: ["multicore"],
    imagePath: "/images/כ''ג.jpg",
    izTables: table("4"),
    groupingMode: "table4"
  },
  {
    id: "kaf-dalet-horizontal-conduit",
    marking: "כ״ד",
    title: "מוליכים מבודדים בתוך צינור בהתקנה אופקית בלבד",
    description: "מוליכים מבודדים בתוך צינור בהתקנה אופקית בלבד.",
    environment: "air",
    cableKinds: ["singleCore"],
    imagePath: "/images/כ''ד.jpg",
    izTables: table("4"),
    groupingMode: "table4",
    requiresVCategory: true,
    vCategories: {
      small: { label: "1.5De ≤ V < 20De", izTables: table("4") },
      large: { label: "V ≥ 20De", izTables: table("3") }
    }
  },
  {
    id: "kaf-heh-conduit-channel-single",
    marking: "כ״ה",
    title: "מוליכים מבודדים בצינור בתעלת כבלים בנויה, פתוחה או מכוסה עם פתחים",
    description: "מוליכים מבודדים בצינור בתעלת כבלים בנויה, פתוחה או מכוסה עם פתחים.",
    environment: "air",
    cableKinds: ["singleCore"],
    imagePath: "/images/כ''ה.jpg",
    izTables: table("3"),
    groupingMode: "table4"
  },
  {
    id: "kaf-vav-conduit-channel-multicore",
    marking: "כ״ו",
    title: "כבלים רב-גידיים בצינור בתעלת כבלים בנויה, פתוחה או מכוסה עם פתחים",
    description: "כבלים רב-גידיים בצינור בתעלת כבלים בנויה, פתוחה או מכוסה עם פתחים.",
    environment: "air",
    cableKinds: ["multicore"],
    imagePath: "/images/כ''ו.jpg",
    izTables: table("4"),
    groupingMode: "table4"
  },
  {
    id: "kaf-zayin-open-channel",
    marking: "כ״ז",
    title: "כבלים בתעלת כבלים במישור אופקי או אנכי, פתוחה או מכוסה עם פתחים",
    description: "כבלים בתעלת כבלים במישור אופקי או אנכי, פתוחה או מכוסה עם פתחים.",
    environment: "air",
    cableKinds: ["multicore", "singleCore"],
    imagePath: "/images/כ''ז.jpg",
    izTables: table("3"),
    groupingMode: "table4"
  },
  {
    id: "kaf-het-wall-conduit-single",
    marking: "כ״ח",
    title: "מוליכים מבודדים או כבלים חד-גידיים בצינור בתוך קיר",
    description: "מוליכים מבודדים או כבלים חד-גידיים בצינור בתוך קיר.",
    environment: "air",
    cableKinds: ["singleCore"],
    imagePath: "/images/כ''ח.jpg",
    izTables: table("3"),
    groupingMode: "table4"
  },
  {
    id: "kaf-tet-wall-conduit-multicore",
    marking: "כ״ט",
    title: "כבלים רב-גידיים בצינור בתוך קיר",
    description: "כבלים רב-גידיים בצינור בתוך קיר.",
    environment: "air",
    cableKinds: ["multicore"],
    imagePath: "/images/כ''ט.jpg",
    izTables: table("4"),
    groupingMode: "table4"
  },
  {
    id: "lamed-ground-conduit",
    marking: "ל׳",
    title: "כבלים חד-גידיים או רב-גידיים בצינור או בתעלה בנויה בתוך האדמה",
    description: "כבלים חד-גידיים או רב-גידיים בצינור או בתעלה בנויה בתוך האדמה.",
    environment: "ground",
    cableKinds: ["multicore", "singleCore"],
    imagePath: "/images/ל'.jpg",
    izTables: table("6"),
    groupingMode: "table6"
  },
  {
    id: "lamed-aleph-direct-ground",
    marking: "ל״א",
    title: "כבלים חד-גידיים או רב-גידיים טמונים באדמה במישרין",
    description: "כבלים חד-גידיים או רב-גידיים טמונים באדמה במישרין.",
    environment: "ground",
    cableKinds: ["multicore", "singleCore"],
    imagePath: "/images/ל''א.jpg",
    izTables: table("6"),
    groupingMode: "table5"
  }
];

export const table4Arrangements: Record<Table4Arrangement, { label: string; row: string; factors: Record<number, number> }> = {
  bundled: {
    label: "מקובצים בצרור על גבי משטח, בהתקנה סמויה או חשיפה",
    row: "1",
    factors: { 1: 1, 2: 0.8, 3: 0.7, 4: 0.65, 5: 0.6, 6: 0.57, 7: 0.54, 8: 0.52, 9: 0.5, 12: 0.45, 16: 0.41, 20: 0.38 }
  },
  wallFloorTray: {
    label: "שכבה אחת על קיר, רצפה או מגש לא מחורר",
    row: "2",
    factors: { 1: 1, 2: 0.85, 3: 0.79, 4: 0.75, 5: 0.73, 6: 0.72, 7: 0.72, 8: 0.71, 9: 0.7 }
  },
  ceiling: {
    label: "שכבה אחת מתחת לתקרה",
    row: "3",
    factors: { 1: 0.95, 2: 0.81, 3: 0.72, 4: 0.68, 5: 0.66, 6: 0.64, 7: 0.63, 8: 0.62, 9: 0.61 }
  },
  perforatedTray: {
    label: "שכבה אחת על מגש מחורר אופקי או אנכי",
    row: "4",
    factors: { 1: 1, 2: 0.88, 3: 0.82, 4: 0.77, 5: 0.75, 6: 0.73, 7: 0.73, 8: 0.72, 9: 0.72 }
  },
  ladderSupports: {
    label: "שכבה אחת על סולם או באמצעות חבקים לרצפה",
    row: "5",
    factors: { 1: 1, 2: 0.87, 3: 0.82, 4: 0.8, 5: 0.8, 6: 0.79, 7: 0.79, 8: 0.78, 9: 0.78 }
  }
};

export const spacingOptionsByGroupingTable: Record<Exclude<GroupingMode, "table4">, { value: SpacingCategory; label: string }[]> = {
  table5: [
    { value: "touching", label: "a = 0 (צמודים)" },
    { value: "de", label: "a = De" },
    { value: "12.5cm", label: "a = 12.5 ס״מ" },
    { value: "25cm", label: "a = 25 ס״מ" },
    { value: "50cm", label: "a = 50 ס״מ" }
  ],
  table6: [
    { value: "touching", label: "a = 0 (צמודים)" },
    { value: "25cm", label: "a = 25 ס״מ" },
    { value: "50cm", label: "a = 50 ס״מ" },
    { value: "100cm", label: "a = 100 ס״מ" }
  ],
  table7: [
    { value: "touching", label: "a = 0 (צמודים)" },
    { value: "25cm", label: "a = 25 ס״מ" },
    { value: "50cm", label: "a = 50 ס״מ" },
    { value: "100cm", label: "a = 100 ס״מ" }
  ]
};

export const groupingFactors = {
  table5: {
    touching: { 1: 1, 2: 0.75, 3: 0.65, 4: 0.6, 5: 0.55, 6: 0.5 },
    de: { 1: 1, 2: 0.8, 3: 0.7, 4: 0.6, 5: 0.55, 6: 0.55 },
    "12.5cm": { 1: 1, 2: 0.85, 3: 0.75, 4: 0.7, 5: 0.65, 6: 0.6 },
    "25cm": { 1: 1, 2: 0.9, 3: 0.8, 4: 0.75, 5: 0.7, 6: 0.7 },
    "50cm": { 1: 1, 2: 0.9, 3: 0.85, 4: 0.8, 5: 0.8, 6: 0.8 }
  },
  table6: {
    touching: { 1: 1, 2: 0.8, 3: 0.7, 4: 0.65, 5: 0.6, 6: 0.6 },
    "25cm": { 1: 1, 2: 0.9, 3: 0.8, 4: 0.75, 5: 0.7, 6: 0.7 },
    "50cm": { 1: 1, 2: 0.9, 3: 0.85, 4: 0.8, 5: 0.8, 6: 0.8 },
    "100cm": { 1: 1, 2: 0.95, 3: 0.9, 4: 0.9, 5: 0.9, 6: 0.9 }
  },
  table7: {
    touching: { 1: 1, 2: 0.85, 3: 0.75, 4: 0.7, 5: 0.65, 6: 0.6 },
    "25cm": { 1: 1, 2: 0.9, 3: 0.85, 4: 0.8, 5: 0.8, 6: 0.8 },
    "50cm": { 1: 1, 2: 0.95, 3: 0.9, 4: 0.85, 5: 0.85, 6: 0.8 },
    "100cm": { 1: 1, 2: 0.95, 3: 0.95, 4: 0.9, 5: 0.9, 6: 0.9 }
  }
} as const;

export type AmpacityColumn = "copperSingle" | "copperThree" | "aluminiumSingle" | "aluminiumThree";
export type IzTableNumber =
  | "70.1"
  | "70.2"
  | "70.3"
  | "70.4"
  | "70.5"
  | "70.6"
  | "70.7"
  | "70.8"
  | "90.1"
  | "90.2"
  | "90.3"
  | "90.4"
  | "90.5"
  | "90.6"
  | "90.7"
  | "90.8";

type AmpacityRow = {
  section: number;
  copperSingle: number;
  copperThree: number;
  aluminiumSingle?: number;
  aluminiumThree?: number;
};

const rows = (values: Array<[number, number, number, number?, number?]>): AmpacityRow[] =>
  values.map(([section, copperSingle, copperThree, aluminiumSingle, aluminiumThree]) => ({
    section,
    copperSingle,
    copperThree,
    aluminiumSingle,
    aluminiumThree
  }));

export const ampacityTables: Record<IzTableNumber, AmpacityRow[]> = {
  "70.1": rows([
    [1.5, 14, 13],
    [2.5, 18, 17],
    [4, 24, 23],
    [6, 32, 29, 24, 23],
    [10, 43, 39, 34, 30],
    [16, 57, 53, 45, 40],
    [25, 75, 69, 59, 54],
    [35, 93, 84, 72, 66],
    [50, 112, 102, 87, 79],
    [70, 142, 128, 111, 101],
    [95, 171, 154, 133, 121],
    [120, 197, 177, 154, 140],
    [150, 226, 203, 178, 160],
    [185, 257, 230, 202, 182],
    [240, 302, 269, 237, 213],
    [300, 345, 308, 272, 245]
  ]),
  "70.2": rows([
    [1.5, 13, 12],
    [2.5, 17, 16],
    [4, 24, 22],
    [6, 30, 27, 24, 22],
    [10, 40, 37, 31, 29],
    [16, 54, 49, 41, 39],
    [25, 71, 64, 55, 50],
    [35, 86, 78, 67, 61],
    [50, 103, 93, 81, 73],
    [70, 131, 118, 102, 92],
    [95, 157, 141, 122, 111],
    [120, 180, 162, 141, 127],
    [150, 206, 184, 162, 146],
    [185, 233, 210, 183, 165],
    [240, 274, 245, 215, 195],
    [300, 314, 280, 247, 223]
  ]),
  "70.3": rows([
    [1.5, 16, 15],
    [2.5, 23, 20],
    [4, 30, 26],
    [6, 39, 34, 30, 26],
    [10, 54, 47, 41, 37],
    [16, 71, 64, 56, 50],
    [25, 95, 84, 74, 66],
    [35, 118, 103, 91, 81],
    [50, 142, 126, 111, 98],
    [70, 180, 161, 141, 125],
    [95, 218, 195, 170, 151],
    [120, 252, 225, 197, 175]
  ]),
  "70.4": rows([
    [1.5, 16, 14],
    [2.5, 22, 19],
    [4, 28, 25],
    [6, 36, 32, 28, 25],
    [10, 49, 43, 39, 34],
    [16, 65, 58, 51, 45],
    [25, 85, 75, 67, 58],
    [35, 104, 93, 81, 72],
    [50, 125, 111, 98, 86],
    [70, 158, 140, 123, 109],
    [95, 189, 168, 148, 131],
    [120, 218, 194, 170, 150]
  ]),
  "70.5": rows([
    [1.5, 18, 16],
    [2.5, 25, 23],
    [4, 34, 30],
    [6, 43, 39, 34, 30],
    [10, 59, 54, 46, 41],
    [16, 80, 71, 62, 55],
    [25, 105, 90, 78, 69],
    [35, 130, 112, 97, 85],
    [50, 158, 135, 118, 103],
    [70, 200, 173, 150, 132],
    [95, 243, 210, 183, 160],
    [120, 281, 243, 212, 185],
    [150, 323, 281, 245, 213],
    [185, 368, 321, 280, 243],
    [240, 433, 379, 331, 287],
    [300, 498, 436, 382, 330]
  ]),
  "70.6": rows([
    [1.5, 20, 16],
    [2.5, 26, 21],
    [4, 34, 28],
    [6, 42, 35, 32, 27],
    [10, 56, 46, 43, 36],
    [16, 72, 60, 55, 46],
    [25, 93, 77, 71, 59],
    [35, 111, 92, 85, 71],
    [50, 132, 109, 101, 84],
    [70, 163, 134, 125, 104],
    [95, 192, 159, 148, 123],
    [120, 219, 181, 168, 140],
    [150, 247, 205, 190, 158],
    [185, 278, 230, 214, 178],
    [240, 321, 264, 247, 205],
    [300, 363, 299, 279, 231]
  ]),
  "70.7": rows([
    [1.5, 21, 17],
    [2.5, 28, 24],
    [4, 38, 32],
    [6, 48, 40, 37, 31],
    [10, 66, 56, 51, 43],
    [16, 88, 75, 69, 57],
    [25, 112, 95, 84, 73],
    [35, 139, 118, 104, 90],
    [50, 169, 144, 127, 110],
    [70, 218, 184, 163, 141],
    [95, 265, 224, 197, 172],
    [120, 308, 259, 229, 199],
    [150, 356, 300, 265, 230],
    [185, 408, 342, 303, 263],
    [240, 483, 404, 357, 310],
    [300, 557, 467, 413, 358]
  ]),
  "70.8": rows([
    [25, 123, 103, 92, 79],
    [35, 152, 129, 115, 99],
    [50, 184, 157, 140, 120],
    [70, 236, 203, 180, 156],
    [95, 286, 248, 221, 191],
    [120, 331, 290, 257, 223],
    [150, 382, 335, 297, 258],
    [185, 435, 384, 341, 296],
    [240, 513, 456, 404, 353],
    [300, 591, 527, 467, 408],
    [400, 709, 617, 564, 494],
    [500, 816, 704, 652, 573],
    [630, 945, 804, 760, 668]
  ]),
  "90.1": rows([
    [1.5, 18, 16],
    [2.5, 25, 22],
    [4, 34, 30],
    [6, 43, 38, 34, 31],
    [10, 59, 52, 46, 42],
    [16, 78, 70, 61, 56],
    [25, 102, 91, 81, 73],
    [35, 126, 112, 99, 90],
    [50, 152, 135, 120, 108],
    [70, 192, 172, 152, 136],
    [95, 231, 207, 183, 164],
    [120, 267, 239, 211, 189],
    [150, 305, 274, 243, 217],
    [185, 348, 311, 276, 246],
    [240, 407, 365, 324, 288],
    [300, 467, 418, 372, 330]
  ]),
  "90.2": rows([
    [1.5, 18, 16],
    [2.5, 24, 21],
    [4, 32, 29],
    [6, 40, 36, 32, 30],
    [10, 55, 49, 43, 39],
    [16, 73, 65, 58, 53],
    [25, 95, 85, 75, 68],
    [35, 116, 105, 92, 84],
    [50, 139, 125, 110, 100],
    [70, 176, 157, 139, 126],
    [95, 211, 189, 168, 151],
    [120, 243, 218, 193, 173],
    [150, 278, 249, 221, 198],
    [185, 316, 283, 252, 224],
    [240, 371, 332, 295, 262],
    [300, 424, 380, 338, 300]
  ]),
  "90.3": rows([
    [1.5, 22, 19],
    [2.5, 30, 27],
    [4, 40, 36],
    [6, 52, 46, 41, 36],
    [10, 72, 63, 57, 50],
    [16, 96, 84, 76, 68],
    [25, 128, 112, 101, 89],
    [35, 157, 138, 125, 111],
    [50, 190, 168, 151, 134],
    [70, 243, 213, 192, 172],
    [95, 294, 258, 232, 208],
    [120, 340, 300, 270, 241]
  ]),
  "90.4": rows([
    [1.5, 21, 19],
    [2.5, 29, 25],
    [4, 38, 34],
    [6, 49, 42, 38, 34],
    [10, 66, 58, 52, 46],
    [16, 87, 77, 69, 61],
    [25, 114, 101, 90, 81],
    [35, 140, 123, 110, 99],
    [50, 168, 148, 132, 119],
    [70, 212, 186, 168, 150],
    [95, 254, 224, 202, 180],
    [120, 293, 257, 232, 207]
  ]),
  "90.5": rows([
    [1.5, 23, 21],
    [2.5, 32, 29],
    [4, 43, 38],
    [6, 56, 50, 23, 21],
    [10, 77, 68, 32, 29],
    [16, 103, 92, 43, 38],
    [25, 132, 114, 56, 50],
    [35, 164, 141, 77, 68],
    [50, 201, 172, 103, 92],
    [70, 258, 220, 132, 114],
    [95, 315, 267, 164, 141],
    [120, 367, 309, 201, 172],
    [150, 423, 356, 258, 220],
    [185, 486, 407, 315, 267],
    [240, 575, 480, 367, 309],
    [300, 665, 553, 423, 356]
  ]),
  "90.6": rows([
    [1.5, 24, 20],
    [2.5, 32, 27],
    [4, 41, 34],
    [6, 52, 43, 39, 33],
    [10, 68, 57, 52, 44],
    [16, 88, 73, 68, 57],
    [25, 113, 94, 86, 73],
    [35, 136, 113, 104, 87],
    [50, 161, 134, 123, 104],
    [70, 198, 166, 152, 128],
    [95, 234, 196, 179, 153],
    [120, 267, 223, 205, 173],
    [150, 301, 252, 232, 195],
    [185, 338, 283, 259, 219],
    [240, 390, 326, 299, 253],
    [300, 441, 368, 339, 286]
  ]),
  "90.7": rows([
    [1.5, 25, 22],
    [2.5, 35, 31],
    [4, 47, 40],
    [6, 60, 52, 47, 40],
    [10, 83, 72, 64, 56],
    [16, 110, 96, 87, 74],
    [25, 143, 122, 104, 93],
    [35, 178, 152, 130, 115],
    [50, 216, 184, 157, 140],
    [70, 277, 236, 203, 180],
    [95, 338, 286, 247, 218],
    [120, 394, 332, 288, 252],
    [150, 454, 383, 332, 292],
    [185, 520, 438, 381, 333],
    [240, 615, 516, 451, 393],
    [300, 711, 596, 521, 452]
  ]),
  "90.8": rows([
    [25, 155, 130, 116, 99],
    [35, 192, 162, 144, 124],
    [50, 232, 199, 177, 153],
    [70, 298, 257, 228, 198],
    [95, 362, 315, 277, 243],
    [120, 420, 368, 324, 284],
    [150, 484, 426, 373, 329],
    [185, 552, 490, 429, 379],
    [240, 652, 583, 509, 452],
    [300, 752, 675, 588, 525],
    [400, 902, 790, 710, 636],
    [500, 1040, 908, 822, 739],
    [630, 1204, 1044, 956, 863]
  ])
};

export function ampacityColumn(material: ConductorMaterial, phase: Phase): AmpacityColumn {
  if (material === "copper") {
    return phase === "single" ? "copperSingle" : "copperThree";
  }

  return phase === "single" ? "aluminiumSingle" : "aluminiumThree";
}

export const airTemperatureFactors: Record<Insulation, Record<number, number>> = {
  "70": { 10: 1.3, 15: 1.24, 20: 1.19, 25: 1.13, 30: 1.06, 35: 1, 40: 0.93, 45: 0.84, 50: 0.76, 55: 0.65, 60: 0.53 },
  "90": {
    10: 1.2,
    15: 1.17,
    20: 1.13,
    25: 1.08,
    30: 1.04,
    35: 1,
    40: 0.95,
    45: 0.91,
    50: 0.85,
    55: 0.79,
    60: 0.74,
    65: 0.68,
    70: 0.6,
    75: 0.52,
    80: 0.43
  }
};

export const groundTemperatureFactors: Record<Insulation, Record<number, number>> = {
  "70": { 10: 1.24, 15: 1.18, 20: 1.12, 25: 1.07, 30: 1, 35: 0.94, 40: 0.87, 45: 0.8, 50: 0.71, 55: 0.62, 60: 0.51 },
  "90": {
    10: 1.15,
    15: 1.12,
    20: 1.08,
    25: 1.03,
    30: 1,
    35: 0.96,
    40: 0.91,
    45: 0.86,
    50: 0.82,
    55: 0.76,
    60: 0.7,
    65: 0.65,
    70: 0.57,
    75: 0.49,
    80: 0.41
  }
};

export const groundThermalResistivity = {
  value: 2.5,
  factor: 1,
  label: "2.5 K·m/W"
};

export const groundThermalResistivityFactors: Record<number, number> = {
  1: 1.18,
  1.5: 1.1,
  2: 1.05,
  2.5: 1,
  3: 0.96
};

export const protectionI2Multiplier: Record<ProtectionType, number> = {
  mcb: 1.45,
  "adjustable-breaker": 1.3
};
