"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  calculateCable,
  getAvailableMethods,
  getSpacingOptions,
  validateInput
} from "@/cable-calculator/calculate";
import {
  getAvailableSections,
  normalizeDraftInput,
  resolveDraftGroupingMode,
  type DraftInput
} from "@/cable-calculator/input-state";
import {
  airTemperatureFactors,
  groundTemperatureFactors,
  standardBreakers,
  table4Arrangements
} from "@/cable-calculator/regulation-data";
import type {
  CableKind,
  CalculatorInput,
  ConductorMaterial,
  Environment,
  Insulation,
  Phase,
  ProtectionType,
  SpacingCategory,
  Table4Arrangement,
  VCategory
} from "@/cable-calculator/types";

const optionClass =
  "w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-3 text-base text-slate-950 outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-100";
const labelClass = "grid min-w-0 gap-2 text-sm font-bold text-slate-800";

function updateNumber(value: string) {
  return Number.parseFloat(value);
}

function isReady(input: DraftInput): input is CalculatorInput {
  return (
    Boolean(input.cableKind) &&
    Boolean(input.material) &&
    typeof input.section === "number" &&
    typeof input.parallelCount === "number" &&
    Boolean(input.environment) &&
    Boolean(input.methodId) &&
    Boolean(input.insulation) &&
    Boolean(input.phase) &&
    typeof input.ambientTemperature === "number" &&
    typeof input.groupCount === "number" &&
    Boolean(input.protectionType) &&
    typeof input.breakerRating === "number"
  );
}

export function CableCalculator() {
  const [input, setInput] = useState<DraftInput>({});

  const methods = useMemo(() => {
    if (!input.cableKind || !input.environment) {
      return [];
    }

    return getAvailableMethods({
      cableKind: input.cableKind,
      environment: input.environment
    });
  }, [input.cableKind, input.environment]);

  const activeMethod = methods.find((method) => method.id === input.methodId);
  const groupingMode = resolveDraftGroupingMode(input);
  const spacingOptions = groupingMode ? getSpacingOptions(groupingMode) : [];
  const sectionOptions = getAvailableSections(input.material);
  const temperatureOptions =
    input.insulation && input.environment
      ? Object.keys(input.environment === "air" ? airTemperatureFactors[input.insulation] : groundTemperatureFactors[input.insulation]).map(Number)
      : [];

  function patch(next: DraftInput) {
    setInput((current) => normalizeDraftInput(current, next));
  }

  const fullInput = isReady(input)
    ? ({
        ...input,
        groupCount: Math.max(input.groupCount, input.parallelCount)
      } as CalculatorInput)
    : null;
  const readyForGrouping =
    Boolean(activeMethod) &&
    Boolean(input.insulation) &&
    Boolean(input.phase) &&
    typeof input.ambientTemperature === "number" &&
    (!activeMethod?.requiresVCategory || Boolean(input.vCategory));
  const groupingResolved =
    groupingMode === "table4" ? Boolean(input.table4Arrangement) : groupingMode ? Boolean(input.spacing) : false;
  const showProtection = readyForGrouping && typeof input.groupCount === "number" && groupingResolved;
  const errors = fullInput && showProtection ? validateInput(fullInput) : [];
  const result = fullInput && showProtection && errors.length === 0 ? calculateCable(fullInput) : null;

  return (
    <div className="space-y-6" dir="rtl">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-xl font-bold text-slate-950">רצף בחירה</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className={labelClass}>
            כבל או מוליכים
            <select className={optionClass} value={input.cableKind ?? ""} onChange={(event) => patch({ cableKind: event.target.value as CableKind })}>
              <option value="" disabled>
                בחר
              </option>
              <option value="multicore">כבל רב-גידי</option>
              <option value="singleCore">מוליכים מבודדים / כבלים חד-גידיים</option>
            </select>
          </label>

          {input.cableKind ? (
            <label className={labelClass}>
              חומר המוליך
              <select className={optionClass} value={input.material ?? ""} onChange={(event) => patch({ material: event.target.value as ConductorMaterial })}>
                <option value="" disabled>
                  בחר
                </option>
                <option value="copper">נחושת</option>
                <option value="aluminium">אלומיניום</option>
              </select>
            </label>
          ) : null}

          {input.material ? (
            <label className={labelClass}>
              שטח חתך
              <select className={optionClass} value={input.section ?? ""} onChange={(event) => patch({ section: updateNumber(event.target.value) })}>
                <option value="" disabled>
                  בחר
                </option>
                {sectionOptions.map((section) => (
                  <option key={section} value={section}>
                    {section} ממ״ר
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {input.section ? (
            <label className={labelClass}>
              מספר כבלים / מערכות במקביל
              <input
                className={optionClass}
                min={1}
                type="number"
                value={input.parallelCount ?? 1}
                onChange={(event) => patch({ parallelCount: Math.max(1, Number.parseInt(event.target.value, 10) || 1) })}
              />
            </label>
          ) : null}

          {input.parallelCount ? (
            <label className={labelClass}>
              סביבה חיצונית
              <select className={optionClass} value={input.environment ?? ""} onChange={(event) => patch({ environment: event.target.value as Environment })}>
                <option value="" disabled>
                  בחר
                </option>
                <option value="air">אוויר</option>
                <option value="ground">קרקע</option>
              </select>
            </label>
          ) : null}
        </div>
      </section>

      {input.environment ? (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-xl font-bold text-slate-950">שיטת התקנה</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {methods.map((method) => (
              <button
                className={`rounded-lg border p-4 text-start transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 ${
                  input.methodId === method.id ? "border-blue-900 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
                key={method.id}
                onClick={() => patch({ methodId: method.id })}
                type="button"
              >
                <span className="relative block h-28 w-full overflow-hidden rounded-md border border-slate-200 bg-white">
                  <Image
                    alt={`שיטת התקנה ${method.marking}`}
                    className="object-contain p-2"
                    fill
                    sizes="(min-width: 768px) 40vw, 90vw"
                    src={method.imagePath}
                  />
                </span>
                <span className="mt-3 block text-lg font-bold text-slate-950">
                  {method.marking} - {method.title}
                </span>
                <span className="mt-1 block text-sm leading-6 text-slate-700">{method.description}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {activeMethod ? (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-xl font-bold text-slate-950">פרטי חישוב</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {activeMethod.requiresVCategory ? (
              <label className={labelClass}>
                קטגוריית V לפי התקנה
                <select className={optionClass} value={input.vCategory ?? ""} onChange={(event) => patch({ vCategory: event.target.value as VCategory })}>
                  <option value="" disabled>
                    בחר לפי האיור
                  </option>
                  {Object.entries(activeMethod.vCategories ?? {}).map(([value, category]) => (
                    <option key={value} value={value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {(!activeMethod.requiresVCategory || input.vCategory) ? (
              <label className={labelClass}>
                סוג הבידוד
                <select className={optionClass} value={input.insulation ?? ""} onChange={(event) => patch({ insulation: event.target.value as Insulation })}>
                  <option value="" disabled>
                    בחר
                  </option>
                  <option value="70">70°C - PVC</option>
                  <option value="90">90°C - XLPE</option>
                </select>
              </label>
            ) : null}

            {input.insulation ? (
              <label className={labelClass}>
                חד-פאזי או תלת-פאזי
                <select className={optionClass} value={input.phase ?? ""} onChange={(event) => patch({ phase: event.target.value as Phase })}>
                  <option value="" disabled>
                    בחר
                  </option>
                  <option value="single">חד-פאזי</option>
                  <option value="three">תלת-פאזי</option>
                </select>
              </label>
            ) : null}

            {input.phase ? (
              <label className={labelClass}>
                {input.environment === "ground" ? "טמפרטורת קרקע" : "טמפרטורת אוויר אופפת"}
                <select className={optionClass} value={input.ambientTemperature ?? ""} onChange={(event) => patch({ ambientTemperature: updateNumber(event.target.value) })}>
                  <option value="" disabled>
                    בחר
                  </option>
                  {temperatureOptions.map((temperature) => (
                    <option key={temperature} value={temperature}>
                      {temperature}°C
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {readyForGrouping && groupingMode === "table4" ? (
              <label className={labelClass}>
                סידור התקנה לפי טבלה 4
                <select
                  className={optionClass}
                  value={input.table4Arrangement ?? ""}
                  onChange={(event) => patch({ table4Arrangement: event.target.value as Table4Arrangement })}
                >
                  <option value="" disabled>
                    בחר סידור
                  </option>
                  {Object.entries(table4Arrangements).map(([value, arrangement]) => (
                    <option key={value} value={value}>
                      שורה {arrangement.row} - {arrangement.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {readyForGrouping && groupingMode && groupingMode !== "table4" ? (
              <label className={labelClass}>
                מרחק בין כבלים / קבוצות
                <select className={optionClass} value={input.spacing ?? ""} onChange={(event) => patch({ spacing: event.target.value as SpacingCategory })}>
                  <option value="" disabled>
                    בחר מרחק
                  </option>
                  {spacingOptions.map((spacing) => (
                    <option key={spacing.value} value={spacing.value}>
                      {spacing.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {readyForGrouping && groupingResolved ? (
              <label className={labelClass}>
                מספר כולל בקבוצה
                <input
                  className={optionClass}
                  min={input.parallelCount}
                  type="number"
                  value={input.groupCount ?? input.parallelCount ?? 1}
                  onChange={(event) =>
                    patch({ groupCount: Math.max(input.parallelCount ?? 1, Number.parseInt(event.target.value, 10) || input.parallelCount || 1) })
                  }
                />
              </label>
            ) : null}
          </div>
        </section>
      ) : null}

      {showProtection ? (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-xl font-bold text-slate-950">מפסק אוטומטי</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className={labelClass}>
              סוג ההגנה
              <select className={optionClass} value={input.protectionType ?? ""} onChange={(event) => patch({ protectionType: event.target.value as ProtectionType })}>
                <option value="" disabled>
                  בחר
                </option>
                <option value="mcb">מא״ז / מפסק אוטומטי סטנדרטי</option>
                <option value="adjustable-breaker">מפסק אוטומטי ניתן לכוונון</option>
              </select>
            </label>

            {input.protectionType ? (
              <label className={labelClass}>
                זרם נקוב של המפסק In
                <input
                  className={optionClass}
                  inputMode="numeric"
                  list="standard-breaker-ratings"
                  max={4000}
                  min={1}
                  type="number"
                  value={input.breakerRating ?? ""}
                  onChange={(event) => patch({ breakerRating: updateNumber(event.target.value) })}
                />
                <datalist id="standard-breaker-ratings">
                  {standardBreakers.map((rating) => (
                    <option key={rating} value={rating} />
                  ))}
                </datalist>
              </label>
            ) : null}
          </div>
        </section>
      ) : null}

      {errors.length > 0 ? (
        <section className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-900">
          <h2 className="font-bold">יש לתקן את הנתונים</h2>
          <ul className="mt-2 list-inside list-disc">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {result ? (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-xl font-bold text-slate-950">תוצאת זרם מותר ובדיקת מפסק</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ResultCard label="טבלת Iz" value={result.izTable} />
            <ResultCard label="טבלת קיבוץ" value={result.groupingTable} />
            <ResultCard label="שורת קיבוץ" value={result.groupingRow} />
            <ResultCard label="מרחק" value={result.spacingCategory} />
            <ResultCard label="Iz בסיסי (אמפר)" value={result.iz.toFixed(0)} />
            <ResultCard label="מקדם טמפרטורה" value={result.temperatureFactor.toFixed(2)} />
            <ResultCard label="מקדם קיבוץ" value={result.groupingFactor.toFixed(2)} />
            <ResultCard label="מקדם קרקע" value={result.groundFactor.toFixed(2)} />
            <ResultCard label="I'z לכבל אחד (אמפר)" value={`${Math.floor(result.correctedPerCable)}`} />
            <ResultCard label="I'z כוללת (אמפר)" value={`${Math.floor(result.correctedTotal)}`} valueClassName="text-red-600" />
            <ResultCard label="I2 מחושב (אמפר)" value={`${Math.round(result.i2)}`} />
          </div>
          <div className={`mt-5 rounded-lg p-4 ${result.breakerPass ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-900"}`}>
            <p className="text-lg font-bold">{result.breakerPass ? "עובר" : "נכשל"}</p>
            <p className="mt-1 leading-7">{result.message}</p>
          </div>

          <details className="mt-4 rounded-lg border border-slate-200 bg-slate-50">
            <summary className="cursor-pointer px-4 py-3 font-bold text-blue-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900">
              הצג טבלאות ומקדמים שנעשה בהם שימוש
            </summary>
            <div className="grid gap-3 border-t border-slate-200 p-4">
              {result.trace.map((item) => (
                <article className="rounded-md border border-slate-200 bg-white p-3" key={`${item.table}-${item.row}-${item.column}`}>
                  <h3 className="font-bold text-slate-950">{item.table}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    שורה: {item.row} · עמודה: {item.column} · ערך: {item.value.toFixed(2)}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.explanation}</p>
                </article>
              ))}
            </div>
          </details>
        </section>
      ) : null}
    </div>
  );
}

function ResultCard({ label, value, valueClassName = "text-slate-950" }: { label: string; value: string; valueClassName?: string }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <p className={`mt-1 text-lg font-bold ${valueClassName}`}>{value}</p>
    </article>
  );
}
