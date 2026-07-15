import {
  airTemperatureFactors,
  ampacityColumn,
  ampacityTables,
  groundTemperatureFactors,
  groundThermalResistivity,
  groupingFactors,
  installationMethods,
  protectionI2Multiplier,
  sections,
  spacingOptionsByGroupingTable,
  table4Arrangements
} from "./regulation-data";
import type {
  CalculationResult,
  CalculatorInput,
  GroupingMode,
  InstallationMethod,
  IzTablePair,
  SpacingCategory,
  TraceItem
} from "./types";
import type { IzTableNumber } from "./regulation-data";

function pickTableValue(table: Record<number, number>, numericKey: number) {
  const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
  const exact = table[numericKey];

  if (exact !== undefined) {
    return { key: numericKey, value: exact };
  }

  const fallbackKey = keys.find((key) => numericKey <= key) ?? keys[keys.length - 1];
  return { key: fallbackKey, value: table[fallbackKey] };
}

function resolveGroupingMode(method: InstallationMethod, input: CalculatorInput): GroupingMode {
  if (method.id === "lamed-ground-conduit") {
    return input.cableKind === "singleCore" ? "table6" : "table7";
  }

  return method.groupingMode;
}

export function resolveIzTable(method: InstallationMethod, input: Pick<CalculatorInput, "insulation" | "vCategory">): IzTableNumber {
  const tablePair = method.requiresVCategory && input.vCategory ? method.vCategories?.[input.vCategory].izTables : method.izTables;

  if (!tablePair) {
    throw new Error("יש לבחור קטגוריית V לפי טווחי התקנה בתקנה.");
  }

  return tablePair[input.insulation] as IzTableNumber;
}

export function izTableLabel(tableNumber: IzTableNumber) {
  return `טבלה ${tableNumber}`;
}

function getAmpacityValue(tableNumber: IzTableNumber, input: Pick<CalculatorInput, "material" | "phase" | "section">) {
  const row = ampacityTables[tableNumber].find((item) => item.section === input.section);
  const column = ampacityColumn(input.material, input.phase);

  if (!row) {
    return { column, value: undefined };
  }

  return { column, value: row[column] };
}

function columnLabel(column: ReturnType<typeof ampacityColumn>) {
  switch (column) {
    case "copperSingle":
      return "נחושת, מעגל חד-מופעי";
    case "copperThree":
      return "נחושת, מעגל תלת-מופעי";
    case "aluminiumSingle":
      return "אלומיניום, מעגל חד-מופעי";
    case "aluminiumThree":
      return "אלומיניום, מעגל תלת-מופעי";
  }
}

export function resolveIzTablePair(method: InstallationMethod, input: Pick<CalculatorInput, "vCategory">): IzTablePair {
  if (method.requiresVCategory) {
    if (!input.vCategory || !method.vCategories?.[input.vCategory]) {
      throw new Error("יש לבחור קטגוריית V לפי טווחי התקנה בתקנה.");
    }

    return method.vCategories[input.vCategory].izTables;
  }

  return method.izTables;
}

export function getAvailableMethods(input: Pick<CalculatorInput, "cableKind" | "environment">) {
  return installationMethods.filter(
    (method) => method.environment === input.environment && method.cableKinds.includes(input.cableKind)
  );
}

export function getSpacingOptions(mode: GroupingMode) {
  if (mode === "table4") {
    return [];
  }

  return spacingOptionsByGroupingTable[mode];
}

export function validateInput(input: CalculatorInput): string[] {
  const errors: string[] = [];
  const method = installationMethods.find((item) => item.id === input.methodId);

  if (!method) {
    errors.push("יש לבחור שיטת התקנה תקפה.");
  } else {
    if (method.environment !== input.environment) {
      errors.push("שיטת ההתקנה אינה מתאימה לסביבה שנבחרה.");
    }
    if (!method.cableKinds.includes(input.cableKind)) {
      errors.push("שיטת ההתקנה אינה מתאימה לסוג הכבל או המוליכים.");
    }
    if (method.requiresVCategory && !input.vCategory) {
      errors.push("יש לבחור קטגוריית V עבור שיטת ההתקנה שנבחרה.");
    }
    if (input.insulation && input.material && input.phase && typeof input.section === "number") {
      const tableNumber = resolveIzTable(method, input);
      const ampacity = getAmpacityValue(tableNumber, input);
      if (ampacity.value === undefined) {
        errors.push("שטח החתך או עמודת החומר/פאזות אינם קיימים בטבלת Iz שנבחרה.");
      }
    }
  }

  if (!sections.includes(input.section as (typeof sections)[number])) {
    errors.push("שטח החתך אינו קיים בטבלאות גרסת V1.");
  }

  if (input.parallelCount < 1) {
    errors.push("מספר הכבלים או מערכות המוליכים במקביל חייב להיות לפחות 1.");
  }

  if (input.groupCount < input.parallelCount) {
    errors.push("המספר הכולל בקבוצה חייב להיות גדול או שווה למספר הכבלים או מערכות המוליכים במקביל.");
  }

  if (method) {
    const mode = resolveGroupingMode(method, input);

    if (mode === "table4" && !input.table4Arrangement) {
      errors.push("יש לבחור את סידור ההתקנה לפי טבלה 4.");
    }

    if (mode !== "table4") {
      const validSpacing = spacingOptionsByGroupingTable[mode].some((option) => option.value === input.spacing);
      if (!input.spacing || !validSpacing) {
        errors.push("יש לבחור מרחק מתאים לפי טבלת הקיבוץ הרלוונטית.");
      }
    }
  }

  if (!Number.isFinite(input.breakerRating) || input.breakerRating <= 0 || input.breakerRating > 4000) {
    errors.push("יש לבחור זרם נקוב של מפסק בתחום 1 עד 4000 אמפר.");
  }

  return errors;
}

function tableName(mode: GroupingMode) {
  return mode === "table4" ? "טבלה 4" : mode === "table5" ? "טבלה 5" : mode === "table6" ? "טבלה 6" : "טבלה 7";
}

function spacingLabel(mode: GroupingMode, spacing?: SpacingCategory) {
  if (mode === "table4") {
    return "לא רלוונטי";
  }

  return spacingOptionsByGroupingTable[mode].find((option) => option.value === spacing)?.label ?? "";
}

function getGroupingFactor(method: InstallationMethod, input: CalculatorInput) {
  const mode = resolveGroupingMode(method, input);

  if (mode === "table4") {
    const arrangementKey = input.table4Arrangement;
    if (!arrangementKey) {
      throw new Error("יש לבחור סידור התקנה לפי טבלה 4.");
    }

    const arrangement = table4Arrangements[arrangementKey];
    const picked = pickTableValue(arrangement.factors, input.groupCount);

    return {
      mode,
      table: "טבלה 4",
      row: `שורה ${arrangement.row}: ${arrangement.label}`,
      column: `${picked.key} מעגלים או כבלים`,
      spacing: "לא רלוונטי",
      value: picked.value
    };
  }

  const spacing = input.spacing;
  if (!spacing) {
    throw new Error("יש לבחור מרחק בין כבלים או קבוצות.");
  }

  const spacingTable = groupingFactors[mode][spacing as keyof (typeof groupingFactors)[typeof mode]];
  const picked = pickTableValue(spacingTable, input.groupCount);

  return {
    mode,
    table: tableName(mode),
    row: `${picked.key} קבוצות / כבלים`,
    column: spacingLabel(mode, spacing),
    spacing: spacingLabel(mode, spacing),
    value: picked.value
  };
}

export function calculateCable(input: CalculatorInput): CalculationResult {
  const errors = validateInput(input);
  if (errors.length > 0) {
    throw new Error(errors.join(" "));
  }

  const method = installationMethods.find((item) => item.id === input.methodId);
  if (!method) {
    throw new Error("שיטת ההתקנה לא תקפה.");
  }

  const izTable = resolveIzTable(method, input);
  const ampacity = getAmpacityValue(izTable, input);
  const iz = ampacity.value;

  if (iz === undefined) {
    throw new Error("לא נמצא זרם בסיסי עבור הבחירה.");
  }

  const temperatureTable =
    input.environment === "air" ? airTemperatureFactors[input.insulation] : groundTemperatureFactors[input.insulation];
  const temperaturePicked = pickTableValue(temperatureTable, input.ambientTemperature);
  const grouping = getGroupingFactor(method, input);
  const groundFactor = input.environment === "ground" ? groundThermalResistivity.factor : 1;

  const correctedPerCable = iz * temperaturePicked.value * grouping.value * groundFactor;
  const correctedTotal = correctedPerCable * input.parallelCount;
  const i2 = input.breakerRating * protectionI2Multiplier[input.protectionType];
  const inPass = input.breakerRating <= correctedTotal;
  const i2Pass = i2 <= 1.45 * correctedTotal;
  const breakerPass = inPass && i2Pass;

  let message = "המפסק האוטומטי שנבחר מתאים לזרם המתוקן.";
  if (!breakerPass) {
    const reasons: string[] = [];

    if (!inPass) {
      reasons.push(`In = ${input.breakerRating} A גדול מ-I'z כולל = ${Math.floor(correctedTotal)} A.`);
    }

    if (!i2Pass) {
      reasons.push(`I2 = ${Math.round(i2)} A גדול מ-1.45 × I'z כולל = ${Math.floor(1.45 * correctedTotal)} A.`);
    }

    message = reasons.join(" ");
  }

  const trace: TraceItem[] = [
    {
      table: izTableLabel(izTable),
      row: `${input.section} ממ״ר`,
      column: columnLabel(ampacity.column),
      value: iz,
      explanation: `שיטת התקנה ${method.marking} מפנה לטבלת Iz ${izTableLabel(izTable)}.`
    },
    {
      table: input.environment === "air" ? "טבלת תיקון טמפרטורת אוויר" : "טבלת תיקון טמפרטורת קרקע",
      row: `${temperaturePicked.key}°C`,
      column: `${input.insulation}°C`,
      value: temperaturePicked.value,
      explanation: input.environment === "air" ? "מקדם לפי טמפרטורת אוויר אופפת." : "מקדם לפי טמפרטורת קרקע."
    },
    {
      table: grouping.table,
      row: grouping.row,
      column: grouping.column,
      value: grouping.value,
      explanation: "טבלת הקיבוץ נקבעת אוטומטית לפי שיטת ההתקנה, סביבת ההתקנה וסוג הכבל."
    },
    {
      table: input.environment === "ground" ? "התנגדות תרמית של הקרקע" : "תנאי ייחוס",
      row: input.environment === "ground" ? groundThermalResistivity.label : "אוויר",
      column: input.environment === "ground" ? "ברירת מחדל מוסתרת בגרסת V1" : "לא נדרש",
      value: groundFactor,
      explanation:
        input.environment === "ground"
          ? "בגרסת V1 נעשה שימוש בערך ברירת המחדל 2.5 K·m/W עם מקדם 1.00."
          : "בהתקנה באוויר אין מקדם התנגדות תרמית לקרקע."
    },
    {
      table: "בדיקת הגנת עומס יתר",
      row: `In = ${input.breakerRating} A`,
      column: `I2 = ${protectionI2Multiplier[input.protectionType]} × In`,
      value: i2,
      explanation: "נבדקים התנאים In ≤ I'z וגם I2 ≤ 1.45 × I'z."
    }
  ];

  return {
    izTable: izTableLabel(izTable),
    groupingTable: grouping.table,
    groupingRow: grouping.row,
    spacingCategory: grouping.spacing,
    iz,
    temperatureFactor: temperaturePicked.value,
    groupingFactor: grouping.value,
    groundFactor,
    correctedPerCable,
    correctedTotal,
    i2,
    breakerPass,
    inPass,
    i2Pass,
    message,
    trace
  };
}
