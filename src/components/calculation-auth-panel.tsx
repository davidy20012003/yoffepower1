"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import type { CalculationResult, CalculatorInput, TraceItem } from "@/cable-calculator/types";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type CalculationAuthPanelProps = {
  input: CalculatorInput | null;
  result: CalculationResult | null;
};

const pendingAuthNameKey = "yoffe-calculator-pending-auth-name";
const pendingAuthEmailKey = "yoffe-calculator-pending-auth-email";

export function CalculationAuthPanel({ input, result }: CalculationAuthPanelProps) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [calculationTitle, setCalculationTitle] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [reportMessage, setReportMessage] = useState("");
  const [reportError, setReportError] = useState("");
  const [reportBlob, setReportBlob] = useState<Blob | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isSendingReport, setIsSendingReport] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const authRequestInFlight = useRef(false);

  const verifiedEmail = session?.user.email ?? "";
  const verifiedName = (session?.user.user_metadata?.name as string | undefined) ?? "";

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session);
      }
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !session) {
      return;
    }

    const pendingName = window.localStorage.getItem(pendingAuthNameKey);
    const pendingEmail = window.localStorage.getItem(pendingAuthEmailKey);
    const sessionEmail = session.user.email?.toLowerCase();

    if (!pendingName || !pendingEmail || pendingEmail !== sessionEmail) {
      return;
    }

    window.localStorage.removeItem(pendingAuthNameKey);
    window.localStorage.removeItem(pendingAuthEmailKey);

    if (session.user.user_metadata?.name === pendingName) {
      return;
    }

    supabase.auth.updateUser({ data: { name: pendingName } }).then(({ error }) => {
      if (!error) {
        supabase.auth.getSession().then(({ data }) => setSession(data.session));
      }
    });
  }, [session, supabase]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const cleanUrl = `${window.location.origin}${window.location.pathname}`;

    if (window.location.href !== cleanUrl) {
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [session]);

  useEffect(() => {
    if (resendSeconds <= 0) {
      return;
    }

    const timer = window.setTimeout(() => setResendSeconds((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  function openModal() {
    setErrorMessage("");
    setStatusMessage("");
    setIsModalOpen(true);
  }

  function closeModal() {
    if (!isBusy) {
      setIsModalOpen(false);
    }
  }

  async function sendMagicLink() {
    if (authRequestInFlight.current) {
      return;
    }

    if (!supabase) {
      setErrorMessage("אימות דוא״ל אינו מוגדר בסביבה זו.");
      return;
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!trimmedName || !normalizedEmail) {
      setErrorMessage("יש להזין שם וכתובת דוא״ל.");
      return;
    }

    authRequestInFlight.current = true;
    setIsBusy(true);
    setErrorMessage("");
    setStatusMessage("");

    window.localStorage.setItem(pendingAuthNameKey, trimmedName);
    window.localStorage.setItem(pendingAuthEmailKey, normalizedEmail);

    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        data: { name: trimmedName },
        emailRedirectTo: `${window.location.origin}/he/cable-calculator`,
        shouldCreateUser: true
      }
    });

    if (error) {
      authRequestInFlight.current = false;
      setIsBusy(false);
      setErrorMessage(getAuthErrorMessage(error));
      return;
    }

    authRequestInFlight.current = false;
    setIsBusy(false);
    setResendSeconds(60);
    setStatusMessage("נשלח קישור אימות לכתובת הדוא״ל. יש לפתוח את הקישור כדי להשלים את האימות.");
  }

  async function signOut() {
    if (!supabase) {
      return;
    }

    setIsBusy(true);
    await supabase.auth.signOut();
    setSession(null);
    setIsBusy(false);
  }

  async function generateReport() {
    if (!input || !result) {
      return;
    }

    setIsGeneratingReport(true);
    setReportError("");
    setReportMessage("");

    const reportElement = buildReportElement({
      customTitle: calculationTitle.trim(),
      generatedAt: new Date(),
      input,
      result
    });
    const reportContainer = buildReportContainer(reportElement);

    document.body.appendChild(reportContainer);

    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const blob = await html2pdf()
        .set({
          filename: reportFileName(calculationTitle),
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          margin: [10, 10, 10, 10],
          pagebreak: { mode: ["avoid-all", "css", "legacy"] }
        })
        .from(reportElement)
        .outputPdf("blob");

      if (blob.size < 5000) {
        throw new Error("Generated PDF is unexpectedly small.");
      }

      setReportBlob(blob);
      setReportMessage("הדוח נוצר ומוכן להורדה.");
    } catch {
      setReportBlob(null);
      setReportError("לא ניתן ליצור את הדוח כרגע. נסה שוב.");
    } finally {
      reportContainer.remove();
      setIsGeneratingReport(false);
    }
  }

  function downloadReport() {
    if (!reportBlob) {
      return;
    }

    const url = URL.createObjectURL(reportBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = reportFileName(calculationTitle);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function sendReportByEmail() {
    if (!reportBlob || !session?.access_token) {
      return;
    }

    setIsSendingReport(true);
    setReportError("");
    setReportMessage("");

    try {
      const response = await fetch("/api/send-report", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID()
        },
        body: JSON.stringify({
          fileName: reportFileName(calculationTitle),
          pdfBase64: await blobToBase64(reportBlob)
        })
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || `Email sending failed (${response.status}).`);
      }

      setReportMessage("הדוח נשלח בהצלחה");
    } catch (error) {
      setReportError(error instanceof Error ? error.message : "Email sending failed.");
    } finally {
      setIsSendingReport(false);
    }
  }

  return (
    <section className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4" dir="rtl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-blue-950">אימות משתמש בדוא״ל</h3>
          <p className="mt-1 text-sm leading-6 text-blue-950">
            {session
              ? `מחובר כ-${verifiedName || verifiedEmail}`
              : "ניתן להמשיך להשתמש במחשבון גם ללא אימות. אימות דוא״ל ישמש ליצירת דוח חישוב מקצועי."}
          </p>
        </div>
        {session ? (
          <button
            className="rounded-md border border-blue-900 px-4 py-2 text-sm font-bold text-blue-950 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
            disabled={isBusy}
            onClick={signOut}
            type="button"
          >
            התנתק
          </button>
        ) : (
          <button
            className="rounded-md bg-blue-950 px-4 py-2 text-sm font-bold text-white hover:bg-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:ring-offset-2"
            onClick={openModal}
            type="button"
          >
            אימות בדוא״ל
          </button>
        )}
      </div>

      {session ? (
        <div className="mt-4 grid gap-3 border-t border-blue-100 pt-4">
          <label className="grid gap-1 text-sm font-bold text-blue-950">
            שם הדוח
            <input
              className="rounded-md border border-blue-200 bg-white px-3 py-2 font-normal text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
              disabled={!result}
              onChange={(event) => {
                setCalculationTitle(event.target.value);
                setReportBlob(null);
                setReportMessage("");
              }}
              placeholder="לדוגמה: הזנת לוח ראשי"
              type="text"
              value={calculationTitle}
            />
          </label>
          <div className="grid gap-2 sm:grid-cols-3">
            <button
              className="rounded-md bg-blue-950 px-3 py-2 text-sm font-bold text-white hover:bg-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:ring-offset-2 disabled:opacity-60"
              disabled={!result || isGeneratingReport}
              onClick={generateReport}
              type="button"
            >
              {isGeneratingReport ? "יוצר דוח..." : "צור דוח"}
            </button>
            <button
              className="rounded-md border border-blue-900 bg-white px-3 py-2 text-sm font-bold text-blue-950 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 disabled:opacity-60"
              disabled={!reportBlob || isGeneratingReport}
              onClick={downloadReport}
              type="button"
            >
              הורד דוח
            </button>
            <button
              className="rounded-md border border-blue-900 bg-white px-3 py-2 text-sm font-bold text-blue-950 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 disabled:opacity-60"
              disabled={!reportBlob || isGeneratingReport || isSendingReport}
              onClick={sendReportByEmail}
              type="button"
            >
              {isSendingReport ? "שולח..." : "שלח בדוא״ל"}
            </button>
          </div>
          {reportMessage ? <p className="text-sm font-semibold text-blue-950">{reportMessage}</p> : null}
          {reportError ? <p className="text-sm font-semibold text-red-800">{reportError}</p> : null}
        </div>
      ) : null}

      {isModalOpen ? (
        <div
          aria-labelledby="email-verification-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          dir="rtl"
          role="dialog"
        >
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-bold text-slate-950" id="email-verification-title">
                אימות בדוא״ל
              </h3>
              <button
                aria-label="סגור"
                className="rounded-md border border-slate-200 px-3 py-1 text-sm font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
                onClick={closeModal}
                type="button"
              >
                סגור
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-1 text-sm font-bold text-slate-800">
                שם
                <input
                  autoComplete="name"
                  className="rounded-md border border-slate-300 px-3 py-2 font-normal text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
                  disabled={isBusy}
                  onChange={(event) => setName(event.target.value)}
                  type="text"
                  value={name}
                />
              </label>
              <label className="grid gap-1 text-sm font-bold text-slate-800">
                כתובת דוא״ל
                <input
                  autoComplete="email"
                  className="rounded-md border border-slate-300 px-3 py-2 font-normal text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
                  disabled={isBusy}
                  inputMode="email"
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  value={email}
                />
              </label>

              {statusMessage ? <p className="rounded-md bg-blue-50 p-3 text-sm font-semibold text-blue-950">{statusMessage}</p> : null}
              {errorMessage ? <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-800">{errorMessage}</p> : null}

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  className="rounded-md bg-blue-950 px-4 py-2 text-sm font-bold text-white hover:bg-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:ring-offset-2 disabled:opacity-60"
                  disabled={isBusy || resendSeconds > 0}
                  onClick={sendMagicLink}
                  type="button"
                >
                  {isBusy ? "שולח..." : resendSeconds > 0 ? `שלח שוב בעוד ${resendSeconds}` : "שלח קישור אימות"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function getAuthErrorMessage(error: { message?: string; code?: string; status?: number }) {
  const message = error.message ?? "";
  const code = error.code ?? "";

  if (error.status === 429 || code === "over_email_send_rate_limit" || message.toLowerCase().includes("rate limit")) {
    return "Email rate limit exceeded. Please wait a few minutes and try again.";
  }

  return message || "Authentication request failed. Please try again.";
}

function reportFileName(title: string) {
  const safeTitle = title.trim().replace(/[\\/:*?"<>|]+/g, "-") || "דוח חישוב כבל";
  return `${safeTitle}.pdf`;
}

function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Could not read generated PDF."));
    reader.onload = () => {
      const result = reader.result;

      if (typeof result !== "string") {
        reject(new Error("Could not read generated PDF."));
        return;
      }

      resolve(result.split(",")[1] ?? "");
    };

    reader.readAsDataURL(blob);
  });
}

function buildReportElement({
  customTitle,
  generatedAt,
  input,
  result
}: {
  customTitle: string;
  generatedAt: Date;
  input: CalculatorInput;
  result: CalculationResult;
}) {
  const root = document.createElement("section");
  const effectiveTitle = customTitle || "דוח חישוב כבל";
  root.dir = "rtl";
  root.style.cssText = [
    "width:190mm",
    "min-height:277mm",
    "box-sizing:border-box",
    "background:#ffffff",
    "color:#0f172a",
    "font-family:Arial,'Noto Sans Hebrew',sans-serif",
    "font-size:13px",
    "line-height:1.65",
    "padding:14mm"
  ].join(";");

  appendText(root, "h1", "דוח חישוב כבל", "margin:0;color:#0f172a;font-size:26px;font-weight:800;");
  appendText(root, "p", "David Yoffe Consulting & Testing", "margin:4px 0 18px;color:#334155;font-size:14px;font-weight:700;");
  appendKeyValue(root, "שם הדוח", effectiveTitle);
  appendKeyValue(root, "תאריך ושעה", formatHebrewDateTime(generatedAt));

  appendText(root, "h2", "תוצאות החישוב", sectionTitleStyle);
  root.appendChild(
    createTable([
      ["Iz", `${formatAmps(result.iz)} אמפר`],
      ["I'z", `${formatAmps(result.correctedPerCable)} אמפר`],
      ...(input.parallelCount > 1 ? ([["I'z כוללת", `${formatAmps(result.correctedTotal)} אמפר`]] as string[][]) : []),
      ["סוג מפסק", protectionTypeLabel(input.protectionType)],
      ["זרם נקוב של המפסק", `${input.breakerRating} אמפר`],
      ["תוצאה", result.breakerPass ? "PASS / עובר" : "FAIL / נכשל"],
      ...(!result.breakerPass ? ([["סיבת כשל", result.message]] as string[][]) : [])
    ])
  );

  appendText(root, "h2", "טבלאות ומקדמים שנעשה בהם שימוש", sectionTitleStyle);
  root.appendChild(createTraceTable(result));

  const remarks = calculationRemarks(result);
  if (remarks.length > 0) {
    appendText(root, "h2", "הערות", sectionTitleStyle);
    const list = document.createElement("ul");
    list.style.cssText = "margin:0;padding:0 18px 0 0;";
    remarks.forEach((remark) => appendText(list, "li", remark, "margin:0 0 4px;"));
    root.appendChild(list);
  }

  appendText(root, "h2", "Generated by", sectionTitleStyle);
  appendText(root, "p", "David Yoffe Consulting & Testing", "margin:0;font-weight:700;color:#0f172a;");

  return root;
}

function buildReportContainer(reportElement: HTMLElement) {
  const container = document.createElement("div");
  container.setAttribute("aria-hidden", "true");
  container.style.cssText = [
    "position:fixed",
    "inset:0 auto auto 0",
    "z-index:2147483647",
    "width:210mm",
    "min-height:297mm",
    "overflow:hidden",
    "background:#ffffff",
    "pointer-events:none"
  ].join(";");
  container.appendChild(reportElement);
  return container;
}

const sectionTitleStyle = "margin:20px 0 8px;border-bottom:1px solid #cbd5e1;padding-bottom:5px;color:#0f172a;font-size:18px;font-weight:800;";
const tableStyle = "width:100%;border-collapse:collapse;margin:0 0 10px;page-break-inside:auto;";
const headerCellStyle = "border:1px solid #cbd5e1;background:#f1f5f9;color:#0f172a;padding:7px;text-align:right;font-weight:800;vertical-align:top;";
const bodyCellStyle = "border:1px solid #cbd5e1;padding:7px;text-align:right;vertical-align:top;";

function appendText(parent: HTMLElement, tagName: keyof HTMLElementTagNameMap, text: string, style?: string) {
  const element = document.createElement(tagName);
  element.textContent = text;
  if (style) {
    element.style.cssText = style;
  }
  parent.appendChild(element);
  return element;
}

function appendKeyValue(parent: HTMLElement, label: string, value: string) {
  const row = document.createElement("p");
  row.style.cssText = "margin:0 0 6px;";
  appendText(row, "strong", `${label}: `, "font-weight:800;");
  row.append(document.createTextNode(value));
  parent.appendChild(row);
}

function createTable(rows: string[][]) {
  const table = document.createElement("table");
  table.style.cssText = tableStyle;

  rows.forEach(([label, value]) => {
    const tr = document.createElement("tr");
    const labelCell = document.createElement("th");
    const valueCell = document.createElement("td");
    labelCell.textContent = label;
    valueCell.textContent = value;
    labelCell.style.cssText = headerCellStyle;
    valueCell.style.cssText = bodyCellStyle;
    tr.append(labelCell, valueCell);
    table.appendChild(tr);
  });

  return table;
}

function createTraceTable(result: CalculationResult) {
  const table = document.createElement("table");
  table.style.cssText = tableStyle;
  const header = document.createElement("tr");

  ["מספר טבלה", "שם הטבלה", "ערך נבחר", "מקדם / ערך מיושם", "ערך לאחר יישום"].forEach((label) => {
    const th = document.createElement("th");
    th.textContent = label;
    th.style.cssText = headerCellStyle;
    header.appendChild(th);
  });

  table.appendChild(header);

  reportTraceRows(result).forEach((row) => {
    const tr = document.createElement("tr");
    row.forEach((value) => {
      const td = document.createElement("td");
      td.textContent = value;
      td.style.cssText = bodyCellStyle;
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });

  return table;
}

function reportTraceRows(result: CalculationResult) {
  let currentValue = result.iz;

  return result.trace.map((item, index) => {
    if (index === 1) {
      currentValue = result.iz * item.value;
    } else if (index === 2 || index === 3) {
      currentValue *= item.value;
    } else if (index === 4) {
      currentValue = item.value;
    }

    const { number, name } = splitTableLabel(item.table);
    return [
      number,
      name,
      `${item.row} | ${item.column}`,
      formatTraceValue(item),
      index === 0 ? `${formatAmps(result.iz)} אמפר` : `${formatAmps(currentValue)} אמפר`
    ];
  });
}

function splitTableLabel(table: string) {
  const match = table.match(/^(טבלה\s+\S+)\s*(.*)$/);

  if (!match) {
    return { number: "-", name: table };
  }

  return { number: match[1], name: match[2] || table };
}

function formatTraceValue(item: TraceItem) {
  if (item.table.includes("Iz") || item.table.includes("הגנת עומס")) {
    return `${formatAmps(item.value)} אמפר`;
  }

  return item.value.toFixed(2);
}

function formatAmps(value: number) {
  return String(Math.floor(value));
}

function formatHebrewDateTime(date: Date) {
  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

function protectionTypeLabel(type: CalculatorInput["protectionType"]) {
  return type === "mcb" ? "מא״ז / מפסק אוטומטי סטנדרטי" : "מפסק אוטומטי ניתן לכוונון";
}

function calculationRemarks(result: CalculationResult) {
  return result.breakerPass ? [] : [result.message];
}
