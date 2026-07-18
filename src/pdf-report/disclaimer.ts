export const hebrewPdfFontName = "DejaVuSans";
export const hebrewPdfFontFile = "DejaVuSans.ttf";

export const pdfDisclaimerParagraphs = [
  "דוח זה נוצר באופן אוטומטי על סמך הנתונים שהוזנו על ידי המשתמש.",
  "האחריות המלאה לנכונות הנתונים, לבחירת הנתונים ולשימוש בתוצאות החישוב חלה על המשתמש בלבד.",
  "דוח זה אינו מהווה תחליף לתכנון, בדיקה או אישור של מהנדס חשמל מוסמך ואינו מחליף את דרישות התקנים, התקנות והוראות החוק החלות."
];

export const pdfDisclaimerTitle = "הצהרה:";

export type JsPdfDocument = {
  addFileToVFS(fileName: string, fileData: string): void;
  addFont(fileName: string, fontName: string, fontStyle: string): void;
  addPage(): void;
  internal: {
    getNumberOfPages(): number;
    pageSize: {
      getHeight(): number;
      getWidth(): number;
    };
  };
  line(x1: number, y1: number, x2: number, y2: number): void;
  output(type: "blob"): Blob;
  setDrawColor(r: number, g: number, b: number): void;
  setFont(fontName: string, fontStyle?: string): void;
  setFontSize(fontSize: number): void;
  setLineWidth(width: number): void;
  setPage(pageNumber: number): void;
  setR2L?: (enabled: boolean) => void;
  setTextColor(r: number, g: number, b: number): void;
  splitTextToSize(text: string, maxWidth: number): string[];
  text(text: string | string[], x: number, y: number, options?: { align?: "right" | "left" | "center" }): void;
};

type DisclaimerPlacementInput = {
  pageHeight: number;
  pageWidth: number;
  reportContentHeightPx: number;
  reportContentWidthPx: number;
};

export type DisclaimerPlacement = {
  addPage: boolean;
  startY: number;
};

const topMarginMm = 8;
const bottomMarginMm = 12;
const htmlHorizontalMarginsMm = 20;
const htmlVerticalMarginsMm = 16;
const minGapFromCapturedContentMm = 6;
const disclaimerFontSize = 9;
const disclaimerTitleFontSize = 10;
const disclaimerLineHeightMm = 4.2;
const disclaimerTitleHeightMm = 4.8;
const disclaimerParagraphGapMm = 2.2;
const disclaimerSeparatorGapMm = 4;

export function addHebrewDisclaimerToPdf({
  pdf,
  fontBase64,
  reportContentHeightPx,
  reportContentWidthPx
}: {
  pdf: JsPdfDocument;
  fontBase64: string;
  reportContentHeightPx: number;
  reportContentWidthPx: number;
}) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const rightX = pageWidth - 14;
  const leftX = 14;
  const maxTextWidth = pageWidth - 28;

  pdf.addFileToVFS(hebrewPdfFontFile, fontBase64);
  pdf.addFont(hebrewPdfFontFile, hebrewPdfFontName, "normal");
  pdf.setFont(hebrewPdfFontName, "normal");
  pdf.setR2L?.(false);

  const wrappedParagraphs = pdfDisclaimerParagraphs.map((paragraph) => wrapHebrewParagraph(paragraph, maxTextWidth));
  const requiredHeight = disclaimerHeight(wrappedParagraphs);
  const placement = calculateDisclaimerPlacement({
    pageHeight,
    pageWidth,
    reportContentHeightPx,
    reportContentWidthPx
  }, requiredHeight);

  if (placement.addPage) {
    pdf.addPage();
  }

  const finalPageNumber = pdf.internal.getNumberOfPages();
  pdf.setPage(finalPageNumber);
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.2);
  pdf.line(leftX, placement.startY, rightX, placement.startY);

  let cursorY = placement.startY + disclaimerSeparatorGapMm;
  pdf.setTextColor(100, 116, 139);
  pdf.setFontSize(disclaimerTitleFontSize);
  pdf.text(toPdfVisualRtl(pdfDisclaimerTitle), rightX, cursorY, { align: "right" });
  cursorY += disclaimerTitleHeightMm;

  pdf.setFontSize(disclaimerFontSize);
  wrappedParagraphs.forEach((lines, index) => {
    lines.forEach((line) => {
      pdf.text(toPdfVisualRtl(line), rightX, cursorY, { align: "right" });
      cursorY += disclaimerLineHeightMm;
    });

    if (index < wrappedParagraphs.length - 1) {
      cursorY += disclaimerParagraphGapMm;
    }
  });

  return {
    pageNumber: finalPageNumber,
    startY: placement.startY,
    fontName: hebrewPdfFontName,
    lines: [pdfDisclaimerTitle, ...wrappedParagraphs.flat()]
  };
}

export function calculateDisclaimerPlacement(input: DisclaimerPlacementInput, requiredHeight: number): DisclaimerPlacement {
  const pageInnerHeight = input.pageHeight - htmlVerticalMarginsMm;
  const pageInnerWidth = input.pageWidth - htmlHorizontalMarginsMm;
  const reportHeightMm = input.reportContentWidthPx > 0 ? (input.reportContentHeightPx / input.reportContentWidthPx) * pageInnerWidth : 0;
  const usedInnerHeightOnFinalPage = reportHeightMm % pageInnerHeight || pageInnerHeight;
  const contentBottomY = topMarginMm + usedInnerHeightOnFinalPage;
  const latestStartY = input.pageHeight - bottomMarginMm - requiredHeight;
  const hasSpaceOnFinalPage = latestStartY >= contentBottomY + minGapFromCapturedContentMm;

  return {
    addPage: !hasSpaceOnFinalPage,
    startY: latestStartY
  };
}

function disclaimerHeight(wrappedParagraphs: string[][]) {
  const lineCount = wrappedParagraphs.reduce((total, lines) => total + lines.length, 0);
  const paragraphGaps = Math.max(wrappedParagraphs.length - 1, 0) * disclaimerParagraphGapMm;

  return disclaimerSeparatorGapMm + disclaimerTitleHeightMm + lineCount * disclaimerLineHeightMm + paragraphGaps;
}

function wrapHebrewParagraph(text: string, maxTextWidthMm: number) {
  const maxChars = Math.max(34, Math.floor(maxTextWidthMm / 3.05));
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const candidate = currentLine ? `${currentLine} ${word}` : word;

    if (candidate.length <= maxChars) {
      currentLine = candidate;
      return;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function toPdfVisualRtl(text: string) {
  return Array.from(text).reverse().join("");
}
