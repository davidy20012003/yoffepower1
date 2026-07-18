import * as assert from "node:assert/strict";
import {
  buildAiAssistanceDraft,
  type AiCableInterpretation,
  type AiPhotoAnalysis
} from "../src/cable-calculator/ai-assistance";
import {
  airTemperatureFactors,
  ampacityTables,
  groundTemperatureFactors,
  groundThermalResistivityFactors,
  groupingFactors,
  installationMethods
} from "../src/cable-calculator/regulation-data";
import { calculateCable, getAvailableMethods, validateInput } from "../src/cable-calculator/calculate";
import { getAvailableSections, getBreakerRatingOptions, normalizeDraftInput } from "../src/cable-calculator/input-state";
import type { CalculatorInput } from "../src/cable-calculator/types";
import { dejavuSansBase64 } from "../src/pdf-report/dejavu-sans";
import { addHebrewDisclaimerToPdf, pdfDisclaimerParagraphs, pdfDisclaimerTitle, type JsPdfDocument } from "../src/pdf-report/disclaimer";

const { jsPDF } = require("../../node_modules/.pnpm/node_modules/jspdf") as { jsPDF: new (options: Record<string, unknown>) => any };

const base: CalculatorInput = {
  cableKind: "multicore",
  material: "copper",
  section: 16,
  parallelCount: 1,
  environment: "air",
  methodId: "dalet-wall-conduit-multicore",
  insulation: "70",
  phase: "three",
  ambientTemperature: 35,
  table4Arrangement: "bundled",
  groupCount: 1,
  protectionType: "mcb",
  breakerRating: 50
};

function result(input: Partial<CalculatorInput>) {
  return calculateCable({ ...base, ...input });
}

function countTextOccurrences(value: string, search: string) {
  return value.split(search).length - 1;
}

function createFakePdf() {
  const textCalls: Array<{ text: string; x: number; y: number }> = [];
  const fakePdf: JsPdfDocument & { addPageCalls: number; textCalls: typeof textCalls } = {
    addPageCalls: 0,
    textCalls,
    addFileToVFS() {},
    addFont() {},
    addPage() {
      this.addPageCalls += 1;
    },
    internal: {
      getNumberOfPages: () => 1 + fakePdf.addPageCalls,
      pageSize: {
        getHeight: () => 297,
        getWidth: () => 210
      }
    },
    line() {},
    output: () => new Blob(),
    setDrawColor() {},
    setFont() {},
    setFontSize() {},
    setLineWidth() {},
    setPage() {},
    setR2L() {},
    setTextColor() {},
    splitTextToSize: (text) => [text],
    text(text, x, y) {
      const textValue = Array.isArray(text) ? text.join("\n") : text;
      textCalls.push({ text: textValue, x, y });
    }
  };

  return fakePdf;
}

function cellCount() {
  let count = 0;
  for (const rows of Object.values(ampacityTables)) {
    for (const row of rows) {
      count += Number.isFinite(row.copperSingle) ? 1 : 0;
      count += Number.isFinite(row.copperThree) ? 1 : 0;
      count += Number.isFinite(row.aluminiumSingle) ? 1 : 0;
      count += Number.isFinite(row.aluminiumThree) ? 1 : 0;
    }
  }
  return count;
}

const representativeIzSamples = [
  ["70.1", 16, "copperThree", 53],
  ["70.2", 25, "aluminiumThree", 50],
  ["70.3", 120, "copperSingle", 252],
  ["70.4", 16, "copperThree", 58],
  ["70.5", 185, "copperThree", 321],
  ["70.6", 300, "aluminiumSingle", 279],
  ["70.7", 95, "aluminiumThree", 172],
  ["70.8", 630, "copperThree", 804],
  ["90.1", 240, "copperSingle", 407],
  ["90.2", 150, "aluminiumThree", 198],
  ["90.3", 120, "copperThree", 300],
  ["90.4", 70, "aluminiumSingle", 168],
  ["90.5", 185, "copperThree", 407],
  ["90.6", 150, "copperThree", 252],
  ["90.7", 300, "aluminiumSingle", 521],
  ["90.8", 500, "aluminiumThree", 739]
] as const;

assert.equal(Object.keys(ampacityTables).length, 16, "all 70.1-70.8 and 90.1-90.8 Iz tables are present");
assert.equal(cellCount(), 852, "all numeric Iz cells from the 16 tables are represented");

for (const [tableNumber, rows] of Object.entries(ampacityTables)) {
  assert.ok(rows.length > 0, `${tableNumber} has rows`);
  for (const row of rows) {
    assert.ok(Number.isFinite(row.section), `${tableNumber} section is numeric`);
    assert.ok(Number.isFinite(row.copperSingle), `${tableNumber} copper single-phase value exists at ${row.section}`);
    assert.ok(Number.isFinite(row.copperThree), `${tableNumber} copper three-phase value exists at ${row.section}`);
    if (row.section >= 6 || tableNumber.endsWith(".8")) {
      assert.ok(Number.isFinite(row.aluminiumSingle), `${tableNumber} aluminium single-phase value exists at ${row.section}`);
      assert.ok(Number.isFinite(row.aluminiumThree), `${tableNumber} aluminium three-phase value exists at ${row.section}`);
    }
  }
}

assert.equal(result({}).iz, 58, "Table 70.4 copper three-phase, 16 mm²");
assert.equal(result({ material: "aluminium" }).iz, 45, "Table 70.4 aluminium three-phase, 16 mm²");
assert.equal(result({ cableKind: "singleCore", methodId: "gimel-wall-conduit-single" }).iz, 64, "Table 70.3 copper three-phase, 16 mm²");
assert.equal(
  result({
    environment: "ground",
    methodId: "lamed-ground-conduit",
    insulation: "90",
    section: 150,
    ambientTemperature: 30,
    spacing: "25cm",
    groupCount: 1,
    table4Arrangement: undefined
  }).iz,
  252,
  "Table 90.6 copper three-phase, 150 mm² returns 252"
);
assert.equal(
  result({
    methodId: "yod-bet-wall-surface",
    insulation: "90",
    section: 185,
    phase: "single",
    material: "copper"
  }).iz,
  486,
  "Table 90.5 copper single-phase, 185 mm²"
);

for (const [tableNumber, section, column, expected] of representativeIzSamples) {
  const row = ampacityTables[tableNumber].find((item) => item.section === section);
  assert.equal(row?.[column], expected, `${tableNumber} representative ${column} value at ${section} mm2`);
}

const fakePdfWithSpace = createFakePdf();
const directDisclaimer = addHebrewDisclaimerToPdf({
  pdf: fakePdfWithSpace,
  fontBase64: "fake-font-data",
  reportContentHeightPx: 100,
  reportContentWidthPx: 700
});
const writtenDisclaimerText = fakePdfWithSpace.textCalls.map((call) => call.text).join("\n");
const logicalDisclaimerText = directDisclaimer.lines.join("\n");
assert.equal(fakePdfWithSpace.addPageCalls, 0, "PDF disclaimer does not add a page when there is sufficient final-page space");
assert.equal(directDisclaimer.lines[0], pdfDisclaimerTitle, "PDF disclaimer title is returned from the writer");
assert.equal(countTextOccurrences(logicalDisclaimerText, pdfDisclaimerTitle), 1, "PDF disclaimer title is written exactly once");
assert.ok(writtenDisclaimerText.length > 0, "PDF disclaimer sends text drawing commands");
for (const paragraph of pdfDisclaimerParagraphs) {
  for (const word of paragraph.split(" ").slice(0, 4)) {
    assert.ok(logicalDisclaimerText.includes(word), `PDF disclaimer logical text includes paragraph word: ${word}`);
  }
}

const fakePdfWithoutSpace = createFakePdf();
addHebrewDisclaimerToPdf({
  pdf: fakePdfWithoutSpace,
  fontBase64: "fake-font-data",
  reportContentHeightPx: 1000,
  reportContentWidthPx: 700
});
assert.equal(fakePdfWithoutSpace.addPageCalls, 1, "PDF disclaimer adds one final page when there is insufficient space");

const generatedPdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
generatedPdf.text("PDF artifact regression", 14, 18);
const artifactDisclaimer = addHebrewDisclaimerToPdf({
  pdf: generatedPdf as unknown as JsPdfDocument,
  fontBase64: dejavuSansBase64,
  reportContentHeightPx: 100,
  reportContentWidthPx: 700
});
const generatedPdfText = Buffer.from(generatedPdf.output("arraybuffer")).toString("latin1");
assert.equal(artifactDisclaimer.fontName, "DejaVuSans", "PDF disclaimer uses the embedded Hebrew-capable font");
assert.ok(generatedPdfText.includes("/DejaVuSans"), "generated PDF artifact contains the embedded disclaimer font");
assert.equal(countTextOccurrences(generatedPdfText, "<> Tj"), 0, "generated PDF artifact does not contain empty disclaimer text operators");

const highConfidenceTrayPhoto: AiPhotoAnalysis = {
  photoQuality: { isUsable: true, confidence: 0.92, issues: [] },
  recognition: {
    supported: true,
    installationType: "ladder_tray",
    confidence: 0.91,
    reason: "Visible ladder tray with existing cables.",
    trayKind: "unknown",
    environment: "air",
    wallCeilingLocation: "unknown",
    visibleExistingCableCount: 2,
    multipleLayers: false,
    grouping: "single_layer_spaced",
    spacingCategory: "unknown",
    scaleAvailable: false,
    remainingSpace: { status: "unknown", estimateTextHebrew: null },
    suggestedTable4Arrangement: "ladderSupports"
  },
  messageHebrew: "זוהה סולם כבלים."
};
const n2xyCableRequest: AiCableInterpretation = {
  interpretedTextHebrew: "שני כבלי N2XY 4×240",
  confidence: 0.95,
  cableKind: "multicore",
  material: "copper",
  section: 240,
  parallelCount: 2,
  insulation: "90",
  phase: "three",
  missingFields: [],
  notes: []
};
const aiDraft = buildAiAssistanceDraft(highConfidenceTrayPhoto, n2xyCableRequest).draft;
assert.equal(aiDraft.methodId, "tet-zayin-ladder-multicore", "AI ladder tray maps to the existing multicore ladder method");
assert.equal(aiDraft.table4Arrangement, "ladderSupports", "AI ladder tray maps to Table 4 ladder/support arrangement");
assert.equal(aiDraft.groupCount, 4, "AI group count includes only visible existing cables plus requested parallel cables");
assert.equal(aiDraft.breakerRating, undefined, "AI assistance does not choose a circuit breaker");

const lowConfidencePhoto: AiPhotoAnalysis = {
  ...highConfidenceTrayPhoto,
  photoQuality: { isUsable: false, confidence: 0.3, issues: ["blurred"] },
  recognition: { ...highConfidenceTrayPhoto.recognition, supported: false, confidence: 0.3, installationType: "unknown" }
};
const lowConfidenceDraft = buildAiAssistanceDraft(lowConfidencePhoto, n2xyCableRequest);
assert.equal(lowConfidenceDraft.draft.methodId, undefined, "low-confidence AI photo results do not fill an installation method");
assert.ok(lowConfidenceDraft.missingFields.includes("שיטת התקנה מזוהה בתמונה"), "low-confidence AI photo results require manual installation selection");

const methodFilterCases = [
  { cableKind: "multicore", environment: "air", count: 17 },
  { cableKind: "singleCore", environment: "air", count: 18 },
  { cableKind: "multicore", environment: "ground", count: 2 },
  { cableKind: "singleCore", environment: "ground", count: 2 }
] as const;

for (const filterCase of methodFilterCases) {
  const methods = getAvailableMethods(filterCase);
  assert.equal(methods.length, filterCase.count, `${filterCase.cableKind} ${filterCase.environment} method count`);
  assert.ok(
    methods.every((method) => method.environment === filterCase.environment && method.cableKinds.includes(filterCase.cableKind)),
    `${filterCase.cableKind} ${filterCase.environment} methods all match the selected branch`
  );
}

assert.equal(installationMethods.length, 31, "complete installation method list is retained");
assert.deepEqual(getAvailableSections("aluminium").slice(0, 2), [6, 10], "aluminium cross-section choices start at 6 mm2");
assert.deepEqual(getAvailableSections("copper").slice(0, 3), [1.5, 2.5, 4], "copper cross-section choices include small sections");
assert.equal(getAvailableSections("copper").slice(-1)[0], 300, "selectable cross-sections are capped at 300 mm2");
assert.deepEqual(getBreakerRatingOptions("mcb"), [6, 10, 16, 20, 25, 32, 40, 50, 63], "MCB ratings are capped at 63 A");
assert.equal(getBreakerRatingOptions("adjustable-breaker").slice(-1)[0], 4000, "adjustable breaker ratings are capped at 4000 A");
assert.equal(getAvailableMethods({ cableKind: "multicore", environment: "air" })[0]?.id, "yod-bet-wall-surface", "wall/ceiling method is shown first");
assert.equal(getAvailableMethods({ cableKind: "multicore", environment: "air" }).slice(-1)[0]?.id, "yod-aleph-frame", "door/window frame method is shown last");

assert.deepEqual(airTemperatureFactors["70"], {
  10: 1.3,
  15: 1.24,
  20: 1.19,
  25: 1.13,
  30: 1.06,
  35: 1,
  40: 0.93,
  45: 0.84,
  50: 0.76,
  55: 0.65,
  60: 0.53
});
assert.deepEqual(airTemperatureFactors["90"], {
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
});
assert.deepEqual(groundTemperatureFactors["70"], {
  10: 1.24,
  15: 1.18,
  20: 1.12,
  25: 1.07,
  30: 1,
  35: 0.94,
  40: 0.87,
  45: 0.8,
  50: 0.71,
  55: 0.62,
  60: 0.51
});
assert.deepEqual(groundTemperatureFactors["90"], {
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
});
assert.deepEqual(groundThermalResistivityFactors, { 1: 1.18, 1.5: 1.1, 2: 1.05, 2.5: 1, 3: 0.96 });

assert.equal(result({ groupCount: 3, table4Arrangement: "bundled" }).groupingFactor, 0.7, "Table 4 bundled row is applied");
assert.equal(result({ groupCount: 3, table4Arrangement: "wallFloorTray" }).groupingFactor, 0.79, "Table 4 wall/floor/tray row is applied");
assert.equal(result({ groupCount: 3, table4Arrangement: "ceiling" }).groupingFactor, 0.72, "Table 4 ceiling row is applied");
assert.equal(result({ groupCount: 3, table4Arrangement: "perforatedTray" }).groupingFactor, 0.82, "Table 4 perforated tray row is applied");
assert.equal(result({ groupCount: 3, table4Arrangement: "ladderSupports" }).groupingFactor, 0.82, "Table 4 ladder/support row is applied");
assert.equal(groupingFactors.table5.de[2], 0.8, "Table 5 symbolic De spacing is represented");

assert.equal(
  result({
    environment: "ground",
    methodId: "lamed-aleph-direct-ground",
    ambientTemperature: 30,
    spacing: "25cm",
    groupCount: 3,
    table4Arrangement: undefined
  }).groupingTable,
  "טבלה 5",
  "direct burial uses Table 5"
);
assert.equal(
  result({
    cableKind: "singleCore",
    environment: "ground",
    methodId: "lamed-ground-conduit",
    ambientTemperature: 30,
    spacing: "25cm",
    groupCount: 3,
    table4Arrangement: undefined
  }).groupingTable,
  "טבלה 6",
  "single-core cables/conductor sets in buried conduits use Table 6"
);
assert.equal(
  result({
    environment: "ground",
    methodId: "lamed-ground-conduit",
    ambientTemperature: 30,
    spacing: "25cm",
    groupCount: 3,
    table4Arrangement: undefined
  }).groupingTable,
  "טבלה 7",
  "multicore cables in buried conduits use Table 7"
);

assert.equal(result({ methodId: "yod-het-building-void", vCategory: "large", table4Arrangement: "bundled" }).izTable, "טבלה 70.3");
assert.equal(result({ methodId: "yod-het-building-void", vCategory: "small", table4Arrangement: "bundled" }).izTable, "טבלה 70.4");

assert.equal(
  result({
    environment: "ground",
    methodId: "lamed-ground-conduit",
    ambientTemperature: 30,
    spacing: "25cm",
    groupCount: 1,
    table4Arrangement: undefined
  }).groundFactor,
  1,
  "ground thermal resistivity is fixed to 2.5 K·m/W with factor 1.00"
);

assert.equal(validateInput({ ...base, parallelCount: 3, groupCount: 2 }).length, 1, "group count cannot be lower than parallel count");
assert.equal(validateInput({ ...base, table4Arrangement: undefined }).length, 1, "Table 4 requires an arrangement row");
assert.equal(validateInput({ ...base, protectionType: "adjustable-breaker", breakerRating: 4001 }).length, 1, "breaker rating is capped at 4000 A");
assert.ok(validateInput({ ...base, section: 400 }).some((error) => error.includes("300")), "cross-section is capped at 300 mm2");
assert.ok(validateInput({ ...base, breakerRating: 80 }).some((error) => error.includes("63")), "MCB is capped at 63 A");

assert.equal(result({ breakerRating: 50 }).breakerPass, true, "passing circuit breaker selection");
assert.equal(result({ breakerRating: 63 }).inPass, false, "failure when In exceeds corrected current");
assert.equal(result({ protectionType: "mcb", breakerRating: 63 }).i2Pass, false, "failure when I2 condition is not satisfied");
assert.ok(
  Math.abs(result({ parallelCount: 2, groupCount: 2, table4Arrangement: "bundled" }).correctedTotal - 92.8) < 0.0001,
  "parallel cables multiply corrected current after grouping"
);

const bothBreakerFailures = result({ breakerRating: 63 });
assert.equal(bothBreakerFailures.breakerPass, false, "breaker fails when both protection conditions fail");
assert.equal(bothBreakerFailures.inPass, false, "both-failure case includes In failure");
assert.equal(bothBreakerFailures.i2Pass, false, "both-failure case includes I2 failure");
assert.ok(bothBreakerFailures.message.includes("In = 63"), "both-failure message displays In reason");
assert.ok(bothBreakerFailures.message.includes("I2 = 91"), "both-failure message displays I2 reason");

let draft = normalizeDraftInput({}, { cableKind: "multicore" });
draft = normalizeDraftInput(draft, { material: "copper" });
draft = normalizeDraftInput(draft, { section: 16 });
assert.equal(draft.parallelCount, 1, "parallel default 1 is committed as a valid selection");
draft = normalizeDraftInput(draft, { environment: "air" });
assert.equal(draft.ambientTemperature, 35, "air reference temperature default is committed");
draft = normalizeDraftInput(draft, { methodId: "dalet-wall-conduit-multicore" });
draft = normalizeDraftInput(draft, { insulation: "70" });
draft = normalizeDraftInput(draft, { phase: "three" });
draft = normalizeDraftInput(draft, { table4Arrangement: "bundled" });
assert.equal(draft.groupCount, 1, "group quantity default 1 is committed once grouping is resolved");
draft = normalizeDraftInput(draft, { protectionType: "mcb", breakerRating: 50 });
draft = normalizeDraftInput(draft, { environment: "ground" });
assert.equal(draft.environment, "ground", "environment changes are preserved");
assert.equal(draft.ambientTemperature, 30, "ground reference temperature replaces air reference temperature");
assert.equal(draft.methodId, undefined, "changing environment clears stale installation method");
assert.equal(draft.protectionType, undefined, "changing environment clears stale protection selection");
draft = normalizeDraftInput(draft, { material: "aluminium" });
draft = normalizeDraftInput(draft, { section: 1.5 });
draft = normalizeDraftInput(draft, { material: "aluminium" });
assert.equal(draft.section, undefined, "invalid aluminium cross-section is cleared");

console.log("Cable calculator tests passed");
