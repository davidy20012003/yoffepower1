"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { buildAiAssistanceDraft, type AiCableInterpretation, type AiPhotoAnalysis } from "@/cable-calculator/ai-assistance";
import type { DraftInput } from "@/cable-calculator/input-state";
import { installationMethods, table4Arrangements } from "@/cable-calculator/regulation-data";

type CableAiAssistanceProps = {
  onApply: (draft: DraftInput) => void;
};

type SpeechRecognitionConstructor = new () => {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
};

type WindowWithSpeechRecognition = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

const panelClass = "rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-sm sm:p-5";
const buttonClass =
  "rounded-md bg-blue-950 px-4 py-2 text-sm font-bold text-white hover:bg-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900";
const secondaryButtonClass =
  "rounded-md border border-blue-900 px-4 py-2 text-sm font-bold text-blue-950 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900";

export function CableAiAssistance({ onApply }: CableAiAssistanceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [photoAnalysis, setPhotoAnalysis] = useState<AiPhotoAnalysis | null>(null);
  const [cableRequest, setCableRequest] = useState("");
  const [cableInterpretation, setCableInterpretation] = useState<AiCableInterpretation | null>(null);
  const [error, setError] = useState("");
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [isInterpretingCable, setIsInterpretingCable] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const assistanceDraft = useMemo(() => {
    if (!photoAnalysis || !cableInterpretation) {
      return null;
    }

    return buildAiAssistanceDraft(photoAnalysis, cableInterpretation);
  }, [photoAnalysis, cableInterpretation]);

  const canAskForCables =
    photoAnalysis?.photoQuality.isUsable === true && photoAnalysis.recognition.supported && photoAnalysis.recognition.confidence >= 0.7;
  const canApply = Boolean(assistanceDraft && Object.keys(assistanceDraft.draft).length > 0);

  async function handleFileChange(file: File | undefined) {
    setError("");
    setPhotoAnalysis(null);
    setCableInterpretation(null);

    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("יש להעלות תמונת JPG, PNG או WEBP.");
      return;
    }

    if (file.size > 6 * 1024 * 1024) {
      setError("התמונה גדולה מדי. יש להעלות תמונה עד 6MB.");
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    setImageDataUrl(dataUrl);
    setImagePreview(dataUrl);
  }

  async function analyzePhoto() {
    if (!imageDataUrl) {
      setError("יש לבחור תמונה לפני הפעלת AI.");
      return;
    }

    setIsAnalyzingPhoto(true);
    setError("");
    setPhotoAnalysis(null);
    setCableInterpretation(null);

    try {
      const result = await postJson<AiPhotoAnalysis>("/api/ai-cable-assistance", {
        mode: "photo",
        imageDataUrl
      });
      setPhotoAnalysis(result);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "AI assistance failed.");
    } finally {
      setIsAnalyzingPhoto(false);
    }
  }

  async function interpretCables() {
    if (!cableRequest.trim()) {
      setError("יש לתאר אילו כבלים רוצים להוסיף.");
      return;
    }

    setIsInterpretingCable(true);
    setError("");
    setCableInterpretation(null);

    try {
      const result = await postJson<AiCableInterpretation>("/api/ai-cable-assistance", {
        mode: "cable",
        cableRequest
      });
      setCableInterpretation(result);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "AI assistance failed.");
    } finally {
      setIsInterpretingCable(false);
    }
  }

  function startVoiceInput() {
    const speechWindow = window as WindowWithSpeechRecognition;
    const speechRecognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

    if (!speechRecognition) {
      setError("קלט קולי אינו נתמך בדפדפן הזה. אפשר להקליד את הבקשה.");
      return;
    }

    const recognition = new speechRecognition();
    recognition.lang = "he-IL";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setIsListening(true);

    recognition.onresult = (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) {
        setCableRequest((current) => (current ? `${current} ${transcript}` : transcript));
      }
    };
    recognition.onerror = () => {
      setError("לא ניתן היה לקלוט דיבור. אפשר להקליד את הבקשה.");
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }

  function applyDraft() {
    if (!assistanceDraft) {
      return;
    }

    onApply(assistanceDraft.draft);
    setIsOpen(false);
  }

  return (
    <section className={panelClass} dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-blue-950">AI Assistance</h2>
          <p className="mt-1 text-sm leading-6 text-slate-700">עזרה מוגבלת בזיהוי התקנה ומילוי ראשוני של שדות המחשבון.</p>
        </div>
        <button className={isOpen ? secondaryButtonClass : buttonClass} onClick={() => setIsOpen((current) => !current)} type="button">
          {isOpen ? "סגור" : "AI Assistance"}
        </button>
      </div>

      {isOpen ? (
        <div className="mt-5 grid gap-5">
          <div className="rounded-lg border border-blue-100 bg-white p-4">
            <p className="font-bold text-slate-950">צלם תמונה ברורה של התקנת הכבלים.</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              אם אפשר, הנח בתמונה חפיסת סיגריות, דף A4, סרט מדידה או חפץ אחר בגודל ידוע. AI assistance may not work for every installation type.
            </p>
          </div>

          <div className="grid gap-3">
            <input
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => handleFileChange(event.target.files?.[0])}
              ref={fileInputRef}
              type="file"
            />
            <button className={secondaryButtonClass} onClick={() => fileInputRef.current?.click()} type="button">
              בחר תמונה
            </button>
            {imagePreview ? (
              <Image
                alt="תמונה לבדיקה על ידי AI"
                className="max-h-80 w-full rounded-lg border border-slate-200 bg-white object-contain"
                height={500}
                src={imagePreview}
                unoptimized
                width={900}
              />
            ) : null}
            <button className={buttonClass} disabled={!imageDataUrl || isAnalyzingPhoto} onClick={analyzePhoto} type="button">
              {isAnalyzingPhoto ? "בודק תמונה..." : "נתח תמונה"}
            </button>
          </div>

          {error ? <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-900">{error}</p> : null}

          {photoAnalysis ? <PhotoAnalysisSummary analysis={photoAnalysis} /> : null}

          {canAskForCables ? (
            <div className="rounded-lg border border-blue-100 bg-white p-4">
              <label className="text-sm font-bold text-slate-950" htmlFor="ai-cable-request">
                What cables would you like to add?
              </label>
              <textarea
                className="mt-2 min-h-24 w-full rounded-md border border-slate-300 p-3 text-sm leading-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
                id="ai-cable-request"
                onChange={(event) => setCableRequest(event.target.value)}
                placeholder="לדוגמה: שני כבלי N2XY 4×240"
                value={cableRequest}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button className={buttonClass} disabled={isInterpretingCable} onClick={interpretCables} type="button">
                  {isInterpretingCable ? "מפרש בקשה..." : "פרש את הכבלים"}
                </button>
                <button className={secondaryButtonClass} disabled={isListening} onClick={startVoiceInput} type="button">
                  {isListening ? "מקשיב..." : "קלט קולי"}
                </button>
              </div>
            </div>
          ) : null}

          {cableInterpretation && assistanceDraft ? (
            <ConfirmationSummary
              draft={assistanceDraft}
              interpretation={cableInterpretation}
              onApply={applyDraft}
              canApply={canApply}
            />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function PhotoAnalysisSummary({ analysis }: { analysis: AiPhotoAnalysis }) {
  const lowConfidence = !analysis.photoQuality.isUsable || !analysis.recognition.supported || analysis.recognition.confidence < 0.7;

  return (
    <div className={`rounded-lg border p-4 ${lowConfidence ? "border-amber-200 bg-amber-50 text-amber-950" : "border-emerald-200 bg-emerald-50 text-emerald-950"}`}>
      <h3 className="font-bold">{lowConfidence ? "AI לא יכול להשתמש בתמונה הזו בביטחון" : "זיהוי ראשוני"}</h3>
      <p className="mt-2 text-sm leading-6">{analysis.messageHebrew}</p>
      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <SummaryItem label="סוג התקנה" value={installationTypeLabel(analysis.recognition.installationType)} />
        <SummaryItem label="רמת ביטחון" value={`${Math.round(analysis.recognition.confidence * 100)}%`} />
        <SummaryItem label="כבלים קיימים גלויים" value={analysis.recognition.visibleExistingCableCount === null ? "לא ניתן לקבוע" : String(analysis.recognition.visibleExistingCableCount)} />
        <SummaryItem label="קיבוץ גלוי" value={groupingLabel(analysis.recognition.grouping)} />
      </dl>
      {analysis.photoQuality.issues.length > 0 ? (
        <ul className="mt-3 list-inside list-disc text-sm leading-6">
          {analysis.photoQuality.issues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      ) : null}
      {analysis.recognition.remainingSpace.estimateTextHebrew ? (
        <p className="mt-3 rounded-md bg-white/70 p-3 text-sm font-semibold">{analysis.recognition.remainingSpace.estimateTextHebrew}</p>
      ) : null}
    </div>
  );
}

function ConfirmationSummary({
  draft,
  interpretation,
  onApply,
  canApply
}: {
  draft: ReturnType<typeof buildAiAssistanceDraft>;
  interpretation: AiCableInterpretation;
  onApply: () => void;
  canApply: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-lg font-bold text-slate-950">אישור לפני מילוי המחשבון</h3>
      <p className="mt-2 text-sm leading-6 text-slate-700">{interpretation.interpretedTextHebrew}</p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {draft.appliedLabels.map((item) => (
          <SummaryItem key={`${item.label}-${item.value}`} label={displayDraftLabel(item.label)} value={displayDraftValue(item.label, item.value)} />
        ))}
      </div>

      {draft.missingFields.length > 0 ? (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
          <p className="font-bold">שדות שלא מולאו אוטומטית:</p>
          <ul className="mt-2 list-inside list-disc leading-6">
            {draft.missingFields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {interpretation.notes.length > 0 ? (
        <ul className="mt-3 list-inside list-disc text-sm leading-6 text-slate-600">
          {interpretation.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}

      <button className={`${buttonClass} mt-4`} disabled={!canApply} onClick={onApply} type="button">
        אשר ומלא את המחשבון
      </button>
      <p className="mt-2 text-xs leading-5 text-slate-500">כל השדות שמולאו על ידי AI נשארים ניתנים לשינוי ידני.</p>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-bold text-slate-900">{value}</dd>
    </div>
  );
}

async function postJson<T extends object>(url: string, body: Record<string, unknown>) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const result = (await response.json()) as T | { error?: string };

  if (!response.ok) {
    throw new Error("error" in result && result.error ? result.error : "AI assistance failed.");
  }

  return result as T;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("לא ניתן לקרוא את קובץ התמונה."));
    reader.readAsDataURL(file);
  });
}

function installationTypeLabel(type: AiPhotoAnalysis["recognition"]["installationType"]) {
  const labels: Record<AiPhotoAnalysis["recognition"]["installationType"], string> = {
    cable_tray: "מגש כבלים",
    ladder_tray: "סולם כבלים",
    wire_mesh_tray: "מגש רשת",
    cable_channel_or_trench: "תעלה / חפירה",
    direct_burial: "הטמנה ישירה בקרקע",
    wall_or_ceiling: "צמוד לקיר או לתקרה",
    unknown: "לא מזוהה"
  };

  return labels[type];
}

function groupingLabel(grouping: AiPhotoAnalysis["recognition"]["grouping"]) {
  const labels: Record<AiPhotoAnalysis["recognition"]["grouping"], string> = {
    single_layer_spaced: "שכבה אחת עם מרווח נראה",
    touching_or_bundled: "צמודים / מקובצים",
    grouped_or_piled: "מקובצים או בערימה",
    unknown: "לא ניתן לקבוע"
  };

  return labels[grouping];
}

function displayDraftLabel(label: string) {
  return label;
}

function displayDraftValue(label: string, value: string) {
  if (label === "שיטת התקנה") {
    const method = installationMethods.find((item) => item.id === value);
    return method ? `${method.marking} - ${method.title}` : value;
  }

  if (label === "סידור") {
    return value in table4Arrangements ? table4Arrangements[value as keyof typeof table4Arrangements].label : value;
  }

  return value;
}
