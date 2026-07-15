import { getSpacingOptions } from "./calculate";
import { installationMethods, sections } from "./regulation-data";
import type {
  CableKind,
  CalculatorInput,
  ConductorMaterial,
  Environment,
  GroupingMode
} from "./types";

export type DraftInput = Partial<CalculatorInput>;

const referenceTemperature: Record<Environment, number> = {
  air: 35,
  ground: 30
};

export function defaultTemperature(environment: Environment) {
  return referenceTemperature[environment];
}

export function getAvailableSections(material?: ConductorMaterial) {
  if (material === "aluminium") {
    return sections.filter((section) => section >= 6);
  }

  return sections;
}

export function resolveDraftGroupingMode(input: DraftInput): GroupingMode | null {
  const method = installationMethods.find((item) => item.id === input.methodId);
  if (!method || !input.cableKind) {
    return null;
  }

  if (method.id === "lamed-ground-conduit") {
    return input.cableKind === "singleCore" ? "table6" : "table7";
  }

  return method.groupingMode;
}

function clearAfterSection(input: DraftInput) {
  delete input.parallelCount;
  delete input.environment;
  clearAfterEnvironment(input);
}

function clearAfterEnvironment(input: DraftInput) {
  delete input.methodId;
  clearAfterMethod(input);
}

function clearAfterMethod(input: DraftInput) {
  delete input.vCategory;
  delete input.table4Arrangement;
  delete input.spacing;
  delete input.groupCount;
  clearProtection(input);
}

function clearProtection(input: DraftInput) {
  delete input.protectionType;
  delete input.breakerRating;
}

function normalizeSpacing(input: DraftInput, mode: GroupingMode | null) {
  if (mode === "table4") {
    delete input.spacing;
    return;
  }

  if (!mode) {
    delete input.table4Arrangement;
    delete input.spacing;
    return;
  }

  delete input.table4Arrangement;

  if (input.spacing) {
    const valid = getSpacingOptions(mode).some((option) => option.value === input.spacing);
    if (!valid) {
      delete input.spacing;
    }
  }
}

function normalizeTemperature(input: DraftInput) {
  if (!input.environment) {
    delete input.ambientTemperature;
    return;
  }

  if (typeof input.ambientTemperature !== "number" || Number.isNaN(input.ambientTemperature)) {
    input.ambientTemperature = defaultTemperature(input.environment);
  }
}

export function normalizeDraftInput(current: DraftInput, next: DraftInput): DraftInput {
  const merged: DraftInput = { ...current, ...next };

  if ("cableKind" in next) {
    clearAfterEnvironment(merged);
  }

  if ("material" in next) {
    const validSections: readonly number[] = getAvailableSections(merged.material);
    const validSection = typeof merged.section === "number" && validSections.includes(merged.section);
    if (!validSection) {
      delete merged.section;
      clearAfterSection(merged);
    }
  }

  if ("section" in next) {
    if (typeof next.section !== "number" || Number.isNaN(next.section)) {
      delete merged.section;
      clearAfterSection(merged);
    } else if (typeof merged.parallelCount !== "number") {
      merged.parallelCount = 1;
    }
  }

  if ("parallelCount" in next) {
    const parallelCount = Math.max(1, Number.isFinite(Number(next.parallelCount)) ? Number(next.parallelCount) : 1);
    merged.parallelCount = parallelCount;
    if (typeof merged.groupCount === "number") {
      merged.groupCount = Math.max(merged.groupCount, parallelCount);
    }
  }

  if ("environment" in next) {
    if (next.environment) {
      clearAfterEnvironment(merged);
      merged.environment = next.environment;
      merged.ambientTemperature = defaultTemperature(next.environment);
    } else {
      delete merged.environment;
      clearAfterEnvironment(merged);
    }
  }

  if ("methodId" in next) {
    clearAfterMethod(merged);
    merged.methodId = next.methodId;
  }

  if ("insulation" in next) {
    normalizeTemperature(merged);
    clearProtection(merged);
  }

  if ("phase" in next) {
    clearProtection(merged);
  }

  if ("ambientTemperature" in next || "table4Arrangement" in next || "spacing" in next || "groupCount" in next) {
    clearProtection(merged);
  }

  const mode = resolveDraftGroupingMode(merged);
  normalizeSpacing(merged, mode);

  if (typeof merged.parallelCount === "number" && (merged.table4Arrangement || merged.spacing)) {
    merged.groupCount = Math.max(merged.groupCount ?? merged.parallelCount, merged.parallelCount);
  }

  normalizeTemperature(merged);

  return merged;
}

export function methodMatchesSelection(method: { environment: Environment; cableKinds: CableKind[] }, input: Pick<CalculatorInput, "cableKind" | "environment">) {
  return method.environment === input.environment && method.cableKinds.includes(input.cableKind);
}
