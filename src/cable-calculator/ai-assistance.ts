import { getSpacingOptions } from "./calculate";
import { defaultTemperature, getAvailableSections, getGroupQuantityOptions, normalizeDraftInput, resolveDraftGroupingMode, type DraftInput } from "./input-state";
import type {
  CableKind,
  ConductorMaterial,
  Environment,
  Insulation,
  Phase,
  SpacingCategory,
  Table4Arrangement
} from "./types";

export type AiInstallationType =
  | "cable_tray"
  | "ladder_tray"
  | "wire_mesh_tray"
  | "cable_channel_or_trench"
  | "direct_burial"
  | "wall_or_ceiling"
  | "unknown";

export type AiPhotoAnalysis = {
  photoQuality: {
    isUsable: boolean;
    confidence: number;
    issues: string[];
  };
  recognition: {
    supported: boolean;
    installationType: AiInstallationType;
    confidence: number;
    reason: string;
    trayKind: "perforated" | "unperforated" | "wire_mesh" | "unknown";
    coverVisible: boolean | "unknown";
    environment: Environment | "unknown";
    wallCeilingLocation: "wall" | "ceiling" | "unknown";
    visibleExistingCableCount: number | null;
    multipleLayers: boolean | null;
    grouping: "single_layer_spaced" | "touching_or_bundled" | "grouped_or_piled" | "unknown";
    spacingCategory: SpacingCategory | "unknown";
    scaleAvailable: boolean;
    remainingSpace: {
      status: "fits" | "limited" | "approximately" | "unknown";
      estimateTextHebrew: string | null;
    };
    suggestedTable4Arrangement: Table4Arrangement | null;
  };
  messageHebrew: string;
};

export type AiCableInterpretation = {
  interpretedTextHebrew: string;
  confidence: number;
  cableKind: CableKind | null;
  material: ConductorMaterial | null;
  section: number | null;
  parallelCount: number | null;
  insulation: Insulation | null;
  phase: Phase | null;
  missingFields: string[];
  notes: string[];
};

export type AiAssistanceDraft = {
  draft: DraftInput;
  missingFields: string[];
  warnings: string[];
  appliedLabels: Array<{ label: string; value: string }>;
};

export function buildAiAssistanceDraft(photo: AiPhotoAnalysis, cable: AiCableInterpretation): AiAssistanceDraft {
  const missingFields = new Set<string>();
  const warnings = new Set<string>();
  const candidate: DraftInput = {};

  if (cable.cableKind) {
    candidate.cableKind = cable.cableKind;
  } else {
    missingFields.add("סוג כבל או מוליכים");
  }

  if (cable.material) {
    candidate.material = cable.material;
  } else {
    missingFields.add("חומר המוליך");
  }

  if (typeof cable.section === "number" && candidate.material && (getAvailableSections(candidate.material) as readonly number[]).includes(cable.section)) {
    candidate.section = cable.section;
  } else {
    missingFields.add("שטח חתך עד 300 ממ״ר");
  }

  if (typeof cable.parallelCount === "number" && Number.isInteger(cable.parallelCount) && cable.parallelCount >= 1 && cable.parallelCount <= 6) {
    candidate.parallelCount = cable.parallelCount;
  } else {
    missingFields.add("מספר כבלים / מערכות במקביל");
  }

  if (photo.recognition.supported && photo.recognition.confidence >= 0.7) {
    const environment = resolveEnvironment(photo);
    if (environment) {
      candidate.environment = environment;
      candidate.ambientTemperature = defaultTemperature(environment);
    } else {
      missingFields.add("סביבה חיצונית");
    }

    if (candidate.cableKind && candidate.environment) {
      const methodId = resolveMethodId(photo, candidate.cableKind, candidate.environment);
      if (methodId) {
        candidate.methodId = methodId;
      } else {
        missingFields.add("שיטת התקנה");
        if (requiresVisibleCover(photo)) {
          warnings.add("שיטת התקנה סגורה מחייבת מכסה גלוי וברור בתמונה. לכן השיטה לא מולאה אוטומטית.");
        }
      }
    }
  } else {
    missingFields.add("שיטת התקנה מזוהה בתמונה");
  }

  if (cable.insulation) {
    candidate.insulation = cable.insulation;
  } else {
    missingFields.add("סוג בידוד");
  }

  if (cable.phase) {
    candidate.phase = cable.phase;
  } else {
    missingFields.add("חד-פאזי או תלת-פאזי");
  }

  const normalizedBase = normalizeAiDraft(candidate);
  const groupingMode = resolveDraftGroupingMode(normalizedBase);

  if (groupingMode === "table4") {
    const arrangement = resolveTable4Arrangement(photo);
    if (arrangement) {
      candidate.table4Arrangement = arrangement;
    } else {
      missingFields.add("סידור התקנה לפי טבלה 4");
    }
  } else if (groupingMode) {
    const spacing = resolveSpacing(photo, groupingMode);
    if (spacing) {
      candidate.spacing = spacing;
    } else {
      missingFields.add("מרחק בין כבלים / קבוצות");
    }
  }

  const visibleExisting = photo.recognition.visibleExistingCableCount;
  const requestedParallelCount = candidate.parallelCount ?? 1;
  const totalGroupCount = typeof visibleExisting === "number" ? visibleExisting + requestedParallelCount : requestedParallelCount;
  const groupOptions = getGroupQuantityOptions(groupingMode, requestedParallelCount);

  if ((groupOptions as readonly number[]).includes(totalGroupCount)) {
    candidate.groupCount = totalGroupCount;
  } else if ((groupOptions as readonly number[]).includes(requestedParallelCount)) {
    candidate.groupCount = requestedParallelCount;
    if (typeof visibleExisting === "number") {
      missingFields.add("מספר כולל בקבוצה");
    }
  } else {
    missingFields.add("מספר כולל בקבוצה");
  }

  const draft = normalizeAiDraft(candidate);

  return {
    draft,
    missingFields: Array.from(missingFields),
    warnings: Array.from(warnings),
    appliedLabels: describeAiDraft(draft)
  };
}

export function normalizeAiDraft(candidate: DraftInput) {
  const orderedPatches: DraftInput[] = [
    { cableKind: candidate.cableKind },
    { material: candidate.material },
    { section: candidate.section },
    { parallelCount: candidate.parallelCount },
    { environment: candidate.environment },
    { methodId: candidate.methodId },
    { vCategory: candidate.vCategory },
    { insulation: candidate.insulation },
    { phase: candidate.phase },
    { ambientTemperature: candidate.ambientTemperature },
    { table4Arrangement: candidate.table4Arrangement },
    { spacing: candidate.spacing },
    { groupCount: candidate.groupCount }
  ];

  return orderedPatches.reduce<DraftInput>((current, patch) => {
    const entries = Object.entries(patch).filter(([, value]) => value !== undefined && value !== null);
    return entries.length > 0 ? normalizeDraftInput(current, Object.fromEntries(entries) as DraftInput) : current;
  }, {});
}

function resolveEnvironment(photo: AiPhotoAnalysis): Environment | null {
  if (photo.recognition.installationType === "direct_burial") {
    return "ground";
  }

  if (photo.recognition.environment === "air" || photo.recognition.environment === "ground") {
    return photo.recognition.environment;
  }

  if (
    photo.recognition.installationType === "cable_tray" ||
    photo.recognition.installationType === "ladder_tray" ||
    photo.recognition.installationType === "wire_mesh_tray" ||
    photo.recognition.installationType === "wall_or_ceiling"
  ) {
    return "air";
  }

  return null;
}

function resolveMethodId(photo: AiPhotoAnalysis, cableKind: CableKind, environment: Environment) {
  if (environment === "ground") {
    if (photo.recognition.installationType === "direct_burial") {
      return "lamed-aleph-direct-ground";
    }

    if (photo.recognition.installationType === "cable_channel_or_trench") {
      return "lamed-ground-conduit";
    }

    return null;
  }

  if (photo.recognition.installationType === "wall_or_ceiling") {
    return "yod-bet-wall-surface";
  }

  if (photo.recognition.installationType === "ladder_tray") {
    return cableKind === "singleCore" ? "yod-zayin-ladder-single" : "tet-zayin-ladder-multicore";
  }

  if (photo.recognition.installationType === "wire_mesh_tray") {
    return cableKind === "singleCore" ? "tet-vav-perforated-tray-single" : "yod-dalet-perforated-tray-multicore";
  }

  if (photo.recognition.installationType === "cable_tray") {
    if (photo.recognition.trayKind === "unperforated") {
      return "yod-gimel-unperforated-tray";
    }

    if (photo.recognition.trayKind === "perforated" || photo.recognition.trayKind === "wire_mesh") {
      return cableKind === "singleCore" ? "tet-vav-perforated-tray-single" : "yod-dalet-perforated-tray-multicore";
    }
  }

  if (photo.recognition.installationType === "cable_channel_or_trench") {
    if (photo.recognition.coverVisible !== true) {
      return null;
    }

    return cableKind === "singleCore" ? "heh-wall-channel-single" : "vav-wall-channel-multicore";
  }

  return null;
}

function requiresVisibleCover(photo: AiPhotoAnalysis) {
  return photo.recognition.installationType === "cable_channel_or_trench" && photo.recognition.coverVisible !== true;
}

function resolveTable4Arrangement(photo: AiPhotoAnalysis): Table4Arrangement | null {
  if (photo.recognition.multipleLayers || photo.recognition.grouping === "grouped_or_piled" || photo.recognition.grouping === "touching_or_bundled") {
    return "bundled";
  }

  if (photo.recognition.suggestedTable4Arrangement) {
    return photo.recognition.suggestedTable4Arrangement;
  }

  if (photo.recognition.installationType === "ladder_tray") {
    return "ladderSupports";
  }

  if (photo.recognition.installationType === "wire_mesh_tray") {
    return "perforatedTray";
  }

  if (photo.recognition.installationType === "wall_or_ceiling") {
    return photo.recognition.wallCeilingLocation === "ceiling" ? "ceiling" : "wallFloorTray";
  }

  if (photo.recognition.installationType === "cable_tray") {
    return photo.recognition.trayKind === "unperforated" ? "wallFloorTray" : "perforatedTray";
  }

  return null;
}

function resolveSpacing(photo: AiPhotoAnalysis, groupingMode: NonNullable<ReturnType<typeof resolveDraftGroupingMode>>) {
  if (photo.recognition.grouping === "touching_or_bundled") {
    return "touching";
  }

  if (photo.recognition.spacingCategory === "unknown") {
    return null;
  }

  const spacing = photo.recognition.spacingCategory;
  return getSpacingOptions(groupingMode).some((option) => option.value === spacing) ? spacing : null;
}

function describeAiDraft(draft: DraftInput) {
  const labels: Array<{ label: string; value: string }> = [];

  if (draft.cableKind) labels.push({ label: "סוג", value: draft.cableKind === "multicore" ? "כבל רב-גידי" : "כבלים חד-גידיים / מוליכים" });
  if (draft.material) labels.push({ label: "חומר", value: draft.material === "copper" ? "נחושת" : "אלומיניום" });
  if (draft.section) labels.push({ label: "חתך", value: `${draft.section} ממ״ר` });
  if (draft.parallelCount) labels.push({ label: "כמות במקביל", value: String(draft.parallelCount) });
  if (draft.environment) labels.push({ label: "סביבה", value: draft.environment === "air" ? "אוויר" : "קרקע" });
  if (draft.methodId) labels.push({ label: "שיטת התקנה", value: draft.methodId });
  if (draft.insulation) labels.push({ label: "בידוד", value: draft.insulation === "90" ? "90°C - XLPE" : "70°C - PVC" });
  if (draft.phase) labels.push({ label: "פאזות", value: draft.phase === "three" ? "תלת-פאזי" : "חד-פאזי" });
  if (draft.ambientTemperature) labels.push({ label: "טמפרטורה", value: `${draft.ambientTemperature}°C` });
  if (draft.table4Arrangement) labels.push({ label: "סידור", value: draft.table4Arrangement });
  if (draft.spacing) labels.push({ label: "מרחק", value: draft.spacing });
  if (draft.groupCount) labels.push({ label: "כמות בקבוצה", value: String(draft.groupCount) });

  return labels;
}
