export type CableKind = "multicore" | "singleCore";
export type ConductorMaterial = "copper" | "aluminium";
export type Environment = "air" | "ground";
export type Insulation = "70" | "90";
export type Phase = "single" | "three";
export type ProtectionType = "mcb" | "adjustable-breaker";
export type GroupingMode = "table4" | "table5" | "table6" | "table7";
export type Table4Arrangement = "bundled" | "wallFloorTray" | "ceiling" | "perforatedTray" | "ladderSupports";
export type SpacingCategory = "touching" | "de" | "12.5cm" | "25cm" | "50cm" | "100cm";
export type VCategory = "small" | "large";

export type IzTablePair = {
  "70": string;
  "90": string;
};

export type InstallationMethod = {
  id: string;
  marking: string;
  title: string;
  description: string;
  environment: Environment;
  cableKinds: CableKind[];
  imagePath: string;
  izTables: IzTablePair;
  groupingMode: GroupingMode;
  requiresVCategory?: boolean;
  vCategories?: Record<VCategory, { label: string; izTables: IzTablePair }>;
};

export type CalculatorInput = {
  cableKind: CableKind;
  material: ConductorMaterial;
  section: number;
  parallelCount: number;
  environment: Environment;
  methodId: string;
  vCategory?: VCategory;
  insulation: Insulation;
  phase: Phase;
  ambientTemperature: number;
  table4Arrangement?: Table4Arrangement;
  spacing?: SpacingCategory;
  groupCount: number;
  protectionType: ProtectionType;
  breakerRating: number;
};

export type TraceItem = {
  table: string;
  row: string;
  column: string;
  value: number;
  explanation: string;
};

export type CalculationResult = {
  izTable: string;
  groupingTable: string;
  groupingRow: string;
  spacingCategory: string;
  iz: number;
  temperatureFactor: number;
  groupingFactor: number;
  groundFactor: number;
  correctedPerCable: number;
  correctedTotal: number;
  i2: number;
  breakerPass: boolean;
  inPass: boolean;
  i2Pass: boolean;
  message: string;
  trace: TraceItem[];
};
