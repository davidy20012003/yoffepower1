"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  calculateCable,
  getAvailableMethods,
  getSpacingOptions,
  validateInput
} from "@/cable-calculator/calculate";
import {
  getAvailableSections,
  getBreakerRatingOptions,
  getGroupQuantityOptions,
  normalizeDraftInput,
  resolveDraftGroupingMode,
  type DraftInput
} from "@/cable-calculator/input-state";
import { quantityOptions } from "@/cable-calculator/limits";
import {
  airTemperatureFactors,
  groundTemperatureFactors,
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

const sectionClass = "rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5";
const optionBaseClass =
  "rounded-lg border px-3 py-3 text-start text-sm font-semibold leading-6 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900";
const selectedClass = "border-blue-900 bg-blue-50 text-blue-950";
const unselectedClass = "border-slate-200 bg-white text-slate-800 hover:bg-slate-50";

type Option<T extends string | number> = {
  label: string;
  value: T;
  description?: string;
};

type StepKey =
  | "cableKind"
  | "material"
  | "section"
  | "parallelCount"
  | "environment"
  | "method"
  | "vCategory"
  | "insulation"
  | "phase"
  | "ambientTemperature"
  | "table4Arrangement"
  | "spacing"
  | "groupCount"
  | "protectionType"
  | "breakerRating";

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

function OptionGroup<T extends string | number>({
  title,
  options,
  selected,
  onSelect,
  compact = false,
  expanded = false,
  onReopen,
  changeLabel = "שנה"
}: {
  title: string;
  options: readonly Option<T>[];
  selected?: T;
  onSelect: (value: T) => void;
  compact?: boolean;
  expanded?: boolean;
  onReopen?: () => void;
  changeLabel?: string;
}) {
  const hasSelectedValue = selected !== undefined;
  const selectedOption = hasSelectedValue ? options.find((option) => option.value === selected) : undefined;
  const visibleOptions = selectedOption && !expanded ? [selectedOption] : options;

  return (
    <div className="grid min-w-0 gap-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-slate-800">{title}</p>
        {selectedOption && !expanded && onReopen ? (
          <button
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-blue-950 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
            onClick={onReopen}
            type="button"
          >
            {changeLabel}
          </button>
        ) : null}
      </div>
      <div className={`grid gap-2 ${compact ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-6" : "sm:grid-cols-2"}`} role="list">
        {visibleOptions.map((option) => {
          const isSelected = option.value === selected;

          return (
            <button
              aria-pressed={isSelected}
              className={`${optionBaseClass} ${isSelected ? selectedClass : unselectedClass}`}
              key={String(option.value)}
              onClick={() => onSelect(option.value)}
              type="button"
            >
              <span className="block">{option.label}</span>
              {option.description ? <span className="mt-1 block text-xs font-normal text-slate-600">{option.description}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MethodCard({
  method,
  selected,
  onSelect
}: {
  method: ReturnType<typeof getAvailableMethods>[number];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      aria-pressed={selected}
      className={`rounded-lg border p-4 text-start transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 ${
        selected ? selectedClass : unselectedClass
      }`}
      onClick={onSelect}
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
  );
}

export function CableCalculator() {
  const [input, setInput] = useState<DraftInput>({});
  const [methodsExpanded, setMethodsExpanded] = useState(true);
  const [expandedSteps, setExpandedSteps] = useState<Partial<Record<StepKey, boolean>>>({});
  const resultRef = useRef<HTMLElement | null>(null);
  const breakerSectionRef = useRef<HTMLElement | null>(null);
  const lastScrolledResultKey = useRef<string | null>(null);

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
  const groupQuantityOptions = getGroupQuantityOptions(groupingMode, input.parallelCount ?? 1);
  const breakerOptions = getBreakerRatingOptions(input.protectionType);
  const temperatureOptions =
    input.insulation && input.environment
      ? Object.keys(input.environment === "air" ? airTemperatureFactors[input.insulation] : groundTemperatureFactors[input.insulation])
          .map(Number)
          .sort((first, second) => first - second)
      : [];

  function isStepExpanded(step: StepKey) {
    return expandedSteps[step] === true;
  }

  function reopenStep(step: StepKey) {
    setExpandedSteps((current) => ({ ...current, [step]: true }));
  }

  function collapseStep(step: StepKey) {
    setExpandedSteps((current) => ({ ...current, [step]: false }));
  }

  function patch(next: DraftInput, completedStep?: StepKey) {
    if ("cableKind" in next || "environment" in next) {
      setMethodsExpanded(true);
    }

    if ("methodId" in next) {
      setMethodsExpanded(false);
    }

    if (completedStep) {
      collapseStep(completedStep);
    }

    setInput((current) => normalizeDraftInput(current, next));
  }

  function chooseAnotherBreaker() {
    setExpandedSteps((current) => ({
      ...current,
      protectionType: true,
      breakerRating: true
    }));
    setInput((current) => {
      const next = { ...current };
      delete next.breakerRating;
      return next;
    });
    window.requestAnimationFrame(() => {
      breakerSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
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
  const resultKey = result && fullInput ? JSON.stringify(fullInput) : null;

  useEffect(() => {
    if (!result || !resultKey || lastScrolledResultKey.current === resultKey) {
      return;
    }

    lastScrolledResultKey.current = resultKey;
    window.requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [result, resultKey]);

  return (
    <div className="space-y-6" dir="rtl">
      <section className={sectionClass}>
        <h2 className="text-xl font-bold text-slate-950">רצף בחירה</h2>
        <div className="mt-5 grid gap-5">
          <OptionGroup<CableKind>
            title="כבל או מוליכים"
            options={[
              { value: "multicore", label: "כבל רב-גידי" },
              { value: "singleCore", label: "מוליכים מבודדים / כבלים חד-גידיים" }
            ]}
            selected={input.cableKind}
            expanded={isStepExpanded("cableKind")}
            onReopen={() => reopenStep("cableKind")}
            onSelect={(cableKind) => patch({ cableKind }, "cableKind")}
          />

          {input.cableKind ? (
            <OptionGroup<ConductorMaterial>
              title="חומר המוליך"
              options={[
                { value: "copper", label: "נחושת" },
                { value: "aluminium", label: "אלומיניום" }
              ]}
              selected={input.material}
              expanded={isStepExpanded("material")}
              onReopen={() => reopenStep("material")}
              onSelect={(material) => patch({ material }, "material")}
            />
          ) : null}

          {input.material ? (
            <OptionGroup<number>
              compact
              title="שטח חתך"
              options={sectionOptions.map((section) => ({ value: section, label: `${section} ממ״ר` }))}
              selected={input.section}
              expanded={isStepExpanded("section")}
              onReopen={() => reopenStep("section")}
              onSelect={(section) => patch({ section }, "section")}
            />
          ) : null}

          {input.section ? (
            <OptionGroup<number>
              compact
              title="מספר כבלים / מערכות במקביל"
              options={quantityOptions.map((quantity) => ({ value: quantity, label: String(quantity) }))}
              selected={input.parallelCount ?? 1}
              expanded={isStepExpanded("parallelCount")}
              onReopen={() => reopenStep("parallelCount")}
              onSelect={(parallelCount) => patch({ parallelCount }, "parallelCount")}
            />
          ) : null}

          {input.parallelCount ? (
            <OptionGroup<Environment>
              title="סביבה חיצונית"
              options={[
                { value: "air", label: "אוויר" },
                { value: "ground", label: "קרקע" }
              ]}
              selected={input.environment}
              expanded={isStepExpanded("environment")}
              onReopen={() => reopenStep("environment")}
              onSelect={(environment) => patch({ environment }, "environment")}
            />
          ) : null}
        </div>
      </section>

      {input.environment ? (
        <section className={sectionClass}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-950">שיטת התקנה</h2>
            {activeMethod && !methodsExpanded ? (
              <button
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-blue-950 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
                onClick={() => setMethodsExpanded(true)}
                type="button"
              >
                שנה שיטת התקנה
              </button>
            ) : null}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {(activeMethod && !methodsExpanded ? [activeMethod] : methods).map((method) => (
              <MethodCard
                key={method.id}
                method={method}
                selected={input.methodId === method.id}
                onSelect={() => patch({ methodId: method.id }, "method")}
              />
            ))}
          </div>
        </section>
      ) : null}

      {activeMethod ? (
        <section className={sectionClass}>
          <h2 className="text-xl font-bold text-slate-950">פרטי חישוב</h2>
          <div className="mt-5 grid gap-5">
            {activeMethod.requiresVCategory ? (
              <OptionGroup<VCategory>
                title="קטגוריית V לפי התקנה"
                options={Object.entries(activeMethod.vCategories ?? {}).map(([value, category]) => ({
                  value: value as VCategory,
                  label: category.label
                }))}
                selected={input.vCategory}
                expanded={isStepExpanded("vCategory")}
                onReopen={() => reopenStep("vCategory")}
                onSelect={(vCategory) => patch({ vCategory }, "vCategory")}
              />
            ) : null}

            {!activeMethod.requiresVCategory || input.vCategory ? (
              <OptionGroup<Insulation>
                title="סוג הבידוד"
                options={[
                  { value: "70", label: "70°C - PVC" },
                  { value: "90", label: "90°C - XLPE" }
                ]}
                selected={input.insulation}
                expanded={isStepExpanded("insulation")}
                onReopen={() => reopenStep("insulation")}
                onSelect={(insulation) => patch({ insulation }, "insulation")}
              />
            ) : null}

            {input.insulation ? (
              <OptionGroup<Phase>
                title="חד-פאזי או תלת-פאזי"
                options={[
                  { value: "single", label: "חד-פאזי" },
                  { value: "three", label: "תלת-פאזי" }
                ]}
                selected={input.phase}
                expanded={isStepExpanded("phase")}
                onReopen={() => reopenStep("phase")}
                onSelect={(phase) => patch({ phase }, "phase")}
              />
            ) : null}

            {input.phase ? (
              <OptionGroup<number>
                compact
                title={input.environment === "ground" ? "טמפרטורת קרקע" : "טמפרטורת אוויר אופפת"}
                options={temperatureOptions.map((temperature) => ({ value: temperature, label: `${temperature}°C` }))}
                selected={input.ambientTemperature}
                expanded={isStepExpanded("ambientTemperature")}
                onReopen={() => reopenStep("ambientTemperature")}
                onSelect={(ambientTemperature) => patch({ ambientTemperature }, "ambientTemperature")}
              />
            ) : null}

            {readyForGrouping && groupingMode === "table4" ? (
              <OptionGroup<Table4Arrangement>
                title="סידור התקנה לפי טבלה 4"
                options={Object.entries(table4Arrangements).map(([value, arrangement]) => ({
                  value: value as Table4Arrangement,
                  label: `שורה ${arrangement.row}`,
                  description: arrangement.label
                }))}
                selected={input.table4Arrangement}
                expanded={isStepExpanded("table4Arrangement")}
                onReopen={() => reopenStep("table4Arrangement")}
                onSelect={(table4Arrangement) => patch({ table4Arrangement }, "table4Arrangement")}
              />
            ) : null}

            {readyForGrouping && groupingMode && groupingMode !== "table4" ? (
              <OptionGroup<SpacingCategory>
                title="מרחק בין כבלים / קבוצות"
                options={spacingOptions.map((spacing) => ({ value: spacing.value, label: spacing.label }))}
                selected={input.spacing}
                expanded={isStepExpanded("spacing")}
                onReopen={() => reopenStep("spacing")}
                onSelect={(spacing) => patch({ spacing }, "spacing")}
              />
            ) : null}

            {readyForGrouping && groupingResolved ? (
              <OptionGroup<number>
                compact
                title="מספר כולל בקבוצה"
                options={groupQuantityOptions.map((groupCount) => ({ value: groupCount, label: String(groupCount) }))}
                selected={input.groupCount ?? input.parallelCount ?? 1}
                expanded={isStepExpanded("groupCount")}
                onReopen={() => reopenStep("groupCount")}
                onSelect={(groupCount) => patch({ groupCount }, "groupCount")}
              />
            ) : null}
          </div>
        </section>
      ) : null}

      {showProtection ? (
        <section className={sectionClass} ref={breakerSectionRef}>
          <h2 className="text-xl font-bold text-slate-950">מפסק אוטומטי</h2>
          <div className="mt-5 grid gap-5">
            <OptionGroup<ProtectionType>
              title="סוג ההגנה"
              options={[
                { value: "mcb", label: "מא״ז / מפסק אוטומטי סטנדרטי", description: "עד 63 אמפר" },
                { value: "adjustable-breaker", label: "מפסק אוטומטי ניתן לכוונון", description: "עד 4000 אמפר" }
              ]}
              selected={input.protectionType}
              expanded={isStepExpanded("protectionType")}
              onReopen={() => reopenStep("protectionType")}
              onSelect={(protectionType) => patch({ protectionType }, "protectionType")}
            />

            {input.protectionType ? (
              <OptionGroup<number>
                compact
                title="זרם נקוב של המפסק In"
                options={breakerOptions.map((breakerRating) => ({ value: breakerRating, label: String(breakerRating) }))}
                selected={input.breakerRating}
                expanded={isStepExpanded("breakerRating")}
                onReopen={() => reopenStep("breakerRating")}
                onSelect={(breakerRating) => patch({ breakerRating }, "breakerRating")}
              />
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
        <section className={sectionClass} ref={resultRef}>
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
            {!result.breakerPass ? (
              <button
                className="mt-4 rounded-md bg-red-700 px-4 py-2 text-sm font-bold text-white hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-900"
                onClick={chooseAnotherBreaker}
                type="button"
              >
                בחר מפסק אחר
              </button>
            ) : null}
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
